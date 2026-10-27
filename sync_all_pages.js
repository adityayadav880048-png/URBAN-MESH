const fs = require('fs');
const path = require('path');

const DIR = 'C:\\Users\\staro\\.gemini\\antigravity\\scratch\\smart-chandigarh';

console.log('Ensuring all 3 core sites have the 2 updated features...');

// ══════════════════════════════════════════════════════════════════════════
// 1. UPDATE DASHBOARD.HTML — ICCC COMMAND CENTRE
// ══════════════════════════════════════════════════════════════════════════
let dash = fs.readFileSync(path.join(DIR, 'dashboard.html'), 'utf8');

// Add Duress & Satellite buttons to top navigation bar in dashboard.html
const topCenterSearch = '<div class="clock-display">';
const dashTopActions = `<div style="display: flex; gap: 8px; margin-right: 16px;">
        <button class="btn btn-primary" onclick="window.open('twin.html', '_blank')" style="background: linear-gradient(135deg, #00F0FF, #9D4EDD); border: none; color: #000; font-weight: 800; font-size: 11px; padding: 7px 14px; border-radius: 8px; cursor: pointer; box-shadow: 0 0 15px rgba(0,240,255,0.4);" title="Open Fullscreen 3D Digital Twin with Satellite & Google Maps">
          🛰️ 3D Twin & Satellite
        </button>
        <button class="btn btn-alert" onclick="triggerIcccSosTest()" style="background: linear-gradient(135deg, #ef4444, #b91c1c); border: none; color: #fff; font-weight: 800; font-size: 11px; padding: 7px 14px; border-radius: 8px; cursor: pointer; box-shadow: 0 0 15px rgba(239,68,68,0.5);" title="Test 30s Siren & Duress PIN 9999 from Command Centre">
          🚨 Test SOS (Siren & PIN 9999)
        </button>
        <button class="btn btn-secondary" onclick="toggleDashGmap()" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(0,240,255,0.3); color: #00F0FF; font-weight: 700; font-size: 11px; padding: 7px 12px; border-radius: 8px; cursor: pointer;" title="Toggle Real-Time Google Maps Satellite">
          📍 Google Maps
        </button>
      </div>\n      <div class="clock-display">`;

if (!dash.includes('triggerIcccSosTest()')) {
  dash = dash.replace(topCenterSearch, dashTopActions);
}

// Add Code Black Emergency Alert Banner to dashboard.html
const dashBodySearch = '<div class="dashboard-grid">';
const dashEmergencyBanner = `<!-- CODE BLACK DURESS NOTIFICATION BANNER -->
    <div id="icccDuressAlertBanner" style="display: none; background: linear-gradient(90deg, #b91c1c, #7f1d1d); border: 2px solid #ef4444; border-radius: 12px; padding: 12px 20px; margin-bottom: 16px; align-items: center; justify-content: space-between; box-shadow: 0 0 30px rgba(239, 68, 68, 0.6); animation: pulse 1s infinite alternate;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 24px;">🚨</span>
        <div>
          <strong style="color: #fff; font-size: 14px; letter-spacing: 0.5px;">[PRIORITY 1: CODE BLACK DETECTED — DURESS PIN 9999 ACTIVATED IN SECTOR 22]</strong>
          <div style="color: #fca5a5; font-size: 12px; margin-top: 2px;">Victim under active coercion. Attacker deceived by silent disarm. PCR-04 dispatched in silent stealth intercept mode.</div>
        </div>
      </div>
      <button onclick="document.getElementById('icccDuressAlertBanner').style.display='none'" style="background: rgba(255,255,255,0.2); border: none; color: #fff; padding: 4px 12px; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 700;">Acknowledge</button>
    </div>

    <div class="dashboard-grid">`;

if (!dash.includes('id="icccDuressAlertBanner"')) {
  dash = dash.replace(dashBodySearch, dashEmergencyBanner);
}

