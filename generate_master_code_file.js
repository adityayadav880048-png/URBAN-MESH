const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\staro\\.gemini\\antigravity\\scratch\\smart-chandigarh';
const oneDriveDesktop = 'C:\\Users\\staro\\OneDrive\\Desktop';
const localDesktop = 'C:\\Users\\staro\\Desktop';

console.log('Generating consolidated master code file...');

const filesToInclude = [
  { name: 'server.js', lang: 'javascript', desc: 'Zero-dependency Node.js HTTP local web server' },
  { name: 'package.json', lang: 'json', desc: 'Project metadata and npm scripts' },
  { name: '.gitignore', lang: 'gitignore', desc: 'Git ignore rules for clean repo' },
  { name: 'index.html', lang: 'html', desc: 'Main Landing Portal & Gateway with AI Copilot' },
  { name: 'citizen.html', lang: 'html', desc: 'Citizen Mobile App (SafePath, Women Safety Toolkit, 112 SOS, AI Copilot)' },
  { name: 'dashboard.html', lang: 'html', desc: 'ICCC Command Centre Dashboard (9 Panels, 3D Mesh, Analytics, AI Copilot)' },
  { name: 'twin.html', lang: 'html', desc: 'Full-Screen 3D Digital Twin (Three.js WebGL, 2000 Stars, Chowk, PGIMER, Copilot)' },
  { name: 'GITHUB_DEPLOYMENT_GUIDE.md', lang: 'markdown', desc: 'Step-by-step GitHub push and GitHub Pages deployment guide' },
  { name: 'README.md', lang: 'markdown', desc: 'Comprehensive project documentation, architecture, and PS-02 compliance matrix' }
];

const lines = [];
lines.push('# URBAN MESH — COMPLETE PROJECT ALL-IN-ONE SOURCE CODE FILE');
lines.push('');
lines.push('> **Project Name:** Urban Mesh');
lines.push('> **Target City:** Chandigarh, India (PS-02 Smart & Sustainable Cities)');
lines.push('> **Generated on:** ' + new Date().toLocaleString());
lines.push('> **Total Files Included:** ' + filesToInclude.length);
lines.push('');
lines.push('---');
lines.push('');
lines.push('## 📑 TABLE OF CONTENTS');
lines.push('');

filesToInclude.forEach((f, i) => {
  lines.push(`${i + 1}. **${f.name}** — *${f.desc}*`);
});

lines.push('');
lines.push('---');
lines.push('');
lines.push('## 🚀 HOW TO RUN LOCALLY ON ANY DEVICE');
lines.push('');
lines.push('1. Put all files (`index.html`, `citizen.html`, `dashboard.html`, `twin.html`, `server.js`, `package.json`) in the same folder.');
lines.push('2. Open your terminal / command prompt in that folder.');
lines.push('3. Run `node server.js`');
lines.push('4. Open http://localhost:3000 in your browser.');
lines.push('');
lines.push('---');
lines.push('');

filesToInclude.forEach((f, i) => {
  const filePath = path.join(srcDir, f.name);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    lines.push(`## ====================================================================`);
    lines.push(`## FILE ${i + 1} OF ${filesToInclude.length}: ${f.name}`);
    lines.push(`## Description: ${f.desc}`);
    lines.push(`## Size: ${(content.length / 1024).toFixed(2)} KB`);
    lines.push(`## ====================================================================`);
    lines.push('');
    lines.push('```' + f.lang);
    lines.push(content);
    lines.push('```');
    lines.push('');
    lines.push('---');
    lines.push('');
    console.log(`Included: ${f.name} (${(content.length / 1024).toFixed(1)} KB)`);
  } else {
    console.log(`Warning: File not found: ${f.name}`);
  }
});

const masterContent = lines.join('\n');
const outNameMd = 'URBAN_MESH_ALL_CODE.md';
const outNameTxt = 'URBAN_MESH_ALL_CODE.txt';

// Save in scratch directory
fs.writeFileSync(path.join(srcDir, outNameMd), masterContent, 'utf8');
fs.writeFileSync(path.join(srcDir, outNameTxt), masterContent, 'utf8');
console.log(`Saved master files in scratch. Size: ${(masterContent.length / 1024).toFixed(1)} KB`);

// Ensure Desktop destination folders exist
const destFolders = [
  path.join(oneDriveDesktop, 'chandigarhsync'),
  path.join(localDesktop, 'chandigarhsync')
];

destFolders.forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Copy master files directly to Desktop AND inside chandigarhsync folder
const copies = [
  path.join(oneDriveDesktop, outNameMd),
  path.join(oneDriveDesktop, outNameTxt),
  path.join(localDesktop, outNameMd),
  path.join(localDesktop, outNameTxt),
  path.join(oneDriveDesktop, 'chandigarhsync', outNameMd),
  path.join(oneDriveDesktop, 'chandigarhsync', outNameTxt),
  path.join(localDesktop, 'chandigarhsync', outNameMd),
  path.join(localDesktop, 'chandigarhsync', outNameTxt)
];

copies.forEach(target => {
  try {
    fs.writeFileSync(target, masterContent, 'utf8');
    console.log('Written to:', target);
  } catch(e) {
    console.log('Notice for', target, ':', e.message);
  }
});

// Also sync all updated individual files to desktop chandigarhsync folder
function syncFolder(src, dest) {
  const items = fs.readdirSync(src, { withFileTypes: true });
  for (const item of items) {
    if (!item.isDirectory()) {
      const s = path.join(src, item.name);
      const d = path.join(dest, item.name);
      fs.copyFileSync(s, d);
    }
  }
}

destFolders.forEach(dest => {
  try {
    syncFolder(srcDir, dest);
    console.log('Synced folder:', dest);
  } catch(e) {
    console.log('Notice sync:', e.message);
  }
});

console.log('SUCCESS: All code has been provided in the master file and saved to your Desktop!');
