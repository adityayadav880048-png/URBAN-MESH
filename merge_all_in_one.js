const fs = require('fs');
const path = require('path');

const DIR = 'C:\\Users\\staro\\.gemini\\antigravity\\scratch\\smart-chandigarh';

console.log('Merging SOS 30s Siren + Duress PIN 9999 + Satellite & Google Maps into twin.html...');
let twin = fs.readFileSync(path.join(DIR, 'twin.html'), 'utf8');

// 1. Add SOS Simulator button to Top Actions in twin.html
const topActionsTarget = '<div class="top-actions">';
const sosBtnHtml = `<div class="top-actions">
      <button class="hud-btn hud-btn-alert" id="sosSimulatorBtn" onclick="openSosSimulatorModal()" style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.45), rgba(185, 28, 28, 0.55)); border-color: #ef4444; font-weight: 800; box-shadow: 0 0 25px rgba(239,68,68,0.6); animation: pulse 1.6s infinite alternate;" title="Judges Demo: Test 30s Emergency Siren & Duress PIN 9999">
        🚨 Test SOS (30s Siren & Duress PIN)
      </button>`;

if (!twin.includes('id="sosSimulatorBtn"')) {
  twin = twin.replace(topActionsTarget, sosBtnHtml);
}

// 2. Add Code Black Duress Banner right next to corridorBanner
const corridorBannerTarget = '<div class="corridor-banner" id="corridorBanner">';
const duressBannerHtml = `<!-- CODE BLACK DURESS PIN BANNER -->
  <div class="corridor-banner" id="duressCodeBlackBanner" style="top: 140px; background: linear-gradient(90deg, #dc2626, #991b1b); color: #ffffff; box-shadow: 0 0 45px rgba(239, 68, 68, 0.9); border: 2px solid #f87171; display: none;">
    <span>🚨 [CODE BLACK: DURESS PIN 9999 DETECTED — SECTOR 22] VICTIM UNDER HOSTAGE COERCION! PCR-04 IN SILENT STEALTH APPROACH (NO SIRENS)</span>
    <button onclick="dismissDuressBanner()" style="margin-left: 12px; background: rgba(255,255,255,0.2); border: none; color: #fff; padding: 2px 8px; border-radius: 4px; cursor: pointer; font-size: 11px;">Dismiss</button>
  </div>

  <div class="corridor-banner" id="corridorBanner">`;

if (!twin.includes('id="duressCodeBlackBanner"')) {
  twin = twin.replace(corridorBannerTarget, duressBannerHtml);
}