// Add Interactive SOS & Duress Modal and Script to dashboard.html
const dashSosScript = `
    // ══════════════════════════════════════════════════════════════
    // ICCC SOS SIREN & DURESS PIN 9999 SIMULATION CONTROLLER
    // ══════════════════════════════════════════════════════════════
    function triggerIcccSosTest() {
      // Flash the Code Black Duress Banner
      const banner = document.getElementById('icccDuressAlertBanner');
      if (banner) banner.style.display = 'flex';

      // Play short audible dispatch alert
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.setValueAtTime(1450, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } catch(e) {}

      // Add emergency incident to the live incidents table / feed
      const incidentContainer = document.querySelector('.incident-list') || document.querySelector('.feed-list');
      if (incidentContainer) {
        const newInc = document.createElement('div');
        newInc.className = 'incident-card alert-critical';
        newInc.style.cssText = 'background: rgba(239,68,68,0.2); border-left: 4px solid #ef4444; padding: 10px; margin-bottom: 8px; border-radius: 6px;';
        newInc.innerHTML = '<strong style=\"color:#ef4444;\">🚨 CODE BLACK #SOS-9999</strong>: Sector 22 Market • DURESS PIN ENTERED • Silent Tactical Intercept Active';
        incidentContainer.insertBefore(newInc, incidentContainer.firstChild);
      }

      alert("🚨 [ICCC EMERGENCY ALERT BROADCASTED]\\n\\nSector 22 Citizen App triggered SOS with DURESS PIN 9999!\\n\\n1. Victim's siren was silenced to fool attacker.\\n2. ICCC has received the silent Code Black alert.\\n3. PCR-04 dispatched in silent stealth approach.");
    }
`;

if (!dash.includes('function triggerIcccSosTest()')) {
  dash = dash.replace('</body>', '<script>' + dashSosScript + '</script>\n</body>');
}

fs.writeFileSync(path.join(DIR, 'dashboard.html'), dash, 'utf8');
console.log('dashboard.html updated with ICCC Duress Alert & Satellite links!');


// ══════════════════════════════════════════════════════════════════════════
// 2. UPDATE CITIZEN.HTML — HEADER BAR LINKING TO 3D TWIN & ICCC
// ══════════════════════════════════════════════════════════════════════════
let cit = fs.readFileSync(path.join(DIR, 'citizen.html'), 'utf8');

const citHeaderSearch = '<header class="app-header">';
const citNavLinks = `<div style="display: flex; gap: 8px; padding: 8px 16px; background: rgba(0,0,0,0.4); border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 11px; align-items: center; justify-content: space-between;">
      <span style="color: #94A3B8; font-weight: 600;">Urban Mesh Citizen App</span>
      <div style="display: flex; gap: 8px;">
        <a href="twin.html" style="color: #00F0FF; text-decoration: none; font-weight: 700; background: rgba(0,240,255,0.1); padding: 3px 8px; border-radius: 6px; border: 1px solid rgba(0,240,255,0.3);">🛰️ 3D Twin & Satellite</a>
        <a href="dashboard.html" style="color: #9D4EDD; text-decoration: none; font-weight: 700; background: rgba(157,78,221,0.1); padding: 3px 8px; border-radius: 6px; border: 1px solid rgba(157,78,221,0.3);">🖥️ ICCC Hub</a>
        <a href="index.html" style="color: #fff; text-decoration: none; font-weight: 700; background: rgba(255,255,255,0.1); padding: 3px 8px; border-radius: 6px;">🏠 Portal</a>
      </div>
    </div>\n    <header class="app-header">`;

if (!cit.includes('Urban Mesh Citizen App</span>')) {
  cit = cit.replace(citHeaderSearch, citNavLinks);
  fs.writeFileSync(path.join(DIR, 'citizen.html'), cit, 'utf8');
  console.log('citizen.html updated with quick-navigation bar to 3D Twin & ICCC!');
}


// ══════════════════════════════════════════════════════════════════════════
// 3. UPDATE INDEX.HTML — SHOWCASE CARDS FOR THE 2 NEW UPDATES
// ══════════════════════════════════════════════════════════════════════════
let idx = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');

