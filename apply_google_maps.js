const fs = require('fs');
const path = require('path');

const DIR = 'C:\\Users\\staro\\.gemini\\antigravity\\scratch\\smart-chandigarh';

// Chandigarh exact coordinates
const CHD_LAT = '30.7333';
const CHD_LNG = '76.7794';

// ══════════════════════════════════════════════════════════════════
// 1. TWIN.HTML — GOOGLE MAPS SATELLITE MINI-MAP OVERLAY (Zero FPS Impact)
// ══════════════════════════════════════════════════════════════════
console.log('Adding Google Maps mini-map to twin.html...');
let twin = fs.readFileSync(path.join(DIR, 'twin.html'), 'utf8');

// Add mini-map CSS
const miniMapCSS = `
    /* Google Maps Mini-Map Overlay */
    .gmap-minimap {
      position: absolute;
      bottom: 80px;
      left: 24px;
      width: 280px;
      height: 200px;
      border-radius: 14px;
      overflow: hidden;
      border: 2px solid rgba(0, 240, 255, 0.35);
      box-shadow: 0 10px 40px rgba(0,0,0,0.6), 0 0 20px rgba(0, 240, 255, 0.15);
      z-index: 25;
      pointer-events: auto;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      display: none;
    }
    .gmap-minimap.visible { display: block; animation: copilotSlideUp 0.35s ease forwards; }
    .gmap-minimap.expanded {
      width: 520px;
      height: 380px;
      bottom: 80px;
      left: 24px;
    }
    .gmap-minimap iframe {
      width: 100%;
      height: 100%;
      border: none;
      filter: saturate(1.1) contrast(1.05);
    }
    .gmap-minimap-header {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 10px;
      background: linear-gradient(180deg, rgba(5, 8, 22, 0.9) 0%, transparent 100%);
      z-index: 2;
      pointer-events: auto;
    }
    .gmap-minimap-header span {
      font-size: 10px;
      font-weight: 700;
      color: #00F0FF;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .gmap-minimap-header button {
      background: rgba(255,255,255,0.12);
      border: none;
      color: #fff;
      font-size: 11px;
      padding: 3px 8px;
      border-radius: 6px;
      cursor: pointer;
    }
    .gmap-minimap-header button:hover {
      background: rgba(0, 240, 255, 0.25);
    }
`;

if (!twin.includes('gmap-minimap')) {
  twin = twin.replace('</style>', miniMapCSS + '\n  </style>');
}

// Add mini-map HTML + Google Maps Toggle Button in Left Panel
const miniMapHTML = `
  <!-- Google Maps Satellite Mini-Map Overlay -->
  <div class="gmap-minimap" id="gmapMiniMap">
    <div class="gmap-minimap-header">
      <span>📍 Google Maps • Chandigarh Live</span>
      <div style="display:flex;gap:4px;">
        <button onclick="toggleGmapExpand()" id="gmapExpandBtn" title="Expand / Collapse">⛶</button>
        <button onclick="toggleGoogleMapsOverlay()" title="Close">✕</button>
      </div>
    </div>
    <iframe
      id="gmapIframe"
      loading="lazy"
      referrerpolicy="no-referrer-when-downgrade"
      src="about:blank"
      allow="fullscreen"
      title="Google Maps Chandigarh Satellite View"
    ></iframe>
  </div>
`;

if (!twin.includes('id="gmapMiniMap"')) {
  twin = twin.replace('<div class="crosshair">', miniMapHTML + '\n  <div class="crosshair">');
}

// Add toggle button to Layer Filters sidebar
const layerToggleTarget = `<div class="toggle-item checked" onclick="toggleLayer('vehicles', this)">
           <span>🚔 Moving Fleet / Patrols</span>
           <div class="toggle-dot"></div>
         </div>`;

const gmapLayerToggle = `<div class="toggle-item checked" onclick="toggleLayer('vehicles', this)">
           <span>🚔 Moving Fleet / Patrols</span>
           <div class="toggle-dot"></div>
         </div>
         <div class="toggle-item" onclick="toggleGoogleMapsOverlay(); this.classList.toggle('checked');">
           <span>📍 Google Maps Satellite</span>
           <div class="toggle-dot"></div>
         </div>`;

