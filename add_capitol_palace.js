const fs = require('fs');
const path = require('path');

const DIR = 'C:\\Users\\staro\\.gemini\\antigravity\\scratch\\smart-chandigarh';
let twin = fs.readFileSync(path.join(DIR, 'twin.html'), 'utf8');

const capitolPalaceCode = `
    // ══════════════════════════════════════════════════════════════
    // CAPITOL COMPLEX — PALACE OF ASSEMBLY & SECRETARIAT (UNESCO)
    // ══════════════════════════════════════════════════════════════
    function buildCapitolComplexPalace() {
      const capitolGroup = new THREE.Group();
      capitolGroup.position.set(-50, 0, -280);

      // ── 1. The Punjab & Haryana Secretariat Building (Brutalist Landmark) ──
      // 250m long monumental concrete block with brise-soleil
      const secMat = new THREE.MeshStandardMaterial({
        color: 0x1e2d4a,
        roughness: 0.6,
        metalness: 0.25,
        map: windowTextureNight
      });
      const secGeo = new THREE.BoxGeometry(110, 34, 20);
      const secretariat = new THREE.Mesh(secGeo, secMat);
      secretariat.position.set(-45, 17, 0);
      secretariat.castShadow = true;
      secretariat.receiveShadow = true;
      capitolGroup.add(secretariat);

      // Horizontal concrete brise-soleil shelves on Secretariat facade
      const louverMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.7 });
      for (let f = 1; f <= 5; f++) {
        const louver = new THREE.Mesh(new THREE.BoxGeometry(112, 0.6, 22), louverMat);
        louver.position.set(-45, f * 5.5, 0);
        louver.castShadow = true;
        capitolGroup.add(louver);
      }

      // Rooftop concrete pavilion / sculptural ramps on Secretariat
      const secRoofPavilion = new THREE.Mesh(
        new THREE.BoxGeometry(32, 6, 14),
        new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 })
      );
      secRoofPavilion.position.set(-45, 37, 0);
      capitolGroup.add(secRoofPavilion);

      // ── 2. Palace of Assembly (Vidhan Sabha with Hyperbolic Scoop) ──
      const assemblyBase = new THREE.Mesh(
        new THREE.BoxGeometry(50, 22, 50),
        new THREE.MeshStandardMaterial({ color: 0x1b2844, roughness: 0.5, metalness: 0.3 })
      );
      assemblyBase.position.set(45, 11, 0);
      assemblyBase.castShadow = true;
      assemblyBase.receiveShadow = true;
      capitolGroup.add(assemblyBase);

      // The iconic Le Corbusier Hyperbolic Scoop / Cooling Tower on Assembly roof
      const scoopGeo = new THREE.CylinderGeometry(8, 14, 18, 24, 1, true);
      const scoopMat = new THREE.MeshStandardMaterial({
        color: 0x9D4EDD,
        emissive: 0x240e44,
        roughness: 0.4,
        metalness: 0.5,
        side: THREE.DoubleSide
      });
      const assemblyScoop = new THREE.Mesh(scoopGeo, scoopMat);
      assemblyScoop.position.set(45, 31, -4);
      assemblyScoop.rotation.x = 0.15; // Angled scoop
      assemblyScoop.castShadow = true;
      capitolGroup.add(assemblyScoop);

      // Front monumental portico canopy (U-shaped crescent concrete roof)
      const portico = new THREE.Mesh(
        new THREE.BoxGeometry(40, 3, 14),
        new THREE.MeshStandardMaterial({ color: 0x00F0FF, emissive: 0x002233, roughness: 0.3 })
      );
      portico.position.set(45, 23, 22);
      capitolGroup.add(portico);

      // Uplight on the Palace of Assembly
      const assemblyLight = new THREE.PointLight(0x9D4EDD, 2.0, 60);
      assemblyLight.position.set(45, 20, 30);
      capitolGroup.add(assemblyLight);

      capitolGroup.userData = {
        name: "Capitol Complex (Palace of Assembly & Secretariat)",
        type: "UNESCO World Heritage Site — Le Corbusier Civic Center",
        desc: "Seat of Punjab & Haryana Governments. Masterpiece of modern brutalist architecture featuring the monumental Secretariat and Palace of Assembly with its hyperbolic cooling tower."
      };

      scene.add(capitolGroup);
    }
`;

// Insert buildCapitolComplexPalace before buildPGIMERMedicalCenter
twin = twin.replace('function buildPGIMERMedicalCenter() {', capitolPalaceCode + '\n    function buildPGIMERMedicalCenter() {');

// Call buildCapitolComplexPalace in init3DTwin
twin = twin.replace('buildOpenHandMonument();', 'buildOpenHandMonument();\n      buildCapitolComplexPalace();');

// Also add a camera preset for Capitol Complex in setCameraView
twin = twin.replace(
  "else if (preset === 'openhand') {",
  "else if (preset === 'capitol' || preset === 'openhand') {"
);

fs.writeFileSync(path.join(DIR, 'twin.html'), twin, 'utf8');
console.log('Successfully added Palace of Assembly and Secretariat to twin.html!');
