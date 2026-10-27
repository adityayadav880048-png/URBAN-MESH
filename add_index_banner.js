const fs = require('fs');
const path = require('path');

const DIR = 'C:\\Users\\staro\\.gemini\\antigravity\\scratch\\smart-chandigarh';
let idx = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');

const banner = `
    <!-- ══════════ JUDGES UNIFIED SHOWCASE BANNER ══════════ -->
    <a href="twin.html" style="display: flex; align-items: center; justify-content: space-between; padding: 14px 24px; background: linear-gradient(90deg, rgba(0, 240, 255, 0.22), rgba(157, 78, 221, 0.28), rgba(239, 68, 68, 0.28)); border: 2px solid rgba(0, 240, 255, 0.6); border-radius: 16px; margin: 16px 0 24px; text-decoration: none; color: #fff; box-shadow: 0 10px 40px rgba(0, 240, 255, 0.25); transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
      <div style="display: flex; align-items: center; gap: 14px;">
        <span style="font-size: 28px;">🏆</span>
        <div>
          <div style="font-size: 15px; font-weight: 900; color: #00F0FF; letter-spacing: 0.6px; text-transform: uppercase;">
            Judges All-In-One Unified Showcase ➔
          </div>
          <div style="font-size: 12px; color: #e2e8f0; margin-top: 2px;">
            Merged: 3D Chandigarh Digital Twin + Real Satellite View + Google Maps + 30s SOS Siren + Duress PIN 9999
          </div>
        </div>
      </div>
      <div style="background: linear-gradient(135deg, #00F0FF, #9D4EDD); color: #050816; font-weight: 900; font-size: 12px; padding: 10px 20px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,240,255,0.6); white-space: nowrap;">
        LAUNCH LIVE 3D HUB ➔
      </div>
    </a>
`;

if (!idx.includes('Judges All-In-One Unified Showcase')) {
  idx = idx.replace('<main class="main-content">', '<main class="main-content">\n' + banner);
  fs.writeFileSync(path.join(DIR, 'index.html'), idx, 'utf8');
  console.log('Added unified showcase banner to index.html!');
} else {
  console.log('Banner already exists in index.html');
}