if (!twin.includes('Google Maps Satellite</span>')) {
  twin = twin.replace(layerToggleTarget, gmapLayerToggle);
}

// Add JavaScript for Google Maps overlay control
const gmapScript = `
    // ══════════════════════════════════════════════════════════════
    // GOOGLE MAPS SATELLITE OVERLAY CONTROLS
    // ══════════════════════════════════════════════════════════════
    let isGmapVisible = false;
    let isGmapExpanded = false;
    let gmapLoaded = false;

    // Multiple Google Maps views for sector-level navigation
    const GMAP_VIEWS = {
      overview: { lat: 30.7412, lng: 76.7684, zoom: 14, maptype: 'k', label: 'Chandigarh City Overview' },
      sector17: { lat: 30.7415, lng: 76.7832, zoom: 17, maptype: 'k', label: 'Sector 17 Plaza & Commercial Hub' },
      sector22: { lat: 30.7350, lng: 76.7690, zoom: 17, maptype: 'k', label: 'Sector 22 Market & Pink Booth Zone' },
      pgimer:   { lat: 30.7640, lng: 76.7765, zoom: 16, maptype: 'k', label: 'PGIMER Trauma Hospital (Sector 12)' },
      openhand: { lat: 30.7604, lng: 76.8070, zoom: 17, maptype: 'k', label: 'Open Hand Monument & Capitol Complex' },
      madhyamarg: { lat: 30.7412, lng: 76.7684, zoom: 15, maptype: 'k', label: 'Madhya Marg Arterial Corridor' }
    };

    function getGmapEmbedUrl(view) {
      const v = GMAP_VIEWS[view] || GMAP_VIEWS.overview;
      return 'https://maps.google.com/maps?q=' + v.lat + ',' + v.lng + '&t=' + v.maptype + '&z=' + v.zoom + '&output=embed&iwloc=near';
    }

    function toggleGoogleMapsOverlay() {
      isGmapVisible = !isGmapVisible;
      const minimap = document.getElementById('gmapMiniMap');
      const iframe = document.getElementById('gmapIframe');

      if (isGmapVisible) {
        playBeep('click');
        minimap.classList.add('visible');
        // Lazy-load iframe src only on first open (saves bandwidth & FPS)
        if (!gmapLoaded) {
          iframe.src = getGmapEmbedUrl('overview');
          gmapLoaded = true;
        }
      } else {
        playBeep('click');
        minimap.classList.remove('visible');
        isGmapExpanded = false;
        minimap.classList.remove('expanded');
      }
    }

    function toggleGmapExpand() {
      isGmapExpanded = !isGmapExpanded;
      const minimap = document.getElementById('gmapMiniMap');
      minimap.classList.toggle('expanded', isGmapExpanded);
    }

    // Auto-sync Google Maps view with 3D camera preset (Sector-linked navigation)
    function syncGmapToPreset(presetName) {
      if (!isGmapVisible) return;
      const iframe = document.getElementById('gmapIframe');
      let viewKey = 'overview';
      if (presetName === 'plaza') viewKey = 'sector17';
      else if (presetName === 'hospital') viewKey = 'pgimer';
      else if (presetName === 'openhand') viewKey = 'openhand';
      else if (presetName === 'street') viewKey = 'sector22';
      else if (presetName === 'drone') viewKey = 'madhyamarg';
      iframe.src = getGmapEmbedUrl(viewKey);
    }
`;

if (!twin.includes('isGmapVisible')) {
  twin = twin.replace('function init3DTwin() {', gmapScript + '\n    function init3DTwin() {');
}

// Hook Google Maps sync into setCameraView
twin = twin.replace(
  "function setCameraView(preset, elem) {\n      playBeep('click');",
  "function setCameraView(preset, elem) {\n      playBeep('click');\n      syncGmapToPreset(preset);"
);

