const fs = require('fs');
const path = require('path');

const DIR = 'C:\\Users\\staro\\.gemini\\antigravity\\scratch\\smart-chandigarh';

// ═══════════════════════════════════════════════════════
// 1. AI COPILOT WIDGET (Injected into every page)
// ═══════════════════════════════════════════════════════

const aiCopilotSnippet = `
<!-- ══════════ URBAN MESH AI COPILOT ══════════ -->
<style>
  .copilot-fab {
    position: fixed;
    bottom: 28px;
    right: 28px;
    z-index: 99999;
    width: 58px;
    height: 58px;
    border-radius: 50%;
    background: linear-gradient(135deg, #00F0FF, #9D4EDD);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 6px 28px rgba(0,240,255,0.45), 0 0 40px rgba(157,78,221,0.25);
    transition: all 0.3s ease;
    animation: copilotPulse 2.5s infinite;
  }
  .copilot-fab:hover { transform: scale(1.12); box-shadow: 0 8px 36px rgba(0,240,255,0.65); }
  .copilot-fab svg { width: 28px; height: 28px; fill: #fff; }
  @keyframes copilotPulse {
    0%,100% { box-shadow: 0 6px 28px rgba(0,240,255,0.45), 0 0 40px rgba(157,78,221,0.25); }
    50% { box-shadow: 0 6px 36px rgba(0,240,255,0.7), 0 0 55px rgba(157,78,221,0.4); }
  }

  .copilot-panel {
    position: fixed;
    bottom: 100px;
    right: 28px;
    z-index: 99998;
    width: 380px;
    max-height: 540px;
    background: rgba(8, 14, 36, 0.96);
    border: 1px solid rgba(0,240,255,0.3);
    border-radius: 20px;
    backdrop-filter: blur(24px);
    box-shadow: 0 20px 60px rgba(0,0,0,0.7), 0 0 30px rgba(0,240,255,0.15);
    display: none;
    flex-direction: column;
    overflow: hidden;
    font-family: 'Inter', -apple-system, sans-serif;
    animation: copilotSlideUp 0.35s ease forwards;
  }
  .copilot-panel.open { display: flex; }
  @keyframes copilotSlideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .copilot-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px 18px;
    border-bottom: 1px solid rgba(0,240,255,0.15);
    background: linear-gradient(135deg, rgba(0,240,255,0.08), rgba(157,78,221,0.08));
  }
  .copilot-header-icon {
    width: 34px; height: 34px; border-radius: 10px;
    background: linear-gradient(135deg, #00F0FF, #9D4EDD);
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
  }
  .copilot-header-info h3 {
    font-size: 14px; font-weight: 800; color: #fff; margin: 0;
    background: linear-gradient(90deg, #fff, #00F0FF);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .copilot-header-info p { font-size: 10px; color: #94A3B8; margin: 2px 0 0; letter-spacing: 0.5px; }
  .copilot-close {
    margin-left: auto; background: none; border: none; color: #94A3B8;
    font-size: 20px; cursor: pointer; padding: 4px 8px; border-radius: 6px;
  }
  .copilot-close:hover { background: rgba(255,255,255,0.08); color: #fff; }

  .copilot-messages {
    flex: 1; overflow-y: auto; padding: 14px 16px; display: flex;
    flex-direction: column; gap: 10px; max-height: 320px;
    scrollbar-width: thin; scrollbar-color: rgba(0,240,255,0.3) transparent;
  }

  .copilot-msg {
    padding: 10px 14px; border-radius: 14px; font-size: 13px;
    line-height: 1.55; max-width: 88%; word-wrap: break-word;
  }
  .copilot-msg.ai {
    background: rgba(0,240,255,0.08); border: 1px solid rgba(0,240,255,0.15);
    color: #e2e8f0; align-self: flex-start; border-bottom-left-radius: 4px;
  }
  .copilot-msg.user {
    background: linear-gradient(135deg, rgba(0,240,255,0.2), rgba(157,78,221,0.2));
    border: 1px solid rgba(157,78,221,0.25);
    color: #fff; align-self: flex-end; border-bottom-right-radius: 4px;
  }
  .copilot-msg .msg-label {
    font-size: 10px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.8px; margin-bottom: 4px; display: block;
  }
  .copilot-msg.ai .msg-label { color: #00F0FF; }
  .copilot-msg.user .msg-label { color: #c084fc; }

  .copilot-suggestions {
    display: flex; flex-wrap: wrap; gap: 6px; padding: 10px 16px;
    border-top: 1px solid rgba(255,255,255,0.06);
  }
  .copilot-chip {
    background: rgba(0,240,255,0.08); border: 1px solid rgba(0,240,255,0.2);
    color: #94A3B8; font-size: 11px; padding: 6px 12px; border-radius: 20px;
    cursor: pointer; transition: all 0.2s; font-family: inherit;
  }
  .copilot-chip:hover {
    background: rgba(0,240,255,0.18); color: #00F0FF;
    border-color: #00F0FF; transform: translateY(-1px);
  }

  .copilot-input-bar {
    display: flex; align-items: center; gap: 8px; padding: 12px 14px;
    border-top: 1px solid rgba(0,240,255,0.12);
    background: rgba(0,0,0,0.2);
  }
  .copilot-input {
    flex: 1; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px; padding: 10px 14px; color: #fff; font-size: 13px;
    font-family: inherit; outline: none; transition: border-color 0.2s;
  }
  .copilot-input::placeholder { color: #64748B; }
  .copilot-input:focus { border-color: rgba(0,240,255,0.4); }
  .copilot-send {
    width: 38px; height: 38px; border-radius: 10px;
    background: linear-gradient(135deg, #00F0FF, #9D4EDD);
    border: none; cursor: pointer; display: flex; align-items: center;
    justify-content: center; transition: all 0.2s;
  }
  .copilot-send:hover { transform: scale(1.08); box-shadow: 0 4px 16px rgba(0,240,255,0.4); }
  .copilot-send svg { width: 18px; height: 18px; fill: #fff; }

  .typing-dots { display: inline-flex; gap: 4px; padding: 4px 0; }
  .typing-dots span {
    width: 6px; height: 6px; background: #00F0FF; border-radius: 50%;
    animation: dotBounce 1.2s infinite;
  }
  .typing-dots span:nth-child(2) { animation-delay: 0.15s; }
  .typing-dots span:nth-child(3) { animation-delay: 0.3s; }
  @keyframes dotBounce {
    0%,60%,100% { transform: translateY(0); opacity: 0.4; }
    30% { transform: translateY(-6px); opacity: 1; }
  }

  @media (max-width: 480px) {
    .copilot-panel { width: calc(100vw - 24px); right: 12px; bottom: 90px; }
    .copilot-fab { bottom: 18px; right: 18px; width: 52px; height: 52px; }
  }
</style>

<button class="copilot-fab" id="copilotFab" onclick="toggleCopilot()" aria-label="Open AI Copilot">
  <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
</button>

<div class="copilot-panel" id="copilotPanel">
  <div class="copilot-header">
    <div class="copilot-header-icon">🤖</div>
    <div class="copilot-header-info">
      <h3>Urban Mesh AI Copilot</h3>
      <p>SMART CITY INTELLIGENCE ASSISTANT</p>
    </div>
    <button class="copilot-close" onclick="toggleCopilot()">✕</button>
  </div>
  <div class="copilot-messages" id="copilotMessages">
    <div class="copilot-msg ai">
      <span class="msg-label">🤖 AI Copilot</span>
      Namaste! 🙏 I'm your <strong>Urban Mesh AI Copilot</strong> — your intelligent guide to Chandigarh's Smart City Platform.<br><br>
      I can help you with:<br>
      • 🗺️ Navigate the 3D Digital Twin<br>
      • 🚨 Safety alerts & emergency routing<br>
      • 🗑️ Waste management insights<br>
      • 📊 Real-time city analytics<br><br>
      <em>Try a quick action below or ask me anything!</em>
    </div>
  </div>
  <div class="copilot-suggestions" id="copilotSuggestions"></div>
  <div class="copilot-input-bar">
    <input class="copilot-input" id="copilotInput" type="text" placeholder="Ask Urban Mesh AI anything..." onkeydown="if(event.key==='Enter')sendCopilotMessage()">
    <button class="copilot-send" onclick="sendCopilotMessage()">
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

  const contextSuggestions = {
    portal: [
      "What can Urban Mesh do?",
      "Show safety features",
      "How does the 3D Twin work?",
      "Explain Green Corridor"
    ],
    citizen: [
      "How does SafePath work?",
      "Trigger SOS alert",
      "Find nearest Pink Booth",
      "Report an incident",
      "Night safety tips"
    ],
    dashboard: [
      "Explain CCTV analytics",
      "Show waste bin status",
      "Activate Green Corridor",
      "Show safety heatmap",
      "What are blind spots?"
    ],
    twin: [
      "What am I looking at?",
      "Show PGIMER hospital",
      "Toggle night mode",
      "What is Open Hand?",
      "Explain CCTV cones"
    ]
  };

  const aiResponses = {
    "what can urban mesh do": "Urban Mesh is Chandigarh's integrated Smart City platform covering three pillars:\\n\\n🛡️ **Public Safety** — AI-powered CCTV, SafePath routing for women, Pink Police Booths, SOS alerts\\n🗑️ **Smart Waste** — IoT sensor bins with real-time fill monitoring, dynamic compactor routing\\n🚦 **Urban Mobility** — Emergency Green Corridors, smart traffic signals, real-time congestion mapping\\n\\nAll powered by Edge AI with privacy-first design (DPDP Act 2023 compliant).",
    "show safety features": "Urban Mesh includes multiple safety layers:\\n\\n📷 **6 Edge-AI CCTV nodes** with volumetric coverage cones and real-time face blurring\\n⚠️ **AI Blind Spot Detection** — automatically identifies zero-coverage zones\\n🌸 **Pink Police Booths** — 24/7 women safety kiosks with SOS panic buttons\\n🛣️ **SafePath Algorithm** — reroutes night pedestrians away from dark/unsafe zones\\n🚁 **Drone Patrols** — autonomous aerial monitoring with thermal FLIR\\n🚔 **PCR Rapid Response** — GPS-tracked patrol vehicles",
    "how does the 3d twin work": "The 3D Digital Twin is a real-time spatial replica of Chandigarh built with Three.js WebGL.\\n\\n🏙️ It renders Sectors 17, 22, 16 & 12 with Le Corbusier-style architecture\\n📡 Layers include: CCTV cones, blind spots, streetlights, waste bins, Pink Booths, and patrol vehicles\\n🎮 You can orbit, zoom, click any entity to inspect it, toggle layers, switch day/night, and activate the Emergency Green Corridor\\n\\nAll data shown is simulated for the hackathon prototype.",
    "explain green corridor": "The **Madhya Marg Emergency Green Corridor** is a life-saving feature:\\n\\n🚑 When activated, it preempts all 14 traffic signals along Madhya Marg\\n💚 Creates a continuous green wave from East Chandigarh to PGIMER Trauma Center (Sector 12)\\n⚡ Reduces critical patient transit time by up to 40%\\n\\nIn the 3D Twin, click '🚨 Preempt Green Corridor' to see the emerald highway pulse with directional arrows.",
    "how does safepath work": "**SafePath** is Urban Mesh's AI-powered safe navigation engine for women and vulnerable commuters:\\n\\n1️⃣ Analyzes real-time CCTV coverage, streetlight lux levels, and crowd density\\n2️⃣ Identifies dark zones and blind spots to avoid\\n3️⃣ Routes through well-lit, CCTV-monitored, Pink Booth-adjacent paths\\n4️⃣ Sends real-time location to emergency contacts\\n5️⃣ One-tap SOS triggers nearest PCR dispatch\\n\\nUse the Citizen App → SafePath tab to try it!",
    "trigger sos alert": "🚨 **SOS Alert System:**\\n\\nIn a real deployment, the SOS button would:\\n1. Send your GPS location to Chandigarh Police Control Room\\n2. Alert the nearest PCR patrol vehicle\\n3. Notify your registered emergency contacts via SMS\\n4. Activate nearby CCTV cameras for live monitoring\\n5. Flash the nearest Pink Booth alarm\\n\\n⚠️ This is a hackathon prototype — SOS is simulated. In production, it integrates with Chandigarh Police 112 dispatch.",
    "find nearest pink booth": "🌸 **Pink Police Booths** are located at:\\n\\n📍 **Sector 22 Market** — near the commercial hub\\n📍 **Sector 17 Plaza** — near the pedestrian mall\\n\\nEach booth is staffed 24/7 by women police officers and offers:\\n• SOS panic intercom\\n• Immediate escort dispatch\\n• Secure temporary shelter\\n• First-aid kit\\n\\nIn the 3D Twin, toggle the '🌸 Police Pink Booths' layer to see them!",
    "report an incident": "📝 **Incident Reporting** in Urban Mesh:\\n\\nUse the Citizen App → Report tab to submit:\\n• 🚗 Traffic accidents or congestion\\n• 💡 Broken streetlights or dark zones\\n• 🗑️ Overflowing waste bins\\n• ⚠️ Suspicious activity or harassment\\n• 🛣️ Road damage or potholes\\n\\nEach report gets geotagged and routed to the ICCC Command Centre for action.",
    "night safety tips": "🌙 **Night Safety Tips from Urban Mesh AI:**\\n\\n1. Always use **SafePath** navigation after 8 PM\\n2. Stay on well-lit routes (check the streetlight layer in 3D Twin)\\n3. Share your live location with trusted contacts\\n4. Know your nearest **Pink Booth** location\\n5. Keep the **SOS button** accessible\\n6. Avoid areas marked as **AI Blind Spots** (red zones)\\n7. Walk in groups when possible\\n8. If uncomfortable, head towards the nearest CCTV-monitored intersection",
    "explain cctv analytics": "📷 **CCTV Analytics Dashboard:**\\n\\n• **18 Edge-AI cameras** monitoring Sectors 17, 22, and 16\\n• Real-time **crowd density estimation** using computer vision\\n• **Anomaly detection** — fights, vehicle accidents, unattended objects\\n• Hardware-level **face blurring** for DPDP Act 2023 compliance\\n• **License plate recognition** for stolen vehicle alerts\\n• Volumetric coverage shown as cyan cones in the 3D Twin\\n\\nAll processing happens at the edge — no raw footage leaves the camera node.",
    "show waste bin status": "🗑️ **Smart Waste Bin Network Status:**\\n\\n• **WB-221**: 94% FULL 🔴 CRITICAL — Sector 22 Market\\n• **WB-222**: 78% FULL 🟡 WARNING — Jan Marg\\n• **WB-223**: 35% ✅ Normal — Sector 17\\n• **WB-224**: 20% ✅ Normal — East Corridor\\n• **WB-225**: 89% FULL 🔴 CRITICAL — Jan Marg South\\n• **WB-226**: 42% ✅ Normal — North Sector\\n\\nMCC Compactor Truck #WM-04 is en route to critical bins. Dynamic routing saves 34% fuel vs static collection.",
    "activate green corridor": "💚 To activate the Emergency Green Corridor:\\n\\n**On this Dashboard:** Click the '🚨 Preempt Green Corridor' button in the top navigation\\n\\n**In the 3D Twin:** The same button triggers a visual emerald highway pulse along Madhya Marg with directional arrows pointing toward PGIMER\\n\\n**What it does:** Preempts all 14 traffic signals on Madhya Marg to create an uninterrupted green wave for ambulances heading to PGIMER Trauma Center.",
    "show safety heatmap": "🔥 **Safety Heatmap Layers:**\\n\\nIn the 3D Twin, toggle these layers to see the safety landscape:\\n\\n📷 **Volumetric CCTV Cones** — shows actual camera coverage\\n⚠️ **AI Blind Spots** — red zones with zero camera coverage\\n💡 **Streetlight Heatmap** — yellow pools showing illumination\\n🌸 **Pink Booths** — women's safety nodes\\n\\nThe heatmap reveals that Sector 22 Block C and Sector 17 service lanes have the highest risk scores due to coverage gaps.",
    "what are blind spots": "⚠️ **AI-Detected Blind Spots:**\\n\\n**BS-09** (Sector 22 Block C) — Zero camera coverage behind residential area. Risk: unauthorized access corridor. Fix: Deploy 1 LoRa edge dome camera.\\n\\n**BS-14** (Sector 17 Service Lane) — Commercial service corridor with no surveillance. Fix: SafePath auto-reroutes night pedestrians away.\\n\\n**LS-04** (Sector 22 West) — Low-lux dark stretch averaging only 3.8 Lux. Fix: Smart LED upgrade scheduled under MCC Phase 2.\\n\\nBlind spots are shown as red/amber overlays in the 3D Twin.",
    "what am i looking at": "🏙️ You're viewing the **Urban Mesh 3D Digital Twin** of Chandigarh!\\n\\nThis is a real-time spatial replica showing:\\n• **4 Sector clusters** (17, 22, 16, 12) with Le Corbusier architecture\\n• **Madhya Marg & Jan Marg** highways with a central roundabout\\n• **CCTV coverage cones** (cyan), **blind spots** (red/amber)\\n• **Moving vehicles** — Police PCR, Ambulance, Waste Truck, Civilian cars\\n• **Landmarks** — Open Hand Monument, PGIMER, Sector 17 Plaza\\n• **Safety infrastructure** — Pink Booths, Smart Bins, Streetlights\\n\\n🎮 Click any entity to inspect it!",
    "show pgimer hospital": "🏥 **PGIMER (Sector 12):**\\n\\nClick the 'PGIMER Hub' camera preset on the left panel, or I'll describe it:\\n\\n• Multi-wing trauma complex with 68m main tower\\n• Rooftop helipad with approach lights and 'H' marking\\n• Illuminated red medical crosses on all 4 facades\\n• Connected to Madhya Marg Green Wave Corridor\\n• Emergency ambulance bay at ground level\\n\\nPGIMER is the emergency destination hub — all Green Corridor preemptions route here.",
    "toggle night mode": "🌙 **Night/Day Toggle:**\\n\\nClick the '🌙 Night Cyber Mode' button in the top-right navigation bar.\\n\\n**Night Mode:** Dark atmospheric scene with glowing streetlights, neon CCTV cones, illuminated building windows, and the full cyberpunk aesthetic.\\n\\n**Day Mode:** Bright Punjab sky, warm sunlight, natural shadows, and architectural details visible.\\n\\nThe 3D Twin defaults to Night Mode for maximum visual impact!",
    "what is open hand": "✋ **The Open Hand Monument (La Main Ouverte):**\\n\\nDesigned by architect **Le Corbusier** as the official emblem of Chandigarh.\\n\\n📍 Located at the **Capitol Complex** (North Civic Axis)\\n🎨 Symbol: 'Open to give, open to receive' — peace, prosperity, unity\\n📏 Height: ~26 meters (85 feet) in reality\\n🏛️ UNESCO World Heritage Site\\n\\nIn the 3D Twin, it gently rotates with the wind and is illuminated by dual cyan and purple spotlights. Click 'Open Hand' preset to fly to it!",
    "explain cctv cones": "📷 **Volumetric CCTV Vision Cones:**\\n\\nThe translucent cyan cones represent the actual field-of-view of each Edge-AI camera:\\n\\n• **6 cameras** positioned at key intersections\\n• Each cone shows the 3D volume being monitored\\n• **Ground rings** show the surveillance footprint\\n• Areas NOT covered by any cone = **Blind Spots** (shown in red)\\n\\nAll cameras perform real-time edge processing with automatic face and license plate blurring for DPDP Act 2023 privacy compliance."
  };

  // Render suggestions
  const sugContainer = document.getElementById('copilotSuggestions');
  if (sugContainer) {
    const chips = contextSuggestions[pageContext] || contextSuggestions.portal;
    chips.forEach(text => {
      const chip = document.createElement('button');
      chip.className = 'copilot-chip';
      chip.textContent = text;
      chip.onclick = () => handleCopilotQuery(text);
      sugContainer.appendChild(chip);
    });
  }

  // Expose to global
  window._copilotContext = pageContext;
  window._copilotResponses = aiResponses;
})();

function toggleCopilot() {
  const panel = document.getElementById('copilotPanel');
  panel.classList.toggle('open');
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
  typingDiv.innerHTML = '<span class="msg-label">🤖 AI Copilot</span><div class="typing-dots"><span></span><span></span><span></span></div>';
  msgContainer.appendChild(typingDiv);
  msgContainer.scrollTop = msgContainer.scrollHeight;

  // Simulate AI response with delay
  setTimeout(() => {
    typingDiv.remove();

    const aiDiv = document.createElement('div');
    aiDiv.className = 'copilot-msg ai';

    const key = query.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
    let response = null;

    // Find best matching response
    for (const [k, v] of Object.entries(window._copilotResponses)) {
      if (key.includes(k) || k.includes(key) || key.split(' ').some(w => w.length > 3 && k.includes(w))) {
        response = v;
        break;
      }
    }

    if (!response) {
      response = "Great question! 🧠 As a prototype AI Copilot, I have pre-trained knowledge about Urban Mesh's features:\\n\\n• Safety infrastructure (CCTV, Pink Booths, SafePath)\\n• Waste management (Smart Bins, Compactor Routes)\\n• Emergency systems (Green Corridor, SOS, PCR Patrols)\\n• 3D Twin navigation and controls\\n\\nTry asking about any of these topics, or click a quick action chip below!";
    }

    aiDiv.innerHTML = '<span class="msg-label">🤖 AI Copilot</span>' + formatAIResponse(response);
    msgContainer.appendChild(aiDiv);
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }, 800 + Math.random() * 600);
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
<!-- ══════════ END URBAN MESH AI COPILOT ══════════ -->
`;


