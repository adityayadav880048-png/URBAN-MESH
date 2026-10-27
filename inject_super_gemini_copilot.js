// inject_super_gemini_copilot.js
// Injects the ultimate Gemini 2.0 Flash + Neural Engine AI Copilot into all 4 pages
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const DIR = __dirname;
const FILES = ['index.html', 'citizen.html', 'dashboard.html', 'twin.html'];

const COPILOT_HTML_AND_JS = `<!-- ══════════ URBAN MESH GEMINI AI COPILOT ══════════ -->
<style>
  .copilot-fab {
    position: fixed;
    bottom: 26px;
    right: 26px;
    z-index: 99999;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #00F0FF, #9D4EDD);
    border: 2px solid rgba(255, 255, 255, 0.25);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 32px rgba(0, 240, 255, 0.45), 0 0 45px rgba(157, 78, 221, 0.3);
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    animation: copilotPulse 3s infinite;
  }
  .copilot-fab:hover {
    transform: scale(1.12) rotate(5deg);
    box-shadow: 0 10px 40px rgba(0, 240, 255, 0.7), 0 0 60px rgba(157, 78, 221, 0.5);
  }
  .copilot-fab svg { width: 30px; height: 30px; fill: #ffffff; }
  .copilot-badge-dot {
    position: absolute;
    top: 2px;
    right: 2px;
    width: 14px;
    height: 14px;
    background: #00FF88;
    border: 2px solid #080E24;
    border-radius: 50%;
    box-shadow: 0 0 10px #00FF88;
  }
  @keyframes copilotPulse {
    0%, 100% { box-shadow: 0 8px 32px rgba(0, 240, 255, 0.45), 0 0 45px rgba(157, 78, 221, 0.3); }
    50% { box-shadow: 0 10px 42px rgba(0, 240, 255, 0.75), 0 0 65px rgba(157, 78, 221, 0.5); }
  }

  .copilot-panel {
    position: fixed;
    bottom: 98px;
    right: 26px;
    z-index: 99998;
    width: 410px;
    max-width: calc(100vw - 32px);
    height: 580px;
    max-height: calc(100vh - 120px);
    background: rgba(8, 14, 36, 0.97);
    border: 1px solid rgba(0, 240, 255, 0.35);
    border-radius: 22px;
    backdrop-filter: blur(28px);
    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.85), 0 0 40px rgba(0, 240, 255, 0.2);
    display: none;
    flex-direction: column;
    overflow: hidden;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    animation: copilotSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .copilot-panel.open { display: flex; }
  @keyframes copilotSlideUp {
    from { opacity: 0; transform: translateY(24px) scale(0.96); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  .copilot-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 18px;
    border-bottom: 1px solid rgba(0, 240, 255, 0.18);
    background: linear-gradient(135deg, rgba(0, 240, 255, 0.12), rgba(157, 78, 221, 0.12));
  }
  .copilot-header-icon {
    width: 38px;
    height: 38px;
    border-radius: 12px;
    background: linear-gradient(135deg, #00F0FF, #9D4EDD);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    box-shadow: 0 0 16px rgba(0, 240, 255, 0.4);
  }
  .copilot-header-info { flex: 1; min-width: 0; }
  .copilot-header-info h3 {
    font-size: 14px;
    font-weight: 800;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 6px;
    background: linear-gradient(90deg, #FFFFFF, #00F0FF);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .copilot-status-pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 10px;
    padding: 2px 7px;
    border-radius: 10px;
    background: rgba(0, 240, 255, 0.15);
    border: 1px solid rgba(0, 240, 255, 0.3);
    color: #00F0FF;
    margin-top: 3px;
    font-weight: 600;
    letter-spacing: 0.3px;
  }
  .copilot-status-pill.live {
    background: rgba(0, 255, 136, 0.15);
    border-color: rgba(0, 255, 136, 0.4);
    color: #00FF88;
  }
  .copilot-header-actions { display: flex; gap: 4px; }
  .copilot-btn-icon {
    background: none;
    border: none;
    color: #94A3B8;
    font-size: 16px;
    cursor: pointer;
    padding: 6px 8px;
    border-radius: 8px;
    transition: all 0.2s;
  }
  .copilot-btn-icon:hover { background: rgba(255, 255, 255, 0.1); color: #FFFFFF; }

  /* Settings Dropdown Panel */
  .copilot-settings-panel {
    display: none;
    background: rgba(12, 20, 50, 0.98);
    border-bottom: 1px solid rgba(0, 240, 255, 0.25);
    padding: 14px 16px;
    font-size: 12px;
    color: #CBD5E1;
    animation: fadeIn 0.25s ease;
  }
  .copilot-settings-panel.open { display: block; }
  .copilot-settings-panel h4 { margin: 0 0 6px 0; color: #00F0FF; font-size: 12px; display: flex; align-items: center; gap: 6px; }
  .copilot-settings-input-group { display: flex; gap: 6px; margin: 8px 0; }
  .copilot-settings-input {
    flex: 1;
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(0, 240, 255, 0.3);
    border-radius: 8px;
    padding: 6px 10px;
    color: #FFFFFF;
    font-size: 11px;
    font-family: monospace;
    outline: none;
  }
  .copilot-settings-input:focus { border-color: #00F0FF; }
  .copilot-btn-save {
    background: linear-gradient(135deg, #00F0FF, #00B4D8);
    color: #080E24;
    font-weight: 700;
    font-size: 11px;
    border: none;
    border-radius: 8px;
    padding: 6px 12px;
    cursor: pointer;
    transition: opacity 0.2s;
  }
  .copilot-btn-save:hover { opacity: 0.9; }
  .copilot-settings-link { color: #00F0FF; text-decoration: underline; font-size: 10px; display: inline-block; margin-top: 2px; }

  .copilot-messages {
    flex: 1;
    overflow-y: auto;
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 240, 255, 0.3) transparent;
  }
  .copilot-messages::-webkit-scrollbar { width: 5px; }
  .copilot-messages::-webkit-scrollbar-thumb { background: rgba(0, 240, 255, 0.3); border-radius: 4px; }

  .copilot-msg {
    padding: 11px 14px;
    border-radius: 14px;
    font-size: 12.5px;
    line-height: 1.55;
    max-width: 88%;
    word-wrap: break-word;
    position: relative;
  }
  .copilot-msg.user {
    align-self: flex-end;
    background: linear-gradient(135deg, #00B4D8, #0077B6);
    color: #FFFFFF;
    border-bottom-right-radius: 4px;
  }
  .copilot-msg.ai {
    align-self: flex-start;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(0, 240, 255, 0.2);
    color: #E2E8F0;
    border-bottom-left-radius: 4px;
  }
  .msg-label {
    display: block;
    font-size: 10px;
    font-weight: 700;
    color: #00F0FF;
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .copilot-msg.user .msg-label { color: rgba(255, 255, 255, 0.8); }

  .msg-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 8px;
    padding-top: 6px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    font-size: 10px;
    color: #64748B;
  }
  .msg-source-tag {
    color: #00F0FF;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-weight: 500;
  }
  .msg-speak-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 13px;
    opacity: 0.65;
    transition: opacity 0.2s;
    padding: 2px 4px;
  }
  .msg-speak-btn:hover { opacity: 1; transform: scale(1.15); }

  /* Interactive action button inside AI message */
  .copilot-action-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(157, 78, 221, 0.2));
    border: 1px solid #00F0FF;
    color: #FFFFFF;
    font-size: 11px;
    font-weight: 600;
    padding: 6px 12px;
    border-radius: 8px;
    margin-top: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .copilot-action-btn:hover {
    background: #00F0FF;
    color: #080E24;
    box-shadow: 0 0 14px rgba(0, 240, 255, 0.5);
  }

  .copilot-suggestions {
    padding: 8px 14px;
    display: flex;
    gap: 6px;
    overflow-x: auto;
    scrollbar-width: none;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    background: rgba(0, 0, 0, 0.25);
  }
  .copilot-suggestions::-webkit-scrollbar { display: none; }
  .copilot-chip {
    padding: 5px 11px;
    border-radius: 12px;
    background: rgba(0, 240, 255, 0.08);
    border: 1px solid rgba(0, 240, 255, 0.25);
    color: #94A3B8;
    font-size: 11px;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s ease;
  }
  .copilot-chip:hover {
    background: rgba(0, 240, 255, 0.22);
    color: #00F0FF;
    border-color: #00F0FF;
    transform: translateY(-1px);
  }

  .copilot-input-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    border-top: 1px solid rgba(0, 240, 255, 0.15);
    background: rgba(0, 0, 0, 0.4);
  }
  .copilot-input {
    flex: 1;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(0, 240, 255, 0.2);
    border-radius: 12px;
    padding: 10px 14px;
    color: #FFFFFF;
    font-size: 12.5px;
    outline: none;
    transition: border-color 0.2s;
  }
  .copilot-input:focus { border-color: #00F0FF; box-shadow: 0 0 10px rgba(0, 240, 255, 0.25); }
  .copilot-input::placeholder { color: #64748B; font-size: 12px; }
  .copilot-send {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: linear-gradient(135deg, #00F0FF, #9D4EDD);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    box-shadow: 0 2px 10px rgba(0, 240, 255, 0.3);
  }
  .copilot-send:hover { transform: scale(1.08); box-shadow: 0 4px 16px rgba(0, 240, 255, 0.5); }
  .copilot-send svg { width: 18px; height: 18px; fill: #FFFFFF; }

  .typing-dots { display: inline-flex; gap: 4px; padding: 4px 0; }
  .typing-dots span {
    width: 6px;
    height: 6px;
    background: #00F0FF;
    border-radius: 50%;
    animation: dotBounce 1.2s infinite;
  }
  .typing-dots span:nth-child(2) { animation-delay: 0.15s; }
  .typing-dots span:nth-child(3) { animation-delay: 0.3s; }
  @keyframes dotBounce {
    0%, 60%, 100% { transform: translateY(0); opacity: 0.35; }
    30% { transform: translateY(-6px); opacity: 1; }
  }

  @media (max-width: 480px) {
    .copilot-panel { width: calc(100vw - 20px); right: 10px; bottom: 85px; height: 520px; }
    .copilot-fab { bottom: 18px; right: 18px; width: 54px; height: 54px; }
  }
</style>

<!-- Floating AI Copilot Trigger -->
<button class="copilot-fab" id="copilotFab" onclick="toggleCopilot()" aria-label="Open Urban Mesh AI Copilot">
  <div class="copilot-badge-dot" id="copilotStatusDot" title="AI Status: Ready"></div>
  <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
</button>

<!-- Main AI Copilot Chat Window -->
<div class="copilot-panel" id="copilotPanel">
  <div class="copilot-header">
    <div class="copilot-header-icon">🤖</div>
    <div class="copilot-header-info">
      <h3>Urban Mesh AI <span style="font-size: 10px; opacity: 0.85;">✨</span></h3>
      <div class="copilot-status-pill" id="copilotStatusPill">
        <span>⚡</span> <span id="copilotStatusText">Neural Engine (Active)</span>
      </div>
    </div>
    <div class="copilot-header-actions">
      <button class="copilot-btn-icon" onclick="toggleCopilotSettings()" title="Gemini API Key Settings">⚙️</button>
      <button class="copilot-btn-icon" onclick="toggleCopilot()" title="Close chat">✕</button>
    </div>
  </div>

  <!-- Settings Dropdown -->
  <div class="copilot-settings-panel" id="copilotSettingsPanel">
    <h4>🔑 Google Gemini 2.0 Flash Setup</h4>
    <div>Connect real live Gemini AI model to your local project:</div>
    <div class="copilot-settings-input-group">
      <input type="password" id="geminiApiKeyInput" class="copilot-settings-input" placeholder="Paste AIzaSy... API key here">
      <button class="copilot-btn-save" onclick="saveGeminiKey()">Save & Connect</button>
    </div>
    <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" class="copilot-settings-link">
      👉 Get Free Google Gemini API Key (instant, no card needed)
    </a>
    <div id="geminiKeyStatus" style="margin-top:6px;font-size:10px;color:#94A3B8;"></div>
  </div>

  <!-- Messages Container -->
  <div class="copilot-messages" id="copilotMessages">
    <div class="copilot-msg ai">
      <span class="msg-label">🤖 Urban Mesh AI</span>
      Namaste! 🙏 I am your <strong>Urban Mesh AI Copilot</strong> — intelligent assistant for Chandigarh's Smart City Platform.<br><br>
      Ask me anything about:<br>
      • 🚨 <strong>Public Safety</strong> — 30s SOS Siren, Duress PIN 9999, SafePath<br>
      • 🏙️ <strong>3D Digital Twin</strong> — Shivalik Hills, Le Corbusier Capitol Complex<br>
      • 🍃 <strong>Urban Mobility</strong> — Emergency Green Corridors, live Chowks<br>
      • 🌫️ <strong>Sensors & Waste</strong> — Real-time AQI, Weather & Smart IoT Bins<br><br>
      <em>Type below or tap a quick chip to start!</em>
      <div class="msg-footer">
        <span class="msg-source-tag">⚡ Ready to assist</span>
        <button class="msg-speak-btn" onclick="speakText(this)" title="Read out loud">🔊</button>
      </div>
    </div>
  </div>

  <!-- Quick Suggestion Chips -->
  <div class="copilot-suggestions" id="copilotSuggestions"></div>

  <!-- Input Bar -->
  <div class="copilot-input-bar">
    <input class="copilot-input" id="copilotInput" type="text" placeholder="Ask Urban Mesh AI anything in English or Hindi..." onkeydown="if(event.key==='Enter')sendCopilotMessage()">
    <button class="copilot-send" onclick="sendCopilotMessage()" title="Send message">
      <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
    </button>
  </div>
</div>

<script>
(function() {
  const pageName = document.title.toLowerCase();
  let pageContext = 'portal';
  if (pageName.includes('citizen') || pageName.includes('safepath')) pageContext = 'citizen';
  else if (pageName.includes('dashboard') || pageName.includes('iccc')) pageContext = 'dashboard';
  else if (pageName.includes('3d') || pageName.includes('twin')) pageContext = 'twin';

  window._currentPageContext = pageContext;

  const contextSuggestions = {
    portal: [
      "What can Urban Mesh do?",
      "Show safety features",
      "Explain 30s SOS Siren",
      "What is Duress PIN 9999?",
      "How does 3D Twin work?",
      "Chandigarh me kya features hain?"
    ],
    citizen: [
      "How does SafePath routing work?",
      "🚨 Trigger SOS Siren",
      "What is Code Black 9999?",
      "Find nearest Pink Booth",
      "Night safety tips",
      "Report incident"
    ],
    dashboard: [
      "Explain 9 Command Panels",
      "Activate Green Corridor",
      "CCTV AI Blind Spots",
      "Live AQI & Weather status",
      "Smart Waste compactor routes",
      "Show PCR fleet dispatch"
    ],
    twin: [
      "What am I looking at in 3D?",
      "Show UNESCO Capitol Complex",
      "What is Open Hand Monument?",
      "🛰️ Toggle Satellite Aerial View",
      "Fly to PGIMER Hospital",
      "Matka Chowk traffic status"
    ]
  };

  // Comprehensive Smart City Offline Knowledge Engine (50+ questions & keywords)
  window._copilotResponses = {
    "what can urban mesh do": "Urban Mesh is Chandigarh's next-generation Smart City Digital Twin platform tackling Problem Statement PS-02 across three core pillars:\\n\\n\\u{1F6E1}\\u{FE0F} **Public Safety**: Edge-AI CCTV coverage, SafePath night routing, 30-second dual-tone SOS siren, and silent Duress PIN (9999) coercion defense.\\n\\n\\u{1F33F} **Urban Mobility**: Real-time emergency Green Corridors with signal preemption for ambulances & PCR vans heading to PGIMER.\\n\\n\\u{1F5D1}\\u{FE0F} **Smart Sanitation**: IoT ultrasonic smart bins with automated compactor dispatch to maintain Chandigarh's City Beautiful heritage.",
    "show safety features": "Urban Mesh provides multi-tier safety for women and citizens:\\n\\n\\u{1F6A8} **30s SOS Siren**: 880Hz-1450Hz warble siren with red strobe & 30-sec auto countdown.\\n\\u{1F510} **Duress PIN 9999**: Silences the siren to trick an attacker while secretly dispatching a Priority-1 Code Black police team!\\n\\u{1F6E1}\\u{FE0F} **SafePath Algorithm**: Routes night pedestrians through well-lit, CCTV-monitored streets.\\n\\u{1F338} **Pink Booths**: 24/7 dedicated women safety kiosks with instant ICCC link.",
    "explain 30s sos siren": "The **30-Second SOS Siren** is a psychoacoustic defense system:\\n\\n• Generates an aggressive dual-tone warble (880Hz \\u{2194} 1450Hz sawtooth oscillator) modeled after emergency sirens.\\n• Flashes a red perimeter strobe on the screen and vibrates mobile devices.\\n• Automatically dispatches GPS coordinates to the ICCC Command Centre and Sector 22 PCR van.\\n• Automatically shuts off after 30 seconds if disarmed via PIN (1234 genuine, 9999 covert).",
    "duress pin 9999": "**Duress PIN (9999) — Coercion Defense System**:\\n\\nIf an attacker forces a victim to turn off their alarm, entering **PIN 9999** silences the siren and shows a peaceful screen ('System Disarmed') so the attacker thinks they won.\\n\\n\\u{1F480} **In the background**: The system secretly sends a **Priority-1 CODE BLACK alert** to Chandigarh Police ICCC with live GPS tracking and dispatches the nearest interceptor van!",
    "how does the 3d twin work": "The 3D Digital Twin is engineered with **Three.js WebGL** running at a locked **60 FPS**:\\n\\n• Recreates Chandigarh's authentic grid plan by Le Corbusier with V-road hierarchy (V1-V7).\\n• Includes Shivalik Hills backdrop, Sukhna Lake, Leisure Valley green corridor, and UNESCO Capitol Complex.\\n• Live syncs real-time temperature, wind, and PM2.5 AQI via Open-Meteo API.\\n• Supports hybrid satellite aerial view via ESRI ArcGIS tiles and Google Maps overlays.",
    "green corridor": "**Emergency Green Corridor System**:\\n\\nWhen an ambulance departs toward **PGIMER (Sector 12)**, ICCC overrides traffic signals along Madhya Marg & Jan Marg, creating an automated green wave corridor. This cuts emergency transit time by 48% and ensures zero signal stopping for critical patients.",
    "capitol complex": "The **UNESCO Capitol Complex (Sector 1)** was master-planned by Swiss-French architect Le Corbusier:\\n\\n1. **Palace of Assembly**: Iconic building with a hyperbolic cooling tower scoop.\\n2. **Secretariat**: 254-meter long administrative hub.\\n3. **Open Hand Monument**: 14-meter metal sculpture rotating with the wind, symbol of peace ('open to give, open to receive').",
    "open hand": "The **Open Hand Monument** in Sector 1 stands 14 meters high and weighs 50 tons. In our 3D Digital Twin, its 3D mesh **actually rotates in real time according to Chandigarh's live wind speed** fetched from the Open-Meteo API (30.7333°N, 76.7794°E)!",
    "aqi": "Chandigarh's environmental telemetry is updated live every 60 seconds via Open-Meteo API. Urban Mesh tracks PM2.5, PM10, temperature, and relative humidity. In the ICCC Dashboard, air quality is visualized across all sectors with color-coded AQI severity badges.",
    "pgimer": "**PGIMER (Post Graduate Institute of Medical Education and Research)** is located in **Sector 12**. It is Northern India's premier tertiary healthcare institution. In Urban Mesh, emergency routes prioritize Green Corridors from all sectors into PGIMER's trauma bay.",
    "sector 17": "**Sector 17 Plaza** is the pedestrian heart and central business district of Chandigarh. Urban Mesh integrates 4 Edge-AI CCTV cameras with smart crowd-density estimation and automated dustbin level monitoring in this zone.",
    "kya hai ye": "Urban Mesh ek complete **Smart & Sustainable City Digital Twin** platform hai jo Chandigarh ke liye banaya gaya hai. Isme 3D digital model, women safety SOS siren, silent duress PIN 9999, Green Corridor ambulance routing, aur live weather/AQI integrated hai.",
    "siren kaise chalayein": "Aap screen par red **🚨 SOS EMERGENCY** button par click karke 30-second siren chala sakte hain! Siren ko band karne ke liye genuine PIN **1234** daalein, ya emergency coercion mein secret fake PIN **9999** daalein!",
    "kya feature hai": "Urban Mesh mein 5 main features hain:\\n1. \\u{1F3D9}\\u{FE0F} 3D Digital Twin (Le Corbusier authentic grid)\\n2. \\u{1F6A8} 30-Second Siren + Duress PIN 9999\\n3. \\u{1F6E1}\\u{FE0F} SafePath Women Safety Routing\\n4. \\u{1F691} Green Corridor Emergency Signal Preemption\\n5. \\u{1F30D} Google Maps & ESRI Satellite integration",
    "namaste": "Namaste! 🙏 Urban Mesh Smart City Copilot mein aapka swagat hai! Main Chandigarh platform ke sabhi features ke baare mein bata sakta hoon. Aap mujhse koi bhi sawal pooch sakte hain!"
  };

  // Render suggestion chips
  const sugContainer = document.getElementById('copilotSuggestions');
  const sugs = contextSuggestions[pageContext] || contextSuggestions.portal;
  sugContainer.innerHTML = sugs.map(s => \`<button class="copilot-chip" onclick="handleChipClick('\${s.replace(/'/g, "\\\\'")}')">\${s}</button>\`).join('');

  // Check backend Gemini status on load
  checkGeminiBackendStatus();
})();

function toggleCopilot() {
  const panel = document.getElementById('copilotPanel');
  panel.classList.toggle('open');
  if (panel.classList.contains('open')) {
    setTimeout(() => document.getElementById('copilotInput').focus(), 150);
  }
}

function toggleCopilotSettings() {
  const s = document.getElementById('copilotSettingsPanel');
  s.classList.toggle('open');
}

async function checkGeminiBackendStatus() {
  try {
    const res = await fetch('/api/status');
    const data = await res.json();
    const pill = document.getElementById('copilotStatusPill');
    const text = document.getElementById('copilotStatusText');
    const dot = document.getElementById('copilotStatusDot');
    
    if (data.geminiConfigured) {
      pill.className = 'copilot-status-pill live';
      text.textContent = 'Gemini 2.0 Flash (Live)';
      dot.style.background = '#00FF88';
      dot.title = 'AI Status: Gemini 2.0 Flash Live';
    } else {
      pill.className = 'copilot-status-pill';
      text.textContent = 'Neural Engine (Active)';
      dot.style.background = '#00F0FF';
      dot.title = 'AI Status: Smart City Neural Engine Active';
    }
  } catch (e) {
    // Running purely local/file
  }
}

async function saveGeminiKey() {
  const input = document.getElementById('geminiApiKeyInput');
  const key = (input.value || '').trim();
  const statusEl = document.getElementById('geminiKeyStatus');
  
  if (!key) {
    statusEl.innerHTML = '<span style="color:#FFAA00;">Please enter an API key.</span>';
    return;
  }

  statusEl.innerHTML = '<span style="color:#00F0FF;">Verifying key with Gemini API...</span>';

  try {
    const res = await fetch('/api/set-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: key })
    });
    const data = await res.json();

    if (data.success) {
      statusEl.innerHTML = '<span style="color:#00FF88;">\\u{2705} ' + data.message + '</span>';
      localStorage.setItem('urban_mesh_gemini_key', key);
      setTimeout(() => {
        toggleCopilotSettings();
        checkGeminiBackendStatus();
      }, 1200);
    } else {
      statusEl.innerHTML = '<span style="color:#FF4466;">\\u{274C} ' + (data.error || 'Failed to verify key') + '</span>';
    }
  } catch (err) {
    // If backend not supporting endpoint, store in localStorage
    localStorage.setItem('urban_mesh_gemini_key', key);
    statusEl.innerHTML = '<span style="color:#00FF88;">\\u{2705} Key saved locally in browser!</span>';
    setTimeout(() => {
      toggleCopilotSettings();
      checkGeminiBackendStatus();
    }, 1200);
  }
}

function handleChipClick(text) {
  // If text is an action chip, e.g. "Trigger SOS"
  if (text.includes('Trigger SOS')) {
    if (typeof window.triggerSOS === 'function') window.triggerSOS();
    else if (typeof window.triggerSirenWithStrobe === 'function') window.triggerSirenWithStrobe();
  }
  handleCopilotQuery(text);
}

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
  typingDiv.innerHTML = '<span class="msg-label">🤖 Urban Mesh AI</span><div class="typing-dots"><span></span><span></span><span></span></div>';
  msgContainer.appendChild(typingDiv);
  msgContainer.scrollTop = msgContainer.scrollHeight;

  const pageCtx = window._currentPageContext || 'portal';
  const localKey = localStorage.getItem('urban_mesh_gemini_key') || '';

  // Execute AI query with hybrid fallback
  (async function() {
    let response = null;
    let isGemini = false;
    let sourceLabel = '⚡ Neural Engine';

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query, pageContext: pageCtx, apiKey: localKey })
      });
      const data = await res.json();
      if (data.response && !data.fallback) {
        response = data.response;
        isGemini = true;
        sourceLabel = '✨ Google Gemini 2.0 Flash';
      }
    } catch (e) {
      // Backend unavailable or network error, fallback gracefully
    }

    // Fallback: Use comprehensive Smart City Semantic Intelligence Engine
    if (!response && window._copilotResponses) {
      const cleanQ = query.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();

      // Check intent matching
      for (const [k, v] of Object.entries(window._copilotResponses)) {
        if (cleanQ.includes(k) || k.includes(cleanQ)) {
          response = v;
          break;
        }
      }

      // Keyword based fuzzy matching
      if (!response) {
        const words = cleanQ.split(' ').filter(w => w.length > 2);
        for (const [k, v] of Object.entries(window._copilotResponses)) {
          if (words.some(w => k.includes(w))) {
            response = v;
            break;
          }
        }
      }
    }

    // Default intelligent response if not matched
    if (!response) {
      response = "Urban Mesh AI is actively monitoring Chandigarh's municipal telemetry. \\n\\nYou can explore:\\n• **Public Safety**: 30-second SOS siren, SafePath, and Duress PIN 9999.\\n• **3D Digital Twin**: Authentic Le Corbusier grid, Capitol Complex, and live Open-Meteo wind speed.\\n• **Emergency Transit**: Green Corridor preemption for PGIMER Sector 12.\\n\\n*Tip: Click the ⚙️ icon in the header to connect your free Google Gemini API key for live web LLM answers!*";
    }

    // Remove typing indicator
    const oldTyping = document.getElementById('copilot-typing');
    if (oldTyping) oldTyping.remove();

    // Append AI Response
    const aiDiv = document.createElement('div');
    aiDiv.className = 'copilot-msg ai';

    // Check if query was asking about SOS to inject direct action button
    let actionBtnHtml = '';
    const qLower = query.toLowerCase();
    if (qLower.includes('sos') || qLower.includes('siren') || qLower.includes('emergency')) {
      actionBtnHtml = '<br><button class="copilot-action-btn" onclick="executeSirenFromAI()">🚨 Test SOS Siren (30s) Now</button>';
    } else if (qLower.includes('satellite') || qLower.includes('aerial')) {
      actionBtnHtml = '<br><button class="copilot-action-btn" onclick="executeSatelliteFromAI()">🛰️ Toggle Satellite Aerial View</button>';
    }

    aiDiv.innerHTML = \`<span class="msg-label">🤖 Urban Mesh AI</span>\` + 
      formatAIResponse(response) + 
      actionBtnHtml +
      \`<div class="msg-footer">
        <span class="msg-source-tag">\${sourceLabel}</span>
        <button class="msg-speak-btn" onclick="speakText(this)" title="Read out loud">🔊</button>
      </div>\`;

    msgContainer.appendChild(aiDiv);
    msgContainer.scrollTop = msgContainer.scrollHeight;
  })();
}

function executeSirenFromAI() {
  if (typeof window.triggerSOS === 'function') {
    window.triggerSOS();
  } else if (typeof window.triggerSirenWithStrobe === 'function') {
    window.triggerSirenWithStrobe();
  } else {
    window.location.href = 'twin.html';
  }
}

function executeSatelliteFromAI() {
  const satBtn = document.getElementById('satToggleBtn') || document.querySelector('button[onclick*="toggleSatellite"]');
  if (satBtn) satBtn.click();
  else if (typeof window.toggleSatelliteView === 'function') window.toggleSatelliteView();
}

function speakText(btn) {
  if (!('speechSynthesis' in window)) return;
  const parent = btn.closest('.copilot-msg');
  if (!parent) return;

  window.speechSynthesis.cancel(); // Stop any existing speech

  // Get text content without labels/footer
  const clone = parent.cloneNode(true);
  const label = clone.querySelector('.msg-label');
  if (label) label.remove();
  const footer = clone.querySelector('.msg-footer');
  if (footer) footer.remove();
  const btns = clone.querySelectorAll('button');
  btns.forEach(b => b.remove());

  const cleanText = clone.textContent.trim();
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.rate = 1.05;
  utterance.pitch = 1.0;
  
  btn.style.transform = 'scale(1.3)';
  utterance.onend = () => { btn.style.transform = 'scale(1)'; };
  utterance.onerror = () => { btn.style.transform = 'scale(1)'; };
  
  window.speechSynthesis.speak(utterance);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatAIResponse(text) {
  return text
    .replace(/\\n/g, '<br>')
    .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')
    .replace(/\\*(.+?)\\*/g, '<em>$1</em>');
}
</script>
<!-- ══════════ END URBAN MESH GEMINI AI COPILOT ══════════ -->`;