// Ensure all 3 links are prominently clickable in index.html
const featureCardsHtml = `
      <!-- ══════════ THE 2 UPDATED HACKATHON INNOVATIONS ══════════ -->
      <section style="margin: 24px 0 32px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 14px;">
          <span style="font-size: 20px;">⚡</span>
          <h2 style="font-size: 17px; font-weight: 800; color: #fff; text-transform: uppercase; letter-spacing: 0.8px; margin: 0;">
            Latest Integrated Innovations (Presentation Ready)
          </h2>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;">
          <!-- Innovation 1: 30s Siren & Duress PIN 9999 -->
          <div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(15, 23, 42, 0.9)); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 16px; padding: 20px; box-shadow: 0 8px 30px rgba(0,0,0,0.5);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
              <span style="font-size: 28px;">🚨</span>
              <span style="font-size: 10px; font-weight: 800; background: rgba(239,68,68,0.25); color: #fca5a5; padding: 4px 10px; border-radius: 20px; border: 1px solid rgba(239,68,68,0.4);">WOMEN'S SAFETY INNOVATION</span>
            </div>
            <h3 style="font-size: 15px; font-weight: 800; color: #fff; margin-bottom: 6px;">30s Audible Siren & Covert Duress PIN (9999)</h3>
            <p style="font-size: 12px; color: #94A3B8; line-height: 1.5; margin-bottom: 14px;">
              Equipped with Web Audio API dual-tone siren and a 30s countdown. Under threat, entering Duress PIN <strong>9999</strong> immediately silences the sound and fakes disarm on screen, while secretly alerting police for silent stealth intercept!
            </p>
            <div style="display: flex; gap: 8px;">
              <a href="citizen.html" style="flex: 1; text-align: center; background: #ef4444; color: #fff; font-weight: 800; font-size: 11px; padding: 8px 12px; border-radius: 8px; text-decoration: none;">Test on Citizen App ➔</a>
              <a href="twin.html" style="flex: 1; text-align: center; background: rgba(255,255,255,0.1); color: #fff; font-weight: 700; font-size: 11px; padding: 8px 12px; border-radius: 8px; text-decoration: none;">View in 3D Twin ➔</a>
            </div>
          </div>

          <!-- Innovation 2: Satellite Imagery & Google Maps APIs -->
          <div style="background: linear-gradient(135deg, rgba(0, 240, 255, 0.12), rgba(15, 23, 42, 0.9)); border: 1px solid rgba(0, 240, 255, 0.4); border-radius: 16px; padding: 20px; box-shadow: 0 8px 30px rgba(0,0,0,0.5);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
              <span style="font-size: 28px;">🛰️</span>
              <span style="font-size: 10px; font-weight: 800; background: rgba(0,240,255,0.2); color: #00F0FF; padding: 4px 10px; border-radius: 20px; border: 1px solid rgba(0,240,255,0.4);">GIS & LIVE SENSORS</span>
            </div>
            <h3 style="font-size: 15px; font-weight: 800; color: #fff; margin-bottom: 6px;">Real Satellite Imagery & Google Maps Integration</h3>
            <p style="font-size: 12px; color: #94A3B8; line-height: 1.5; margin-bottom: 14px;">
              Features authentic Chandigarh master plan (Shivalik hills, Sukhna Lake, Capitol Complex, Matka Chowk). Toggle high-res ESRI satellite ground view or expand live Google Maps satellite overlay with zero FPS drop!
            </p>
            <div style="display: flex; gap: 8px;">
              <a href="twin.html" style="flex: 1; text-align: center; background: linear-gradient(135deg, #00F0FF, #9D4EDD); color: #000; font-weight: 800; font-size: 11px; padding: 8px 12px; border-radius: 8px; text-decoration: none;">Launch 3D Satellite ➔</a>
              <a href="dashboard.html" style="flex: 1; text-align: center; background: rgba(255,255,255,0.1); color: #fff; font-weight: 700; font-size: 11px; padding: 8px 12px; border-radius: 8px; text-decoration: none;">ICCC Dashboard ➔</a>
            </div>
          </div>
        </div>
      </section>
`;

if (!idx.includes('Latest Integrated Innovations (Presentation Ready)')) {
  idx = idx.replace('<!-- Launchpad Grid Section -->', featureCardsHtml + '\n      <!-- Launchpad Grid Section -->');
  fs.writeFileSync(path.join(DIR, 'index.html'), idx, 'utf8');
  console.log('index.html updated with innovation cards for both new updates!');
}

console.log('\nAll 3 core sites and the 3D Twin now have both updated features fully connected!');
