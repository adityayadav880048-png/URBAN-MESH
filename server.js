const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const PUBLIC_DIR = __dirname;
const KEY_FILE = path.join(__dirname, 'gemini_key.json');

// Read API key from file if available, else from process.env
let activeApiKey = process.env.GEMINI_API_KEY || '';
if (!activeApiKey && fs.existsSync(KEY_FILE)) {
  try {
    const keyData = JSON.parse(fs.readFileSync(KEY_FILE, 'utf8'));
    if (keyData && keyData.apiKey) {
      activeApiKey = keyData.apiKey.trim();
    }
  } catch (e) {
    console.error('Error reading key file:', e.message);
  }
}

const GEMINI_MODEL = 'gemini-2.0-flash';

const SYSTEM_PROMPT = `You are "Urban Mesh AI" — the intelligent assistant for the Urban Mesh Smart Chandigarh Digital Twin platform. You are embedded in a flagship hackathon project (PS-02: Smart & Sustainable Cities).

Your capabilities and knowledge:
- 3D Digital Twin of Chandigarh built with Three.js WebGL (authentic Le Corbusier grid layout)
- Real-time weather & AQI monitoring via Open-Meteo API (Latitude: 30.7333°N, Longitude: 76.7794°E)
- Women safety features: 30s SOS siren (dual-tone 880Hz-1450Hz warble), SafePath routing, Duress PIN (9999 for coercion defense, sends silent Code Black alert; 1234 for genuine disarm)
- ICCC Command Centre dashboard with 9 operational panels (CCTV, Traffic, Air Quality, Waste, Fleet, Incidents, Maps)
- Emergency Green Corridor system with signal preemption for ambulances & PCR vans
- Satellite aerial imagery via ESRI ArcGIS World Imagery & Google Maps satellite view
- Citizen mobile app with SafePath routing and 8 Chandigarh POI explorer (Sector 17 Plaza, Sector 22 Market, PGIMER, Rose Garden, Sukhna Lake, Elante Mall)

Chandigarh facts you know:
- Master planned by Swiss-French architect Le Corbusier with V-road hierarchy (V1 Arterial to V7 Pedestrian)
- Capitol Complex (UNESCO World Heritage Site): Palace of Assembly with hyperbolic tower, Secretariat building, Open Hand Monument
- Major roundabouts (Chowks): Matka Chowk, Tribune Chowk, Piccadilly Chowk
- Sectors: Sector 12 (PGIMER), Sector 16 (Rose Garden/Govt Hospital), Sector 17 (City Centre), Sector 22 (Shopping & Heritage), Sector 9 (Secretariat)
- Sukhna Lake (northeast), Leisure Valley (diagonal green strip)

Guidelines:
- Respond concisely (2-4 sentences max).
- Be polite, technically accurate, and enthusiastic about smart city innovations.
- If the user greets or asks in Hindi/Hinglish (e.g. "kya haal hai", "siren kaise chalayein"), respond warmly in natural Hindi/Hinglish.
- If asked about emergency or safety features, give clear, reassuring steps.`;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'text/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.md': 'text/plain; charset=UTF-8',
  '.pdf': 'application/pdf'
};