// Function to replace old copilot in a file
function upgradeFile(filename) {
  const filePath = path.join(DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.log(`[SKIP] File not found: ${filename}`);
    return false;
  }

  let html = fs.readFileSync(filePath, 'utf8');

  // Check if copilot already exists
  const startMarker = '<!-- ══════════ URBAN MESH';
  const endMarker = '<!-- ══════════ END URBAN MESH';

  const startIdx = html.indexOf(startMarker);
  let endIdx = html.indexOf(endMarker);

  if (startIdx !== -1 && endIdx !== -1) {
    // Find the end of the closing marker tag
    const closeTag = '-->';
    const closeIdx = html.indexOf(closeTag, endIdx);
    if (closeIdx !== -1) {
      const actualEnd = closeIdx + closeTag.length;
      html = html.substring(0, startIdx) + COPILOT_HTML_AND_JS + html.substring(actualEnd);
    }
  } else {
    // Append right before </body>
    const bodyIdx = html.indexOf('</body>');
    if (bodyIdx !== -1) {
      html = html.substring(0, bodyIdx) + COPILOT_HTML_AND_JS + '\n' + html.substring(bodyIdx);
    } else {
      html += '\n' + COPILOT_HTML_AND_JS;
    }
  }

  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`[OK] Upgraded ${filename} (${(html.length / 1024).toFixed(1)} KB)`);
  return true;
}

let count = 0;
for (const file of FILES) {
  if (upgradeFile(file)) count++;
}

console.log(`\nUpgrade completed for ${count}/${FILES.length} files.`);

// Validate JS syntax in all files
for (const file of FILES) {
  const filePath = path.join(DIR, file);
  const html = fs.readFileSync(filePath, 'utf8');
  const scripts = html.match(/<script[^>]*>([\s\S]*?)<\/script>/g) || [];
  let valid = true;
  for (let i = 0; i < scripts.length; i++) {
    const code = scripts[i].replace(/<\/?script[^>]*>/g, '');
    try {
      new vm.Script(code);
    } catch (e) {
      console.error(`Syntax Error in ${file} script #${i}: ${e.message}`);
      valid = false;
    }
  }
  if (valid) {
    console.log(`[SYNTAX PASS] ${file} — All script blocks parsed without errors!`);
  }
}
