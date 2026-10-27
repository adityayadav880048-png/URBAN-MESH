const fs = require('fs');
const path = require('path');

const DIR = 'C:\\Users\\staro\\.gemini\\antigravity\\scratch\\smart-chandigarh';

// ══════════════════════════════════════════════════════════════════
// 1. UPDATE CITIZEN.HTML WITH DURESS PIN 9999 (FAKE PIN / COERCION)
// ══════════════════════════════════════════════════════════════════
console.log('Adding Duress PIN 9999 to citizen.html...');
let cit = fs.readFileSync(path.join(DIR, 'citizen.html'), 'utf8');

// Replace PIN input hint
const oldPinHint = `<p style="font-size: 11px; opacity: 0.85; margin-bottom: 10px;">
          False alarm? Re-enter your PIN (1234) to safely deactivate:
        </p>`;

const newPinHint = `<p style="font-size: 11px; opacity: 0.9; margin-bottom: 4px;">
          Enter 4-Digit Security Authorization PIN to Deactivate:
        </p>
        <p style="font-size: 10px; color: #94A3B8; margin-bottom: 10px; line-height: 1.4;">
          Standard Disarm: <strong style="color: #60A5FA;">1234</strong> • Hostage / Attacker Coercion: <strong style="color: #F87171;">9999</strong> (Fake PIN: Silences sound immediately but secretly broadcasts Code Black Duress to 112)
        </p>`;

if (cit.includes(oldPinHint)) {
  cit = cit.replace(oldPinHint, newPinHint);
}

// Replace cancelEmergencySos() with Duress PIN 9999 logic
const oldCancelFn = `    function cancelEmergencySos() {
      const pin = document.getElementById('cancelPinInput').value;
      if (pin === '1234') {
        document.getElementById('emergencyAlertModal').classList.remove('active');
        stopSosSirenManually(false);
        document.getElementById('cancelPinInput').value = '';
        showSimpleToast("SOS Deactivated. Standdown broadcasted.");
      } else {
        alert("Incorrect security PIN. Please enter your 4-digit code (1234) to verify authorization.");
      }
    }`;

const newCancelFn = `    function cancelEmergencySos() {
      const pin = (document.getElementById('cancelPinInput').value || '').trim();

      if (pin === '9999') {
        // ════════════════════════════════════════════════════════════════════
        // DURESS PIN 9999: VICTIM IS UNDER ACTIVE COERCION / FORCED BY ATTACKER
        // ════════════════════════════════════════════════════════════════════
        // 1. Immediately silence loud audible siren so attacker believes victim complied
        stopSosSirenManually(false);

        // 2. Dismiss modal smoothly to show calm normal screen
        document.getElementById('emergencyAlertModal').classList.remove('active');
        document.getElementById('cancelPinInput').value = '';

        // 3. Fake innocent disarm toast (attacker watching screen sees innocent success message)
        showSimpleToast("✓ System Disarmed. Standdown Confirmed.");

        // 4. TRIGGER COVERT SILENT TRANSMISSION IN THE BACKGROUND
        window.isDuressCoercionActive = true;
        try { localStorage.setItem('urbanmesh_duress_active', 'true'); } catch(e) {}

        console.warn("%c🚨 [CODE BLACK: DURESS PIN 9999 ENTERED] VICTIM UNDER HOSTAGE COERCION!", "background: #b91c1c; color: white; font-size: 16px; font-weight: bold; padding: 6px;");
        console.warn("ICCC Silent Priority 1 Hostage Protocol Activated. PCR-04 alerted for STEALTH INTERCEPTION (Silent approach, lights/sirens prohibited).");

        // Subtle covert indicator in top header (turns live dot red)
        const liveDot = document.querySelector('.badge-live') || document.querySelector('.status-dot');
        if (liveDot) {
          liveDot.style.background = '#ef4444';
          liveDot.title = 'Silent Duress Beacon Active';
        }

        // Background high-frequency silent GPS telemetry loop (every 5 seconds)
        if (window.duressBeaconTimer) clearInterval(window.duressBeaconTimer);
        window.duressBeaconTimer = setInterval(() => {
          console.log('[SILENT DURESS BEACON] Transmitting covert GPS coords (30.7384° N, 76.7725° E) & ambient mic buffer to Police Control Room.');
        }, 5000);

      } else if (pin === '1234') {
        // Genuine authorization PIN
        document.getElementById('emergencyAlertModal').classList.remove('active');
        stopSosSirenManually(false);
        document.getElementById('cancelPinInput').value = '';

        if (window.duressBeaconTimer) {
          clearInterval(window.duressBeaconTimer);
          window.duressBeaconTimer = null;
        }
        window.isDuressCoercionActive = false;
        try { localStorage.removeItem('urbanmesh_duress_active'); } catch(e) {}

        showSimpleToast("SOS Deactivated. Standdown broadcasted.");
      } else {
        alert("Incorrect security PIN. Please enter your 4-digit code (1234) or verify authorization.");
      }
    }`;

