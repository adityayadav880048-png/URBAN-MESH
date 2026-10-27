const fs = require('fs');
const path = require('path');

const DIR = 'C:\\Users\\staro\\.gemini\\antigravity\\scratch\\smart-chandigarh';
let twin = fs.readFileSync(path.join(DIR, 'twin.html'), 'utf8');

// Fix multi-line alert in twin.html
const brokenAlert = `alert("✓ System Disarmed. Standdown Confirmed.

[JUDGES DEMO NOTE]: Attacker sees this innocent disarm screen, but in background CODE BLACK was secretly sent to Police Control Room! Look at the top banner on the 3D Twin.");`;

const fixedAlert = `alert("✓ System Disarmed. Standdown Confirmed.\\n\\n[JUDGES DEMO NOTE]: Attacker sees this innocent disarm screen, but in background CODE BLACK was secretly sent to Police Control Room! Look at the top banner on the 3D Twin.");`;

twin = twin.replace(brokenAlert, fixedAlert);

fs.writeFileSync(path.join(DIR, 'twin.html'), twin, 'utf8');
console.log('Fixed alert syntax in twin.html!');