fs.writeFileSync(path.join(DIR, 'twin.html'), twin, 'utf8');
console.log('twin.html updated with Google Maps mini-map overlay!');


// ══════════════════════════════════════════════════════════════════
// 2. CITIZEN.HTML — GOOGLE MAPS EMBED IN SAFEPATH MAP TAB
// ══════════════════════════════════════════════════════════════════
console.log('Adding Google Maps to citizen.html SafePath Map...');
let cit = fs.readFileSync(path.join(DIR, 'citizen.html'), 'utf8');

// Find the existing map container in the SafePath Map tab and add a Google Maps layer toggle
const safePathMapSearch = cit.indexOf('function initSafePathMap');
if (safePathMapSearch !== -1) {
  console.log('  Found SafePath map at char position:', safePathMapSearch);
}

// Add a Google Maps fullscreen overlay toggle accessible from citizen app
const citizenGmapCSS = `
    /* Google Maps Fullscreen Explore Overlay */
    .citizen-gmap-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      z-index: 9999;
      background: rgba(5, 8, 22, 0.97);
      display: none;
      flex-direction: column;
    }
    .citizen-gmap-overlay.active { display: flex; }
    .citizen-gmap-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 18px;
      background: linear-gradient(135deg, rgba(0,240,255,0.08), rgba(157,78,221,0.08));
      border-bottom: 1px solid rgba(0,240,255,0.2);
    }
    .citizen-gmap-bar h3 {
      font-size: 14px;
      font-weight: 800;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .citizen-gmap-bar button {
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      color: #fff;
      padding: 8px 16px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
    }
    .citizen-gmap-bar button:hover {
      background: rgba(0,240,255,0.2);
      border-color: #00F0FF;
    }
    .citizen-gmap-frame {
      flex: 1;
    }
    .citizen-gmap-frame iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
    .gmap-poi-chips {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      padding: 8px 18px;
      background: rgba(0,0,0,0.3);
    }
    .gmap-poi-chip {
      white-space: nowrap;
      background: rgba(0,240,255,0.08);
      border: 1px solid rgba(0,240,255,0.2);
      color: #94A3B8;
      font-size: 11px;
      padding: 6px 12px;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .gmap-poi-chip:hover, .gmap-poi-chip.active {
      background: rgba(0,240,255,0.18);
      color: #00F0FF;
      border-color: #00F0FF;
    }
`;

if (!cit.includes('citizen-gmap-overlay')) {
  cit = cit.replace('</style>', citizenGmapCSS + '\n  </style>');
}