// 3. Add Full-Featured SOS Siren & Duress PIN Modal HTML & CSS
const sosModalHTML = `
  <!-- ══════════ ALL-IN-ONE SOS EMERGENCY & DURESS PIN MODAL ══════════ -->
  <style>
    .twin-sos-modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(4, 7, 20, 0.88);
      backdrop-filter: blur(16px);
      z-index: 99999;
      display: none;
      align-items: center;
      justify-content: center;
      animation: fadeInModal 0.25s ease forwards;
    }
    .twin-sos-modal-overlay.active { display: flex; }
    @keyframes fadeInModal {
      from { opacity: 0; transform: scale(0.96); }
      to { opacity: 1; transform: scale(1); }
    }
    .twin-sos-dialog {
      width: 92%;
      max-width: 440px;
      background: linear-gradient(135deg, rgba(16, 24, 52, 0.98), rgba(8, 12, 28, 0.98));
      border: 2px solid #ef4444;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(239,68,68,0.5);
      padding: 24px;
      text-align: center;
      position: relative;
      font-family: 'Inter', sans-serif;
    }
    .sos-dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
      text-align: left;
    }
    .sos-beacon-pulse {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: linear-gradient(135deg, #ef4444, #b91c1c);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      box-shadow: 0 0 25px rgba(239,68,68,0.8);
      animation: pulse 1s infinite alternate;
    }
    .sos-strobe-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      pointer-events: none;
      z-index: 99998;
      display: none;
    }
    .sos-strobe-overlay.active {
      display: block;
      animation: redStrobeFlash 0.4s infinite;
    }
    @keyframes redStrobeFlash {
      0%, 100% { box-shadow: inset 0 0 120px rgba(239, 68, 68, 0.65); }
      50% { box-shadow: inset 0 0 40px rgba(239, 68, 68, 0.15); }
    }
  </style>

  <div class="sos-strobe-overlay" id="twinSosStrobe"></div>

  <div class="twin-sos-modal-overlay" id="twinSosModal">
    <div class="twin-sos-dialog">
      <div class="sos-dialog-header">
        <div class="sos-beacon-pulse">🚨</div>
        <div>
          <h2 style="font-size: 17px; font-weight: 800; color: #fff; margin: 0; display:flex; align-items:center; gap:6px;">
            <span>WOMEN'S SOS EMERGENCY ACTIVE</span>
          </h2>
          <p style="font-size: 11px; color: #94A3B8; margin: 2px 0 0;">ICCC Central Emergency Grid Locked • Sector 22</p>
        </div>
        <button onclick="closeSosModalOnly()" style="margin-left: auto; background: none; border: none; color: #94A3B8; font-size: 20px; cursor: pointer;">✕</button>
      </div>

      <!-- 30-SECOND LOUD SIREN & COUNTDOWN BOX -->
      <div id="twinSirenBox" style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(185, 28, 28, 0.35)); border: 2px solid #ef4444; border-radius: 14px; padding: 14px; margin-bottom: 16px; box-shadow: 0 0 25px rgba(239, 68, 68, 0.4);">
        <div style="font-size: 12px; font-weight: 800; color: #fca5a5; letter-spacing: 0.8px; display:flex; align-items:center; justify-content:center; gap:6px;">
          <span style="animation: bounce 0.5s infinite alternate;">🔊</span>
          <span>HIGH-DECIBEL EMERGENCY ALARM PLAYING</span>
        </div>
        <div id="twinCountdownText" style="font-size: 42px; font-weight: 900; color: #fff; font-family: 'JetBrains Mono', monospace; margin: 4px 0; text-shadow: 0 0 20px #ef4444;">
          00:30
        </div>
        <div style="font-size: 11px; color: #fecaca; margin-bottom: 10px;">
          Audible deterrence alarm • Auto-silences in <strong id="twinSecsRemaining">30</strong> seconds
        </div>
        <button type="button" onclick="muteTwinSirenOnly()" style="background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); color: #fff; padding: 6px 16px; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer;">
          🔇 Mute Siren Sound
        </button>
      </div>

      <!-- SECURITY PIN VERIFICATION (GENUINE 1234 VS DURESS 9999) -->
      <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 14px; text-align: left;">
        <label style="font-size: 11px; font-weight: 700; color: #E2E8F0; display: block; margin-bottom: 6px;">
          Enter 4-Digit Authorization PIN to Deactivate:
        </label>
        <div style="display: flex; gap: 8px; margin-bottom: 10px;">
          <input type="password" id="twinSosPinInput" maxlength="4" placeholder="••••" style="flex: 1; text-align: center; font-size: 20px; font-weight: 800; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.2); border-radius: 10px; color: #fff; padding: 10px; outline: none; letter-spacing: 6px;" onkeydown="if(event.key==='Enter')verifyTwinSosPin()">
          <button onclick="verifyTwinSosPin()" style="background: #ef4444; border: none; color: #fff; font-weight: 800; padding: 10px 18px; border-radius: 10px; cursor: pointer; font-size: 13px;">
            Submit PIN
          </button>
        </div>

        <div style="font-size: 10px; color: #94A3B8; line-height: 1.5; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 8px;">
          💡 <strong>Hackathon Demo Guide:</strong><br>
          • Normal Disarm: Enter <strong style="color: #60a5fa;">1234</strong> (Genuine cancellation)<br>
          • Attacker Coercion / Hostage: Enter <strong style="color: #f87171;">9999</strong> (Fake PIN: silences sound immediately, pretends disarmed on screen, but secretly alerts police for silent stealth intercept!)
        </div>
      </div>
    </div>
  </div>
`;

if (!twin.includes('id="twinSosModal"')) {
  twin = twin.replace('<!-- Google Maps Satellite Mini-Map Overlay -->', sosModalHTML + '\n  <!-- Google Maps Satellite Mini-Map Overlay -->');
}