// ═══════════════════════════════════════════════════════
// 2. BRANDING RENAME: UrbanSync AI → Urban Mesh
// ═══════════════════════════════════════════════════════

function renameBranding(content) {
  return content
    .replace(/UrbanSync AI/g, 'Urban Mesh')
    .replace(/URBANSYNC AI/g, 'URBAN MESH')
    .replace(/UrbanSync/g, 'Urban Mesh')
    .replace(/urbansync/gi, 'urbanmesh');
}


// ═══════════════════════════════════════════════════════
// 3. INJECT COPILOT INTO HTML FILES
// ═══════════════════════════════════════════════════════

function injectCopilot(content) {
  // Remove any previous copilot injection
  content = content.replace(/<!-- ══════════ URBAN MESH AI COPILOT ══════════ -->[\s\S]*?<!-- ══════════ END URBAN MESH AI COPILOT ══════════ -->/g, '');
  
  // Inject before </body>
  return content.replace('</body>', aiCopilotSnippet + '\n</body>');
}


// ═══════════════════════════════════════════════════════
// 4. 3D TWIN VISUAL ENHANCEMENT (stars, particles, fog)
// ═══════════════════════════════════════════════════════

const twinEnhancements = `
    // ══════════════════════════════════════════════════════════════
    // ATMOSPHERIC ENHANCEMENTS — STARFIELD & PARTICLE SYSTEM
    // ══════════════════════════════════════════════════════════════

    let starField = null;
    let dustParticles = null;
    let groundMist = [];

    function buildStarfieldAndAtmosphere() {
      // 1. Realistic Night Sky Starfield (2000 stars)
      const starGeo = new THREE.BufferGeometry();
      const starCount = 2000;
      const starPositions = new Float32Array(starCount * 3);
      const starSizes = new Float32Array(starCount);

      for (let i = 0; i < starCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 0.6 + 0.4); // Upper hemisphere only
        const r = 800 + Math.random() * 200;
        starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        starPositions[i * 3 + 1] = r * Math.cos(phi);
        starPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
        starSizes[i] = 0.5 + Math.random() * 2.0;
      }

      starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      starGeo.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));

      const starMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1.2,
        transparent: true,
        opacity: 0.85,
        sizeAttenuation: true,
        depthWrite: false
      });

      starField = new THREE.Points(starGeo, starMat);
      scene.add(starField);

      // 2. Floating Cyber Dust / Ambient Particles (400 particles)
      const dustGeo = new THREE.BufferGeometry();
      const dustCount = 400;
      const dustPositions = new Float32Array(dustCount * 3);

      for (let i = 0; i < dustCount; i++) {
        dustPositions[i * 3] = (Math.random() - 0.5) * 400;
        dustPositions[i * 3 + 1] = 3 + Math.random() * 60;
        dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 400;
      }

      dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));

      const dustMat = new THREE.PointsMaterial({
        color: 0x00F0FF,
        size: 0.6,
        transparent: true,
        opacity: 0.4,
        sizeAttenuation: true,
        depthWrite: false
      });

      dustParticles = new THREE.Points(dustGeo, dustMat);
      scene.add(dustParticles);

      // 3. Ground-Level Atmospheric Mist Volumes (6 wisps)
      for (let i = 0; i < 6; i++) {
        const mistGeo = new THREE.PlaneGeometry(50 + Math.random() * 40, 8);
        const mistMat = new THREE.MeshBasicMaterial({
          color: 0x00F0FF,
          transparent: true,
          opacity: 0.04 + Math.random() * 0.03,
          side: THREE.DoubleSide,
          depthWrite: false
        });
        const mist = new THREE.Mesh(mistGeo, mistMat);
        mist.position.set(
          (Math.random() - 0.5) * 300,
          2 + Math.random() * 4,
          (Math.random() - 0.5) * 300
        );
        mist.rotation.y = Math.random() * Math.PI;
        scene.add(mist);
        groundMist.push(mist);
      }
    }
`;