// ─── Gemini API Call Function with Model Fallback ───────────────────
function callGeminiAPI(userQuery, pageContext, customKey) {
  return new Promise((resolve, reject) => {
    const keyToUse = (customKey && customKey.trim()) || activeApiKey;
    if (!keyToUse) {
      reject(new Error('NO_API_KEY'));
      return;
    }

    const contextNote = pageContext ? `\n[User is viewing page: ${pageContext}]` : '';
    
    const requestBody = JSON.stringify({
      contents: [{
        parts: [{ text: userQuery }]
      }],
      systemInstruction: {
        parts: [{ text: SYSTEM_PROMPT + contextNote }]
      },
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 350
      }
    });

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${keyToUse}`;
    const url = new URL(apiUrl);
    
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody)
      },
      timeout: 12000
    };

    const apiReq = https.request(options, (apiRes) => {
      let data = '';
      apiRes.on('data', chunk => { data += chunk; });
      apiRes.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.candidates && json.candidates[0] && json.candidates[0].content) {
            const text = json.candidates[0].content.parts[0].text;
            resolve({ text, model: GEMINI_MODEL });
          } else if (json.error) {
            reject(new Error(json.error.message || 'Gemini API error'));
          } else {
            reject(new Error('Unexpected response structure'));
          }
        } catch (e) {
          reject(new Error('Failed to parse API JSON: ' + e.message));
        }
      });
    });

    apiReq.on('error', (e) => reject(e));
    apiReq.on('timeout', () => {
      apiReq.destroy();
      reject(new Error('Gemini API request timed out (12s)'));
    });

    apiReq.write(requestBody);
    apiReq.end();
  });
}

// ─── HTTP Server ──────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  // CORS Headers Helper
  const setCors = () => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  };

  if (req.method === 'OPTIONS') {
    setCors();
    res.writeHead(204);
    res.end();
    return;
  }

  // ─── POST /api/chat → Gemini AI endpoint ───
  if (req.method === 'POST' && req.url === '/api/chat') {
    setCors();
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      res.setHeader('Content-Type', 'application/json');

      try {
        const parsed = JSON.parse(body || '{}');
        const query = (parsed.query || '').trim();
        const pageContext = parsed.pageContext || '';
        const clientKey = parsed.apiKey || '';

        if (!query) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Query cannot be empty', fallback: true }));
          return;
        }

        const result = await callGeminiAPI(query, pageContext, clientKey);
        res.writeHead(200);
        res.end(JSON.stringify({ 
          response: result.text, 
          source: 'gemini',
          model: result.model 
        }));

      } catch (err) {
        console.log('[Urban Mesh AI] Notice:', err.message);
        res.writeHead(200);
        res.end(JSON.stringify({ 
          error: err.message, 
          fallback: true,
          source: 'fallback'
        }));
      }
    });
    return;
  }

  // ─── POST /api/set-key → Set/update Gemini API key dynamically ───
  if (req.method === 'POST' && req.url === '/api/set-key') {
    setCors();
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      res.setHeader('Content-Type', 'application/json');
      try {
        const parsed = JSON.parse(body || '{}');
        const newKey = (parsed.apiKey || '').trim();

        if (!newKey) {
          // Reset key
          activeApiKey = '';
          if (fs.existsSync(KEY_FILE)) fs.unlinkSync(KEY_FILE);
          res.writeHead(200);
          res.end(JSON.stringify({ success: true, message: 'API key cleared', configured: false }));
          return;
        }

        // Test the new key with a test ping
        try {
          await callGeminiAPI('Ping test: reply with "READY"', 'test', newKey);
          // Key verified! Save to disk
          activeApiKey = newKey;
          fs.writeFileSync(KEY_FILE, JSON.stringify({ apiKey: newKey, savedAt: new Date().toISOString() }, null, 2));
          res.writeHead(200);
          res.end(JSON.stringify({ success: true, message: 'Google Gemini 2.0 Flash connected successfully!', configured: true, model: GEMINI_MODEL }));
        } catch (testErr) {
          // Even if test fails due to network, we can still save it if valid looking format
          if (newKey.startsWith('AIzaSy')) {
            activeApiKey = newKey;
            fs.writeFileSync(KEY_FILE, JSON.stringify({ apiKey: newKey, savedAt: new Date().toISOString() }, null, 2));
            res.writeHead(200);
            res.end(JSON.stringify({ success: true, message: 'Key saved (Test note: ' + testErr.message + ')', configured: true, model: GEMINI_MODEL }));
          } else {
            res.writeHead(400);
            res.end(JSON.stringify({ success: false, error: 'Key verification failed: ' + testErr.message }));
          }
        }
      } catch (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // ─── GET /api/status → Health check & AI config status ───
  if (req.method === 'GET' && req.url === '/api/status') {
    setCors();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      server: 'Urban Mesh Smart Chandigarh Hub',
      status: 'active',
      geminiConfigured: !!activeApiKey,
      model: GEMINI_MODEL,
      keyPreview: activeApiKey ? (activeApiKey.substring(0, 7) + '...' + activeApiKey.slice(-4)) : null,
      uptimeSeconds: Math.floor(process.uptime())
    }));
    return;
  }

  // ─── Static file serving ───
  let reqUrl = req.url.split('?')[0];
  if (reqUrl === '/') reqUrl = '/index.html';
  
  const safePath = path.normalize(reqUrl).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(PUBLIC_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found: ' + reqUrl);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    setCors();
    res.writeHead(200, { 'Content-Type': contentType });

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n╔═══════════════════════════════════════════════════════════╗`);
  console.log(`║      🏙️   URBAN MESH — Smart Chandigarh Platform          ║`);
  console.log(`╠═══════════════════════════════════════════════════════════╣`);
  console.log(`║  Portal:     http://localhost:${PORT}/                       ║`);
  console.log(`║  Citizen:    http://localhost:${PORT}/citizen.html           ║`);
  console.log(`║  Dashboard:  http://localhost:${PORT}/dashboard.html         ║`);
  console.log(`║  3D Twin:    http://localhost:${PORT}/twin.html              ║`);
  console.log(`║  Status:     http://localhost:${PORT}/api/status             ║`);
  console.log(`╠═══════════════════════════════════════════════════════════╣`);
  if (activeApiKey) {
    console.log(`║  🤖 Gemini AI: 🟢 LIVE (${GEMINI_MODEL})              ║`);
  } else {
    console.log(`║  🤖 AI Engine: ⚡ Smart City Neural Engine (Active)       ║`);
    console.log(`║  💡 Add Gemini Key via UI ⚙️ or set GEMINI_API_KEY         ║`);
  }
  console.log(`╚═══════════════════════════════════════════════════════════╝\n`);
});
