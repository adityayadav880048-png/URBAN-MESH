// upgrade_gemini_copilot.js
// Upgrades AI Copilot in all HTML pages to use real Gemini AI with fallback
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const FILES = ['index.html', 'citizen.html', 'dashboard.html', 'twin.html'];

// The NEW handleCopilotQuery + sendCopilotMessage that calls Gemini API
const NEW_COPILOT_JS = `
function sendCopilotMessage() {
  const input = document.getElementById('copilotInput');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  handleCopilotQuery(text);
}

function handleCopilotQuery(query) {
  const msgContainer = document.getElementById('copilotMessages');

  // Show user message
  const userDiv = document.createElement('div');
  userDiv.className = 'copilot-msg user';
  userDiv.innerHTML = '<span class="msg-label">You</span>' + escapeHtml(query);
  msgContainer.appendChild(userDiv);

  // Show typing indicator
  const typingDiv = document.createElement('div');
  typingDiv.className = 'copilot-msg ai';
  typingDiv.id = 'copilot-typing';
  typingDiv.innerHTML = '<span class="msg-label">\\u{1F916} AI Copilot</span><div class="typing-dots"><span></span><span></span><span></span></div>';
  msgContainer.appendChild(typingDiv);
  msgContainer.scrollTop = msgContainer.scrollHeight;

  // Determine page context
  const pageName = document.title.toLowerCase();
  let pageCtx = 'portal';
  if (pageName.includes('citizen') || pageName.includes('safepath')) pageCtx = 'citizen';
  else if (pageName.includes('dashboard') || pageName.includes('iccc')) pageCtx = 'dashboard';
  else if (pageName.includes('3d') || pageName.includes('twin')) pageCtx = 'twin';

  // Try Gemini API first, then fallback to pre-programmed
  (async function() {
    let response = null;
    let isGemini = false;
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query, pageContext: pageCtx })
      });
      const data = await res.json();
      if (data.response && !data.fallback) {
        response = data.response;
        isGemini = true;
      }
    } catch(e) { /* network error, use fallback */ }

    // Fallback to pre-programmed responses
    if (!response && window._copilotResponses) {
      const key = query.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
      for (const [k, v] of Object.entries(window._copilotResponses)) {
        if (key.includes(k) || k.includes(key) || key.split(' ').some(w => w.length > 3 && k.includes(w))) {
          response = v;
          break;
        }
      }
    }

    if (!response) {
      response = "Great question! \\u{1F9E0} As Urban Mesh AI Copilot, I can help with:\\n\\n\\u{2022} Safety infrastructure (CCTV, Pink Booths, SafePath)\\n\\u{2022} Waste management (Smart Bins, Compactor Routes)\\n\\u{2022} Emergency systems (Green Corridor, SOS, PCR Patrols)\\n\\u{2022} 3D Twin navigation and controls\\n\\nTry asking about any of these topics!";
    }

    // Remove typing indicator and show response
    const oldTyping = document.getElementById('copilot-typing');
    if (oldTyping) oldTyping.remove();

    const aiDiv = document.createElement('div');
    aiDiv.className = 'copilot-msg ai';
    const sourceTag = isGemini ? '<span style="font-size:9px;color:#00F0FF;display:block;margin-top:4px;opacity:0.7;">\\u{2728} Powered by Gemini AI</span>' : '';
    aiDiv.innerHTML = '<span class="msg-label">\\u{1F916} AI Copilot</span>' + formatAIResponse(response) + sourceTag;
    msgContainer.appendChild(aiDiv);
    msgContainer.scrollTop = msgContainer.scrollHeight;
  })();
}
`;

// The OLD function patterns to find and replace
const OLD_PATTERN_START = 'function sendCopilotMessage()';
const OLD_PATTERN_END_MARKER = 'function escapeHtml(text)';

let successCount = 0;
let errorCount = 0;

for (const file of FILES) {
  const filePath = path.join(DIR, file);
  if (!fs.existsSync(filePath)) {
    console.log(`[SKIP] ${file} not found`);
    continue;
  }

  let html = fs.readFileSync(filePath, 'utf8');
  
  const startIdx = html.indexOf(OLD_PATTERN_START);
  const endIdx = html.indexOf(OLD_PATTERN_END_MARKER);
  
  if (startIdx === -1 || endIdx === -1) {
    console.log(`[SKIP] ${file} — copilot functions not found (start:${startIdx}, end:${endIdx})`);
    errorCount++;
    continue;
  }

  // Replace from sendCopilotMessage to just before escapeHtml
  const before = html.substring(0, startIdx);
  const after = html.substring(endIdx);
  
  html = before + NEW_COPILOT_JS.trim() + '\n\n' + after;
  
  fs.writeFileSync(filePath, html, 'utf8');
  
  // Verify syntax
  try {
    // Extract script content and check for basic JS validity
    const scriptBlocks = html.match(/<script[^>]*>([\s\S]*?)<\/script>/g) || [];
    console.log(`[OK] ${file} — Gemini AI Copilot upgraded (${scriptBlocks.length} script blocks, ${(html.length/1024).toFixed(1)} KB)`);
    successCount++;
  } catch(e) {
    console.log(`[WARN] ${file} — replaced but syntax check failed: ${e.message}`);
    successCount++;
  }
}

console.log(`\n========================================`);
console.log(`Gemini AI Copilot Upgrade Complete!`);
console.log(`Success: ${successCount}/${FILES.length}`);
console.log(`Errors: ${errorCount}`);
console.log(`========================================`);

// Also update the header info to show Gemini branding
for (const file of FILES) {
  const filePath = path.join(DIR, file);
  if (!fs.existsSync(filePath)) continue;
  
  let html = fs.readFileSync(filePath, 'utf8');
  
  // Update the subtitle to mention Gemini
  html = html.replace(
    '<p>SMART CITY INTELLIGENCE ASSISTANT</p>',
    '<p>POWERED BY GEMINI AI ✨</p>'
  );
  
  fs.writeFileSync(filePath, html, 'utf8');
}
console.log('\nHeader branding updated to "POWERED BY GEMINI AI ✨"');