// Add Google Maps overlay HTML before </body> (but before copilot)
const citizenGmapHTML = `
  <!-- Google Maps Explore Overlay for Citizen App -->
  <div class="citizen-gmap-overlay" id="citizenGmapOverlay">
    <div class="citizen-gmap-bar">
      <h3>📍 Google Maps — Chandigarh Safety Exploration</h3>
      <button onclick="closeCitizenGmap()">✕ Close Map</button>
    </div>
    <div class="gmap-poi-chips">
      <button class="gmap-poi-chip active" onclick="setCitizenGmapView('overview', this)">🏙️ City Overview</button>
      <button class="gmap-poi-chip" onclick="setCitizenGmapView('sector17', this)">🛍️ Sector 17 Plaza</button>
      <button class="gmap-poi-chip" onclick="setCitizenGmapView('sector22', this)">🏪 Sector 22 Market</button>
      <button class="gmap-poi-chip" onclick="setCitizenGmapView('pgimer', this)">🏥 PGIMER Hospital</button>
      <button class="gmap-poi-chip" onclick="setCitizenGmapView('rosegarden', this)">🌹 Rose Garden</button>
      <button class="gmap-poi-chip" onclick="setCitizenGmapView('elante', this)">🏬 Elante Mall</button>
      <button class="gmap-poi-chip" onclick="setCitizenGmapView('sukhna', this)">🌊 Sukhna Lake</button>
      <button class="gmap-poi-chip" onclick="setCitizenGmapView('busstand', this)">🚌 ISBT Bus Stand</button>
    </div>
    <div class="citizen-gmap-frame">
      <iframe id="citizenGmapIframe" loading="lazy" src="about:blank" allow="fullscreen" title="Google Maps Chandigarh"></iframe>
    </div>
  </div>

  <script>
    const CITIZEN_GMAP_POIS = {
      overview:   { lat: 30.7412, lng: 76.7684, zoom: 14, t: 'k' },
      sector17:   { lat: 30.7415, lng: 76.7832, zoom: 17, t: 'k' },
      sector22:   { lat: 30.7350, lng: 76.7690, zoom: 17, t: 'k' },
      pgimer:     { lat: 30.7640, lng: 76.7765, zoom: 16, t: 'k' },
      rosegarden: { lat: 30.7508, lng: 76.7828, zoom: 17, t: 'k' },
      elante:     { lat: 30.7060, lng: 76.8018, zoom: 17, t: 'k' },
      sukhna:     { lat: 30.7421, lng: 76.8187, zoom: 15, t: 'k' },
      busstand:   { lat: 30.7106, lng: 76.7607, zoom: 16, t: 'k' }
    };
    let citizenGmapLoaded = false;

    function openCitizenGmap() {
      document.getElementById('citizenGmapOverlay').classList.add('active');
      if (!citizenGmapLoaded) {
        setCitizenGmapView('overview', document.querySelector('.gmap-poi-chip'));
        citizenGmapLoaded = true;
      }
    }

    function closeCitizenGmap() {
      document.getElementById('citizenGmapOverlay').classList.remove('active');
    }

    function setCitizenGmapView(key, btn) {
      const poi = CITIZEN_GMAP_POIS[key] || CITIZEN_GMAP_POIS.overview;
      document.getElementById('citizenGmapIframe').src =
        'https://maps.google.com/maps?q=' + poi.lat + ',' + poi.lng + '&t=' + poi.t + '&z=' + poi.zoom + '&output=embed&iwloc=near';
      document.querySelectorAll('.gmap-poi-chip').forEach(c => c.classList.remove('active'));
      if (btn) btn.classList.add('active');
    }
  </script>
`;

if (!cit.includes('id="citizenGmapOverlay"')) {
  // Insert before the copilot section
  const copilotMarker = '<!-- ══════════ URBAN MESH AI COPILOT ══════════ -->';
  if (cit.includes(copilotMarker)) {
    cit = cit.replace(copilotMarker, citizenGmapHTML + '\n' + copilotMarker);
  } else {
    cit = cit.replace('</body>', citizenGmapHTML + '\n</body>');
  }
}

// Add a "📍 Explore on Google Maps" button near the SafePath map section
// Find the map tab header or content area
const mapTabSearch = cit.indexOf('id="safePathMapContainer"');
if (mapTabSearch !== -1) {
  // Add open button after the map container div
  const existingMapDiv = cit.substring(mapTabSearch, mapTabSearch + 200);
  console.log('  Found map container:', existingMapDiv.substring(0, 80));
}

// Add a floating Google Maps button in the bottom navigation area
const gmapFloatBtn = `
    <!-- Google Maps Quick-Access Floating Button (Citizen App) -->
    <div style="position: fixed; bottom: 72px; right: 18px; z-index: 999;">
      <button onclick="openCitizenGmap()" style="
        width: 48px; height: 48px; border-radius: 50%;
        background: linear-gradient(135deg, #4285F4, #34A853);
        border: 2px solid rgba(255,255,255,0.3);
        color: #fff; font-size: 20px; cursor: pointer;
        box-shadow: 0 6px 20px rgba(66, 133, 244, 0.5);
        display: flex; align-items: center; justify-content: center;
        transition: transform 0.2s;
      " title="Open Google Maps Chandigarh">📍</button>
    </div>
`;

if (!cit.includes('Open Google Maps Chandigarh')) {
  const copilotFabTarget = '<button class="copilot-fab"';
  if (cit.includes(copilotFabTarget)) {
    cit = cit.replace(copilotFabTarget, gmapFloatBtn + '\n' + copilotFabTarget);
  }
}