const twinAnimationPatch = `
      // 11. Starfield subtle twinkle
      if (starField) {
        starField.rotation.y = time * 0.005;
        starField.visible = isNight;
      }

      // 12. Floating cyber dust drift
      if (dustParticles) {
        const positions = dustParticles.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
          positions[i] += Math.sin(time * 0.3 + i) * 0.015;
          positions[i + 1] += Math.sin(time * 0.5 + i * 0.5) * 0.008;
          positions[i + 2] += Math.cos(time * 0.3 + i) * 0.015;
        }
        dustParticles.geometry.attributes.position.needsUpdate = true;
        dustParticles.material.opacity = isNight ? 0.4 : 0.12;
      }

      // 13. Ground mist slow drift
      groundMist.forEach((m, i) => {
        m.position.x += Math.sin(time * 0.15 + i) * 0.06;
        m.position.z += Math.cos(time * 0.12 + i) * 0.06;
        m.material.opacity = isNight ? (0.04 + Math.sin(time * 0.4 + i) * 0.02) : 0.015;
      });

`;


// ═══════════════════════════════════════════════════════
// EXECUTE ALL MODIFICATIONS
// ═══════════════════════════════════════════════════════

const htmlFiles = ['index.html', 'citizen.html', 'dashboard.html', 'twin.html'];