if (cit.includes(oldCancelFn)) {
  cit = cit.replace(oldCancelFn, newCancelFn);
} else {
  // Regex replacement in case whitespace differs
  cit = cit.replace(/function cancelEmergencySos\(\)\s*\{[\s\S]*?alert\("Incorrect security PIN[\s\S]*?\}\s*\}/, newCancelFn);
}

fs.writeFileSync(path.join(DIR, 'citizen.html'), cit, 'utf8');
console.log('Updated citizen.html with Duress PIN 9999 successfully!');


// ══════════════════════════════════════════════════════════════════
// 2. OPTIMIZE TWIN.HTML FOR STRICT 60 FPS PERFORMANCE
// ══════════════════════════════════════════════════════════════════
console.log('Optimizing twin.html for rock-solid 60 FPS...');
let twin = fs.readFileSync(path.join(DIR, 'twin.html'), 'utf8');

// 1. Optimize renderer pixel ratio to cap at 1.75 to prevent 4K GPU throttling
twin = twin.replace(
  "renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));",
  "renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));"
);

// 2. Add real-time dynamic 60 FPS counter to HUD
const oldFpsBadge = '<span class="badge-live" style="font-size: 9px;">99.4% Fps</span>';
const newFpsBadge = '<span class="badge-live" id="fpsMeterBadge" style="font-size: 9px; color: #00FF88; border-color: #00FF88;">60 FPS (Rock Solid)</span>';
if (twin.includes(oldFpsBadge)) {
  twin = twin.replace(oldFpsBadge, newFpsBadge);
}

// 3. Add FPS calculation to animate loop without per-frame allocations
const fpsMonitorCode = `
    // 60 FPS Performance Monitor (Zero garbage collection)
    let frameCounter = 0;
    let lastFpsTime = performance.now();
    let currentFpsDisplay = 60;
`;

if (!twin.includes('frameCounter = 0;')) {
  twin = twin.replace('let clock = new THREE.Clock();', fpsMonitorCode + '\n    let clock = new THREE.Clock();');
}

const fpsTickCode = `
      // Dynamic 60 FPS Measurement
      frameCounter++;
      const now = performance.now();
      if (now - lastFpsTime >= 1000) {
        currentFpsDisplay = Math.round((frameCounter * 1000) / (now - lastFpsTime));
        frameCounter = 0;
        lastFpsTime = now;
        const fpsEl = document.getElementById('fpsMeterBadge');
        if (fpsEl) {
          fpsEl.textContent = currentFpsDisplay + ' FPS (Synced)';
          fpsEl.style.color = currentFpsDisplay >= 55 ? '#00FF88' : '#FFB800';
          fpsEl.style.borderColor = currentFpsDisplay >= 55 ? '#00FF88' : '#FFB800';
        }
      }
`;

if (!twin.includes('currentFpsDisplay = Math.round')) {
  twin = twin.replace('requestAnimationFrame(animate);', 'requestAnimationFrame(animate);\n' + fpsTickCode);
}

// 4. Ensure weather API runs every 60s in background (never blocks render thread)
if (!twin.includes('setInterval(fetchLiveChandigarhTelemetry, 60000);')) {
  twin = twin.replace(
    'fetchLiveChandigarhTelemetry();',
    'fetchLiveChandigarhTelemetry();\n      setInterval(fetchLiveChandigarhTelemetry, 60000);'
  );
}

fs.writeFileSync(path.join(DIR, 'twin.html'), twin, 'utf8');
console.log('Optimized twin.html for 60 FPS successfully!');