fs.writeFileSync(path.join(DIR, 'citizen.html'), cit, 'utf8');
console.log('citizen.html updated with Google Maps POI Explorer!');


// ══════════════════════════════════════════════════════════════════
// 3. DASHBOARD.HTML — GOOGLE MAPS PANEL IN ICCC COMMAND CENTER
// ══════════════════════════════════════════════════════════════════
console.log('Adding Google Maps panel to dashboard.html...');
let dash = fs.readFileSync(path.join(DIR, 'dashboard.html'), 'utf8');

// Search for a map panel or area in the dashboard where we can add a Google Maps iframe
const dashMapIdx = dash.indexOf('mapContainer') || dash.indexOf('map-panel') || dash.indexOf('id="panel');
console.log('  Dashboard map search index:', dashMapIdx);

// Add a floating Google Maps toggle for dashboard too (same minimal approach)
const dashGmapCSS = `
    .dash-gmap-panel {
      position: fixed;
      top: 80px;
      right: 20px;
      width: 400px;
      height: 300px;
      border-radius: 14px;
      overflow: hidden;
      border: 2px solid rgba(0, 240, 255, 0.3);
      box-shadow: 0 10px 40px rgba(0,0,0,0.6), 0 0 20px rgba(0, 240, 255, 0.15);
      z-index: 9999;
      display: none;
      flex-direction: column;
    }
    .dash-gmap-panel.active { display: flex; animation: copilotSlideUp 0.3s ease forwards; }
    .dash-gmap-panel iframe { flex: 1; border: none; }
    .dash-gmap-panel .dash-gmap-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      background: rgba(5, 8, 22, 0.95);
      border-bottom: 1px solid rgba(0,240,255,0.2);
    }
    .dash-gmap-panel .dash-gmap-bar span {
      font-size: 11px;
      font-weight: 700;
      color: #00F0FF;
    }
    .dash-gmap-panel .dash-gmap-bar button {
      background: none;
      border: none;
      color: #94A3B8;
      font-size: 16px;
      cursor: pointer;
    }
`;

const dashGmapHTML = `
  <!-- ICCC Google Maps Real-Time Satellite Panel -->
  <div class="dash-gmap-panel" id="dashGmapPanel">
    <div class="dash-gmap-bar">
      <span>📍 GOOGLE MAPS • CHANDIGARH LIVE SATELLITE</span>
      <button onclick="toggleDashGmap()">✕</button>
    </div>
    <iframe id="dashGmapIframe" loading="lazy" src="about:blank" allow="fullscreen"></iframe>
  </div>

  <script>
    let dashGmapOpen = false;
    let dashGmapFirstLoad = false;

    function toggleDashGmap() {
      dashGmapOpen = !dashGmapOpen;
      const panel = document.getElementById('dashGmapPanel');
      panel.classList.toggle('active', dashGmapOpen);
      if (dashGmapOpen && !dashGmapFirstLoad) {
        document.getElementById('dashGmapIframe').src = 'https://maps.google.com/maps?q=30.7412,76.7684&t=k&z=14&output=embed&iwloc=near';
        dashGmapFirstLoad = true;
      }
    }
  </script>
`;

if (!dash.includes('id="dashGmapPanel"')) {
  dash = dash.replace('</style>', dashGmapCSS + '\n  </style>');

  const dashCopilotMarker = '<!-- ══════════ URBAN MESH AI COPILOT ══════════ -->';
  if (dash.includes(dashCopilotMarker)) {
    dash = dash.replace(dashCopilotMarker, dashGmapHTML + '\n' + dashCopilotMarker);
  } else {
    dash = dash.replace('</body>', dashGmapHTML + '\n</body>');
  }
}

fs.writeFileSync(path.join(DIR, 'dashboard.html'), dash, 'utf8');
console.log('dashboard.html updated with Google Maps panel!');

console.log('\nAll Google Maps integrations complete!');