htmlFiles.forEach(file => {
  const filePath = path.join(DIR, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Rename branding
  content = renameBranding(content);

  // Inject AI Copilot
  content = injectCopilot(content);

  // Special 3D enhancements for twin.html
  if (file === 'twin.html') {
    // Insert starfield builder function before setupRaycaster
    content = content.replace(
      '// ══════════════════════════════════════════════════════════════\n    // INTERACTION & RAYCASTING',
      twinEnhancements + '\n    // ══════════════════════════════════════════════════════════════\n    // INTERACTION & RAYCASTING'
    );

    // Call the builder in init3DTwin
    content = content.replace(
      "buildEmergencyGreenCorridorMeshes();",
      "buildEmergencyGreenCorridorMeshes();\n      buildStarfieldAndAtmosphere();"
    );

    // Add animation entries before "// 9. Update Orbit Controls"
    content = content.replace(
      '      // 9. Update Orbit Controls',
      twinAnimationPatch + '      // 9. Update Orbit Controls'
    );

    // Improve fog density for more atmospheric depth
    content = content.replace("scene.fog = new THREE.FogExp2(0x060919, 0.0024)", "scene.fog = new THREE.FogExp2(0x060919, 0.0018)");

    // Increase far plane for stars
    content = content.replace("camera = new THREE.PerspectiveCamera(45, w / h, 1, 2200)", "camera = new THREE.PerspectiveCamera(45, w / h, 0.5, 2800)");
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated:', file, '(' + content.length + ' bytes)');
});

// Also update README and deployment guide branding
['README.md', 'GITHUB_DEPLOYMENT_GUIDE.md'].forEach(file => {
  const filePath = path.join(DIR, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = renameBranding(content);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated:', file);
  }
});

console.log('\\n✅ All upgrades complete! Branding → Urban Mesh, AI Copilot injected, 3D atmosphere enhanced.');