// 4. Implement Web Audio API 30s Siren & Duress PIN logic inside twin.html script
const twinSosScript = `
    // ══════════════════════════════════════════════════════════════
    // ALL-IN-ONE WOMEN'S SOS SIREN ENGINE & DURESS PIN 9999
    // ══════════════════════════════════════════════════════════════
    let twinAudioCtx = null;
    let twinOscillator = null;
    let twinGainNode = null;
    let twinWarbleTimer = null;
    let twinCountdownTimer = null;
    let twinTimeRemaining = 30;
    let sosDistressBeaconMesh = null;

    function openSosSimulatorModal() {
      playBeep('alert');
      document.getElementById('twinSosModal').classList.add('active');
      document.getElementById('twinSosStrobe').classList.add('active');
      document.getElementById('twinSosPinInput').value = '';
      document.getElementById('twinSosPinInput').focus();

      // Start 30-Second Loud Emergency Siren
      startTwin30SecSiren();

      // Spawn or highlight 3D Distress Beacon at Sector 22 Market (x: 62, z: 50)
      createOrActivate3dDistressBeacon(62, 50);

      // Smoothly fly camera to Sector 22 emergency incident
      startCameraTransition(new THREE.Vector3(95, 60, 95), new THREE.Vector3(62, 10, 50));
    }

    function startTwin30SecSiren() {
      try {
        if (!twinAudioCtx) {
          twinAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (twinAudioCtx.state === 'suspended') {
          twinAudioCtx.resume();
        }

        stopTwinSirenEngine();

        twinOscillator = twinAudioCtx.createOscillator();
        twinGainNode = twinAudioCtx.createGain();

        twinOscillator.type = 'sawtooth';
        twinOscillator.frequency.setValueAtTime(880, twinAudioCtx.currentTime);
        twinGainNode.gain.setValueAtTime(0.24, twinAudioCtx.currentTime);

        twinOscillator.connect(twinGainNode);
        twinGainNode.connect(twinAudioCtx.destination);
        twinOscillator.start();

        // Dual-tone police/ambulance warble siren (880Hz <-> 1450Hz)
        let isHighTone = false;
        twinWarbleTimer = setInterval(() => {
          if (!twinOscillator || !twinAudioCtx) return;
          isHighTone = !isHighTone;
          const targetFreq = isHighTone ? 1450 : 880;
          twinOscillator.frequency.setTargetAtTime(targetFreq, twinAudioCtx.currentTime, 0.08);
        }, 320);

        // 30-Second Countdown
        twinTimeRemaining = 30;
        updateTwinCountdown(twinTimeRemaining);

        if (twinCountdownTimer) clearInterval(twinCountdownTimer);
        twinCountdownTimer = setInterval(() => {
          twinTimeRemaining--;
          updateTwinCountdown(twinTimeRemaining);

          if (twinTimeRemaining <= 0) {
            stopTwinSirenEngine();
            const box = document.getElementById('twinSirenBox');
            if (box) {
              box.style.border = '2px solid #22c55e';
              box.style.background = 'rgba(34, 197, 94, 0.2)';
              box.innerHTML = '<div style="color: #86efac; font-weight: 800; font-size: 13px;">✅ 30-SECOND AUDIBLE SIREN COMPLETE • SILENCED</div><div style="font-size: 11px; color: #bbf7d0; margin-top: 4px;">Silent GPS Beacon remains active on 3D Digital Twin.</div>';
            }
          }
        }, 1000);

      } catch (err) {
        console.warn('Audio API notice:', err);
      }
    }

    function updateTwinCountdown(secs) {
      const display = document.getElementById('twinCountdownText');
      const rem = document.getElementById('twinSecsRemaining');
      if (display) {
        const s = secs < 10 ? '0' + secs : secs;
        display.textContent = '00:' + s;
      }
      if (rem) rem.textContent = secs;
    }

    function stopTwinSirenEngine() {
      if (twinWarbleTimer) { clearInterval(twinWarbleTimer); twinWarbleTimer = null; }
      if (twinCountdownTimer) { clearInterval(twinCountdownTimer); twinCountdownTimer = null; }
      if (twinOscillator) {
        try { twinOscillator.stop(); twinOscillator.disconnect(); } catch (e) {}
        twinOscillator = null;
      }
      document.getElementById('twinSosStrobe').classList.remove('active');
    }

    function muteTwinSirenOnly() {
      playBeep('click');
      stopTwinSirenEngine();
      const display = document.getElementById('twinCountdownText');
      if (display) display.textContent = 'MUTED';
    }

    function closeSosModalOnly() {
      playBeep('click');
      document.getElementById('twinSosModal').classList.remove('active');
    }

    function verifyTwinSosPin() {
      const pin = (document.getElementById('twinSosPinInput').value || '').trim();

      if (pin === '9999') {
        // ════════════════════════════════════════════════════════════════
        // DURESS PIN 9999 (FAKE PIN / VICTIM COERCED BY ATTACKER)
        // ════════════════════════════════════════════════════════════════
        playBeep('safe');
        stopTwinSirenEngine();
        document.getElementById('twinSosModal').classList.remove('active');

        // Show Code Black Duress Banner across top of 3D Digital Twin
        const duressBanner = document.getElementById('duressCodeBlackBanner');
        if (duressBanner) duressBanner.style.display = 'flex';

        // Update 3D beacon to intense pulsing Code Black crimson
        if (sosDistressBeaconMesh) {
          sosDistressBeaconMesh.material.color.setHex(0xff0033);
        }

        // Fake calm message on victim screen (so attacker sees innocent disarm)
        alert("✓ System Disarmed. Standdown Confirmed.\n\n[JUDGES DEMO NOTE]: Attacker sees this innocent disarm screen, but in background CODE BLACK was secretly sent to Police Control Room! Look at the top banner on the 3D Twin.");

        console.warn("%c🚨 [CODE BLACK: DURESS PIN 9999 ENTERED] VICTIM UNDER HOSTAGE COERCION!", "background: #b91c1c; color: white; font-size: 16px; font-weight: bold; padding: 6px;");
        console.warn("PCR-04 dispatched in silent stealth approach (lights/sirens prohibited).");

      } else if (pin === '1234') {
        // Genuine authorization PIN
        playBeep('safe');
        stopTwinSirenEngine();
        document.getElementById('twinSosModal').classList.remove('active');
        dismissDuressBanner();

        if (sosDistressBeaconMesh) {
          scene.remove(sosDistressBeaconMesh);
          sosDistressBeaconMesh = null;
        }

        alert("✓ Genuine PIN Accepted. SOS Deactivated. Standdown broadcasted.");
      } else {
        playBeep('alert');
        alert("Incorrect security PIN. Please enter 1234 (Genuine Disarm) or 9999 (Duress PIN under coercion).");
      }
    }

    function dismissDuressBanner() {
      const banner = document.getElementById('duressCodeBlackBanner');
      if (banner) banner.style.display = 'none';
    }

    function createOrActivate3dDistressBeacon(x, z) {
      if (!sosDistressBeaconMesh) {
        const beaconGroup = new THREE.Group();
        beaconGroup.position.set(x, 0, z);

        // Ground warning ring
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(10, 14, 32),
          new THREE.MeshBasicMaterial({ color: 0xff3366, side: THREE.DoubleSide, transparent: true, opacity: 0.8 })
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.4;
        beaconGroup.add(ring);

        // Floating pulsating octahedron
        const octa = new THREE.Mesh(
          new THREE.OctahedronGeometry(4, 0),
          new THREE.MeshStandardMaterial({ color: 0xff0033, emissive: 0x660011, roughness: 0.2 })
        );
        octa.position.y = 14;
        beaconGroup.add(octa);

        // Vertical laser light beam pointing to sky
        const beam = new THREE.Mesh(
          new THREE.CylinderGeometry(0.4, 0.4, 120),
          new THREE.MeshBasicMaterial({ color: 0xff3366, transparent: true, opacity: 0.65 })
        );
        beam.position.y = 60;
        beaconGroup.add(beam);

        beaconGroup.userData = {
          name: "🚨 ACTIVE SOS INCIDENT #SOS-2201 (Sector 22)",
          type: "Critical Women Safety Distress",
          desc: "Live panic beacon triggered from Sector 22 Market. PCR-04 dispatched to coordinates 30.7350° N, 76.7690° E."
        };

        scene.add(beaconGroup);
        sosDistressBeaconMesh = octa;
      }
    }
`;

twin = twin.replace('function init3DTwin() {', twinSosScript + '\n    function init3DTwin() {');

fs.writeFileSync(path.join(DIR, 'twin.html'), twin, 'utf8');
console.log('twin.html successfully upgraded as the Master All-In-One Unified Platform!');
