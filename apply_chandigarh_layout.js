const fs = require('fs');
const path = require('path');

const DIR = 'C:\\Users\\staro\\.gemini\\antigravity\\scratch\\smart-chandigarh';
console.log('Rebuilding Chandigarh authentic Le Corbusier sector grid layout...');

let twin = fs.readFileSync(path.join(DIR, 'twin.html'), 'utf8');

// ═══════════════════════════════════════════════════════════
// REPLACE: buildGroundAndPavements → Chandigarh terrain + Shivalik hills + Sukhna Lake
// ═══════════════════════════════════════════════════════════

const oldGroundFn = twin.substring(
  twin.indexOf('function buildGroundAndPavements() {'),
  twin.indexOf('// ══════════════════════════════════════════════════════════════\n    // CHANDIGARH CHOWK')
);

const newGroundFn = `function buildGroundAndPavements() {
      // ── Chandigarh Metropolitan Ground Plane ──
      const groundGeo = new THREE.PlaneGeometry(800, 700);
      cyberGroundMat = new THREE.MeshStandardMaterial({
        color: 0x090e1e,
        roughness: 0.95,
        metalness: 0.05
      });
      const ground = new THREE.Mesh(groundGeo, cyberGroundMat);
      groundMeshRef = ground;
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      scene.add(ground);

      // Holographic Sector Grid Overlay
      const grid = new THREE.GridHelper(800, 40, 0x00F0FF, 0x111e38);
      groundGridRef = grid;
      grid.position.y = 0.08;
      grid.material.opacity = 0.18;
      grid.material.transparent = true;
      scene.add(grid);

      // ── Shivalik Hill Range Backdrop (North Edge) ──
      // Chandigarh sits at the foothills of the Shivaliks
      const hillMat = new THREE.MeshStandardMaterial({ color: 0x0a2016, roughness: 0.95, flatShading: true });
      for (let i = 0; i < 8; i++) {
        const hx = -300 + i * 85;
        const hw = 60 + Math.sin(i * 2.1) * 20;
        const hh = 22 + Math.sin(i * 1.7) * 12;
        const hill = new THREE.Mesh(
          new THREE.ConeGeometry(hw, hh, 5),
          hillMat
        );
        hill.position.set(hx, hh / 2, -340);
        hill.castShadow = true;
        scene.add(hill);
      }

      // ── Sukhna Lake (Northeast of Capitol Complex) ──
      const lakeShape = new THREE.Shape();
      lakeShape.moveTo(0, 0);
      lakeShape.bezierCurveTo(40, 15, 65, 30, 80, 10);
      lakeShape.bezierCurveTo(85, -10, 50, -25, 30, -20);
      lakeShape.bezierCurveTo(10, -15, -5, -5, 0, 0);

      const lakeMesh = new THREE.Mesh(
        new THREE.ShapeGeometry(lakeShape),
        new THREE.MeshStandardMaterial({
          color: 0x0088cc,
          emissive: 0x003355,
          roughness: 0.1,
          metalness: 0.85,
          transparent: true,
          opacity: 0.88
        })
      );
      lakeMesh.rotation.x = -Math.PI / 2;
      lakeMesh.position.set(230, 0.3, -280);
      lakeMesh.userData = {
        name: "Sukhna Lake (Sector 1 / Northeast)",
        type: "Protected Reservoir & Recreation",
        desc: "Man-made reservoir designed by Le Corbusier at the Shivalik foothills. Evening promenade, rowing, and bird sanctuary."
      };
      scene.add(lakeMesh);

      // Lake Promenade Walkway
      const promenade = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 5),
        new THREE.MeshStandardMaterial({ color: 0x1e2738, roughness: 0.8 })
      );
      promenade.rotation.x = -Math.PI / 2;
      promenade.position.set(250, 0.22, -258);
      promenade.rotation.z = 0.15;
      scene.add(promenade);

      // ── Sector Green Belt Pads (Between V3 Roads) ──
      // Chandigarh is famous for green buffers between each sector
      const greenBeltMat = new THREE.MeshStandardMaterial({ color: 0x0c1f15, roughness: 0.9 });
      // Horizontal green belts (between sector rows)
      [-200, -100, 0, 100, 200].forEach(z => {
        const belt = new THREE.Mesh(
          new THREE.PlaneGeometry(700, 12),
          greenBeltMat
        );
        belt.rotation.x = -Math.PI / 2;
        belt.position.set(0, 0.12, z);
        belt.receiveShadow = true;
        scene.add(belt);
      });
      // Vertical green belts
      [-250, -125, 0, 125, 250].forEach(x => {
        const belt = new THREE.Mesh(
          new THREE.PlaneGeometry(12, 600),
          greenBeltMat
        );
        belt.rotation.x = -Math.PI / 2;
        belt.position.set(x, 0.12, 0);
        belt.receiveShadow = true;
        scene.add(belt);
      });

      // ── Floating Sector Labels (Holographic) ──
      // We'll use simple plane meshes with sector numbers positioned at each sector center
      const sectorGrid = [
        // Row 1 (North) - Capitol, Sectors 1-5
        { name: "CAPITOL", x: 0, z: -270, color: 0x9D4EDD },
        { name: "SEC 1", x: 190, z: -270, color: 0x00F0FF },
        // Row 2 - Sectors 6-11
        { name: "SEC 7", x: -187, z: -150, color: 0x00F0FF },
        { name: "SEC 8", x: -62, z: -150, color: 0x00F0FF },
        { name: "SEC 9", x: 62, z: -150, color: 0x00F0FF },
        { name: "SEC 10", x: 187, z: -150, color: 0x00F0FF },
        // Row 3 - Sectors 12-17 (Key sectors)
        { name: "SEC 12\\nPGIMER", x: -187, z: -50, color: 0xFF3366 },
        { name: "SEC 14", x: -62, z: -50, color: 0x00F0FF },
        { name: "SEC 15", x: 62, z: -50, color: 0x00F0FF },
        { name: "SEC 16\\nROSE GARDEN", x: 187, z: -50, color: 0xFF2E93 },
        // Row 4 - Sectors 17-22
        { name: "SEC 19", x: -187, z: 50, color: 0x00F0FF },
        { name: "SEC 17\\nPLAZA", x: -62, z: 50, color: 0x9D4EDD },
        { name: "SEC 22\\nMARKET", x: 62, z: 50, color: 0xFFB800 },
        { name: "SEC 23", x: 187, z: 50, color: 0x00F0FF },
        // Row 5 - Sectors south
        { name: "SEC 26", x: -187, z: 150, color: 0x00F0FF },
        { name: "SEC 27", x: -62, z: 150, color: 0x00F0FF },
        { name: "SEC 28", x: 62, z: 150, color: 0x00F0FF },
        { name: "SEC 29", x: 187, z: 150, color: 0x00F0FF },
      ];

      sectorGrid.forEach(sec => {
        // Sector boundary glowing rectangle outline
        const outline = new THREE.LineSegments(
          new THREE.EdgesGeometry(new THREE.PlaneGeometry(115, 90)),
          new THREE.LineBasicMaterial({ color: sec.color, transparent: true, opacity: 0.2 })
        );
        outline.rotation.x = -Math.PI / 2;
        outline.position.set(sec.x, 0.15, sec.z);
        scene.add(outline);
      });
    }

    `;

twin = twin.replace(oldGroundFn, newGroundFn);

// ═══════════════════════════════════════════════════════════
// REPLACE: buildChandigarhRoundaboutAndRoads → Real V-Road Hierarchy Grid
// ═══════════════════════════════════════════════════════════

const oldRoadFn = twin.substring(
  twin.indexOf('function buildChandigarhRoundaboutAndRoads() {'),
  twin.indexOf('// ══════════════════════════════════════════════════════════════\n    // LE CORBUSIER SECTOR ARCHITECTURE')
);

const newRoadFn = `function buildChandigarhRoundaboutAndRoads() {
      const roadMat = new THREE.MeshStandardMaterial({ color: 0x151b29, roughness: 0.85, metalness: 0.15 });
      const curbMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.7 });
      const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0x1e2738, roughness: 0.8 });
      const markingMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

      // ═══ V1: MADHYA MARG (Major East-West Arterial, 34m wide) ═══
      // Runs through Sectors 9/10 boundary → Sector 15/16 → east exit
      const madhyaMarg = new THREE.Mesh(new THREE.PlaneGeometry(800, 28), roadMat);
      madhyaMarg.rotation.x = -Math.PI / 2;
      madhyaMarg.position.set(0, 0.2, -50);
      madhyaMarg.receiveShadow = true;
      madhyaMarg.userData = {
        name: "Madhya Marg (V1 — East-West Primary Arterial)",
        type: "8-Lane National Highway",
        desc: "The spine of Chandigarh connecting PGI (Sec 12) with Transport Chowk. Green Corridor enabled for emergency ambulances."
      };
      groupInfrastructure.add(madhyaMarg);

      // V1 Sidewalks
      [-66, -34].forEach(zPos => {
        const sw = new THREE.Mesh(new THREE.BoxGeometry(800, 0.35, 4), sidewalkMat);
        sw.position.set(0, 0.25, zPos);
        groupInfrastructure.add(sw);
      });

      // V1 Median
      const v1Median = new THREE.Mesh(
        new THREE.BoxGeometry(800, 0.4, 2.5),
        new THREE.MeshStandardMaterial({ color: 0x103522, roughness: 0.95 })
      );
      v1Median.position.set(0, 0.26, -50);
      groupInfrastructure.add(v1Median);

      // ═══ V2: JAN MARG (Major North-South Arterial, 28m wide) ═══
      // Runs from Capitol Complex south through Sector 17 and beyond
      const janMarg = new THREE.Mesh(new THREE.PlaneGeometry(24, 700), roadMat);
      janMarg.rotation.x = -Math.PI / 2;
      janMarg.position.set(0, 0.21, -20);
      janMarg.receiveShadow = true;
      janMarg.userData = {
        name: "Jan Marg (V2 — North-South Ceremonial Grand Axis)",
        type: "6-Lane Civic Boulevard",
        desc: "Le Corbusier's grand ceremonial axis connecting Capitol Complex with Sector 17 Plaza."
      };
      groupInfrastructure.add(janMarg);

      // ═══ V3: SECTOR DIVIDER ROADS (12-16m wide, the grid lines) ═══
      // Horizontal V3 Roads (East-West)
      [-200, -100, 0, 100, 200].forEach(z => {
        const v3h = new THREE.Mesh(new THREE.PlaneGeometry(700, 14), roadMat);
        v3h.rotation.x = -Math.PI / 2;
        v3h.position.set(0, 0.19, z);
        v3h.receiveShadow = true;
        groupInfrastructure.add(v3h);

        // Lane markings
        for (let x = -320; x <= 320; x += 20) {
          const dash = new THREE.Mesh(new THREE.PlaneGeometry(10, 0.4), markingMat);
          dash.rotation.x = -Math.PI / 2;
          dash.position.set(x, 0.25, z);
          groupInfrastructure.add(dash);
        }
      });

      // Vertical V3 Roads (North-South)
      [-250, -125, 0, 125, 250].forEach(x => {
        const v3v = new THREE.Mesh(new THREE.PlaneGeometry(14, 600), roadMat);
        v3v.rotation.x = -Math.PI / 2;
        v3v.position.set(x, 0.19, 0);
        v3v.receiveShadow = true;
        groupInfrastructure.add(v3v);

        for (let z = -280; z <= 280; z += 20) {
          const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 10), markingMat);
          dash.rotation.x = -Math.PI / 2;
          dash.position.set(x, 0.25, z);
          groupInfrastructure.add(dash);
        }
      });

      // ═══ CHANDIGARH ROUNDABOUTS (Chowks at Major Intersections) ═══
      const chowkPositions = [
        { x: 0, z: -50, name: "Matka Chowk (Madhya Marg × Jan Marg)", size: 18 },
        { x: -125, z: -50, name: "Tribune Chowk (Madhya Marg × V3)", size: 14 },
        { x: 125, z: -50, name: "Piccadilly Chowk (Madhya Marg × V3)", size: 14 },
        { x: 0, z: 0, name: "Sector 17/22 Interchange", size: 12 },
        { x: 0, z: -100, name: "Sector 9/15 Junction", size: 12 },
        { x: -125, z: 0, name: "Sector 19/22 Junction", size: 10 },
        { x: 125, z: 0, name: "Sector 22/23 Junction", size: 10 }
      ];

      const grassMat = new THREE.MeshStandardMaterial({ color: 0x103522, roughness: 0.95 });

      chowkPositions.forEach(ch => {
        const chowkGroup = new THREE.Group();
        chowkGroup.position.set(ch.x, 0.22, ch.z);

        // Asphalt roundabout ring
        const rotaryRoad = new THREE.Mesh(
          new THREE.RingGeometry(ch.size * 0.65, ch.size, 32),
          roadMat
        );
        rotaryRoad.rotation.x = -Math.PI / 2;
        chowkGroup.add(rotaryRoad);

        // Green landscaped island
        const island = new THREE.Mesh(
          new THREE.CylinderGeometry(ch.size * 0.6, ch.size * 0.65, 0.8, 24),
          grassMat
        );
        island.position.y = 0.4;
        island.receiveShadow = true;
        chowkGroup.add(island);

        // Kerb ring
        const kerb = new THREE.Mesh(
          new THREE.TorusGeometry(ch.size * 0.63, 0.3, 6, 24),
          curbMat
        );
        kerb.rotation.x = Math.PI / 2;
        kerb.position.y = 0.7;
        chowkGroup.add(kerb);

        // Glowing center spire for main chowks
        if (ch.size >= 14) {
          const spire = new THREE.Mesh(
            new THREE.ConeGeometry(1.2, 12, 6),
            new THREE.MeshStandardMaterial({ color: 0x00F0FF, emissive: 0x003344, metalness: 0.8 })
          );
          spire.position.y = 7;
          spire.castShadow = true;
          chowkGroup.add(spire);

          const chLight = new THREE.PointLight(0x00F0FF, 1.2, 35);
          chLight.position.set(0, 4, 0);
          chowkGroup.add(chLight);
        }

        chowkGroup.userData = {
          name: ch.name,
          type: "Grade-Separated Smart Rotary",
          desc: "Chandigarh roundabout with AI traffic queue monitoring."
        };

        groupInfrastructure.add(chowkGroup);
      });

      // ═══ ZEBRA CROSSINGS at Madhya Marg Chowks ═══
      chowkPositions.filter(c => c.z === -50).forEach(ch => {
        [-ch.size - 8, ch.size + 8].forEach(offset => {
          for (let z = -10; z <= 10; z += 2.8) {
            const stripe = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 1.3), markingMat);
            stripe.rotation.x = -Math.PI / 2;
            stripe.position.set(ch.x + offset, 0.27, ch.z + z);
            groupInfrastructure.add(stripe);
          }
        });
      });

      // ═══ V4: SHOPPING STREETS (Internal sector commercial roads) ═══
      // Sector 17 internal commercial street grid
      [-80, -44].forEach(x => {
        const shop = new THREE.Mesh(new THREE.PlaneGeometry(8, 70), roadMat);
        shop.rotation.x = -Math.PI / 2;
        shop.position.set(x, 0.18, 50);
        groupInfrastructure.add(shop);
      });
      // Sector 22 internal market streets
      [44, 80].forEach(x => {
        const shop = new THREE.Mesh(new THREE.PlaneGeometry(8, 70), roadMat);
        shop.rotation.x = -Math.PI / 2;
        shop.position.set(x, 0.18, 50);
        groupInfrastructure.add(shop);
      });

      // ═══ LEISURE VALLEY (Diagonal Green Corridor — Chandigarh Signature) ═══
      const leisurePoints = [
        new THREE.Vector3(-280, 0.18, -180),
        new THREE.Vector3(-180, 0.18, -80),
        new THREE.Vector3(-80, 0.18, 20),
        new THREE.Vector3(20, 0.18, 120),
        new THREE.Vector3(120, 0.18, 220)
      ];

      const leisureCurve = new THREE.CatmullRomCurve3(leisurePoints);
      const tubeGeo = new THREE.TubeGeometry(leisureCurve, 60, 8, 6, false);
      const leisureValley = new THREE.Mesh(
        tubeGeo,
        new THREE.MeshStandardMaterial({ color: 0x0d2818, roughness: 0.9, flatShading: true })
      );
      leisureValley.userData = {
        name: "Leisure Valley (Diagonal Green Corridor)",
        type: "Linear Urban Park System",
        desc: "Chandigarh's famous continuous green belt running diagonally through sectors. Contains gardens, amphitheaters, and jogging tracks."
      };
      scene.add(leisureValley);
    }

    `;

twin = twin.replace(oldRoadFn, newRoadFn);

// ═══════════════════════════════════════════════════════════
// REPOSITION LANDMARKS to real Chandigarh layout positions
// ═══════════════════════════════════════════════════════════

// Open Hand → Capitol Complex (North, Sector 1 area)
twin = twin.replace(
  "monumentGroup.position.set(165, 0, -165);",
  "monumentGroup.position.set(50, 0, -280);"
);

// PGIMER → Sector 12 (West side of Madhya Marg)
twin = twin.replace(
  "pgiGroup.position.set(-155, 0, 155);",
  "pgiGroup.position.set(-200, 0, -50);"
);

// Sector 17 Plaza → Center-Left (where Sec 17 actually is)
twin = twin.replace(
  "plazaGroup.position.set(75, 0, -75);",
  "plazaGroup.position.set(-62, 0, 50);"
);

// Reposition sector building clusters to match actual Chandigarh grid
twin = twin.replace(
  '{ name: "Sector 22-A", cx: -95, cz: -95, count: 12, type: "Residential Neighborhood & Safe Corridors", color: 0x1a264a },',
  '{ name: "Sector 9", cx: 62, cz: -150, count: 8, type: "Government & Administrative Zone", color: 0x1a264a },'
);
twin = twin.replace(
  '{ name: "Sector 22-B", cx: -95, cz: 95, count: 12, type: "Commercial Market & Pink Safety Zone", color: 0x1f2b52 },',
  '{ name: "Sector 22", cx: 62, cz: 50, count: 12, type: "Commercial Market & Pink Safety Zone", color: 0x1f2b52 },'
);
twin = twin.replace(
  '{ name: "Sector 17-C", cx: 95, cz: -95, count: 11, type: "Commercial City Center & Pedestrian Mall", color: 0x223668 },',
  '{ name: "Sector 17", cx: -62, cz: 50, count: 11, type: "Commercial City Center & Pedestrian Mall", color: 0x223668 },'
);
twin = twin.replace(
  '{ name: "Sector 16", cx: 95, cz: 95, count: 10, type: "Rose Garden Heritage & Civic Infrastructure", color: 0x182c44 }',
  '{ name: "Sector 16", cx: 187, cz: -50, count: 8, type: "Rose Garden Heritage & Civic Infrastructure", color: 0x182c44 }'
);

// Reposition Pink Booths to match new sector positions
twin = twin.replace(
  '{ x: -28, z: 28, sec: "Sector 22 Market Kiosk" },',
  '{ x: 62, z: 65, sec: "Sector 22 Market Kiosk" },'
);
twin = twin.replace(
  '{ x: 28, z: -28, sec: "Sector 17 Plaza Kiosk" }',
  '{ x: -55, z: 40, sec: "Sector 17 Plaza Kiosk" }'
);

// Reposition CCTV cameras to match new chowk positions
twin = twin.replace(
  '{ x: -24, z: -24, rot: Math.PI / 4, id: "CCTV-CHD-2201" },',
  '{ x: -10, z: -40, rot: Math.PI / 4, id: "CCTV-CHD-MATKA-01" },'
);
twin = twin.replace(
  '{ x: 24, z: -24, rot: 3 * Math.PI / 4, id: "CCTV-CHD-1702" },',
  '{ x: 10, z: -60, rot: 3 * Math.PI / 4, id: "CCTV-CHD-MATKA-02" },'
);
twin = twin.replace(
  '{ x: -24, z: 24, rot: -Math.PI / 4, id: "CCTV-CHD-2203" },',
  '{ x: -62, z: 30, rot: -Math.PI / 4, id: "CCTV-CHD-S17-01" },'
);
twin = twin.replace(
  '{ x: 24, z: 24, rot: -3 * Math.PI / 4, id: "CCTV-CHD-1604" },',
  '{ x: 62, z: 30, rot: -3 * Math.PI / 4, id: "CCTV-CHD-S22-01" },'
);
twin = twin.replace(
  '{ x: -95, z: 0, rot: 0, id: "CCTV-CHD-2205" },',
  '{ x: -125, z: -50, rot: 0, id: "CCTV-CHD-TRIBUNE" },'
);
twin = twin.replace(
  '{ x: 95, z: 0, rot: Math.PI, id: "CCTV-CHD-1706" }',
  '{ x: 125, z: -50, rot: Math.PI, id: "CCTV-CHD-PICCADILLY" }'
);

// Reposition blind spots
twin = twin.replace(
  "x: -68, z: 68, w: 36, d: 30, color: 0xFF3366,",
  "x: 85, z: 70, w: 36, d: 30, color: 0xFF3366,"
);
twin = twin.replace(
  "x: 68, z: -68, w: 32, d: 32, color: 0xFF3366,",
  "x: -50, z: 65, w: 32, d: 32, color: 0xFF3366,"
);
twin = twin.replace(
  "x: -62, z: -58, w: 42, d: 26, color: 0xFFB800,",
  "x: 50, z: 30, w: 42, d: 26, color: 0xFFB800,"
);

// Reposition vehicles to use correct road lanes
twin = twin.replace(
  "pcr.position.set(-8.5, 0, -140);",
  "pcr.position.set(-5, 0, -200);"
);
twin = twin.replace(
  "ambu.position.set(150, 0, 8.5);",
  "ambu.position.set(300, 0, -42);"
);
twin = twin.replace(
  "truck.position.set(8.5, 0, 120);",
  "truck.position.set(5, 0, 150);"
);
twin = twin.replace(
  "civ1.position.set(-150, 0, -8.5);",
  "civ1.position.set(-280, 0, -55);"
);
twin = twin.replace(
  "civ2.position.set(7.5, 0, -80);",
  "civ2.position.set(5, 0, -120);"
);

// Update vehicle lane bounds
twin = twin.replace(
  "movingVehicles.push({ mesh: pcr, axis: 'z', speed: 0.52, min: -170, max: 170 });",
  "movingVehicles.push({ mesh: pcr, axis: 'z', speed: 0.52, min: -280, max: 250 });"
);
twin = twin.replace(
  "movingVehicles.push({ mesh: ambu, axis: 'x', speed: -0.75, min: -170, max: 170 });",
  "movingVehicles.push({ mesh: ambu, axis: 'x', speed: -0.75, min: -320, max: 320 });"
);
twin = twin.replace(
  "movingVehicles.push({ mesh: truck, axis: 'z', speed: -0.32, min: -160, max: 160 });",
  "movingVehicles.push({ mesh: truck, axis: 'z', speed: -0.32, min: -250, max: 250 });"
);
twin = twin.replace(
  "movingVehicles.push({ mesh: civ1, axis: 'x', speed: 0.62, min: -170, max: 170 });",
  "movingVehicles.push({ mesh: civ1, axis: 'x', speed: 0.62, min: -320, max: 320 });"
);
twin = twin.replace(
  "movingVehicles.push({ mesh: civ2, axis: 'z', speed: 0.48, min: -160, max: 160 });",
  "movingVehicles.push({ mesh: civ2, axis: 'z', speed: 0.48, min: -250, max: 250 });"
);

// Update camera presets for new layout
twin = twin.replace(
  "startCameraTransition(new THREE.Vector3(135, 145, 175), new THREE.Vector3(0, 0, 0));",
  "startCameraTransition(new THREE.Vector3(180, 200, 250), new THREE.Vector3(0, -20, 0));"
);
twin = twin.replace(
  "startCameraTransition(new THREE.Vector3(115, 42, -32), new THREE.Vector3(75, 4, -75));",
  "startCameraTransition(new THREE.Vector3(-20, 45, 95), new THREE.Vector3(-62, 4, 50));"
);
twin = twin.replace(
  "startCameraTransition(new THREE.Vector3(185, 52, -125), new THREE.Vector3(165, 34, -165));",
  "startCameraTransition(new THREE.Vector3(90, 60, -240), new THREE.Vector3(50, 35, -280));"
);
twin = twin.replace(
  "startCameraTransition(new THREE.Vector3(-115, 72, 115), new THREE.Vector3(-155, 32, 155));",
  "startCameraTransition(new THREE.Vector3(-150, 75, 10), new THREE.Vector3(-200, 32, -50));"
);
twin = twin.replace(
  "startCameraTransition(new THREE.Vector3(-8, 7, 52), new THREE.Vector3(0, 4, -35));",
  "startCameraTransition(new THREE.Vector3(-5, 8, -30), new THREE.Vector3(0, 4, -55));"
);
twin = twin.replace(
  "startCameraTransition(new THREE.Vector3(0, 165, 125), new THREE.Vector3(0, 25, 0));",
  "startCameraTransition(new THREE.Vector3(0, 260, 180), new THREE.Vector3(0, 0, -40));"
);

// Update initial camera position
twin = twin.replace(
  "camera.position.set(135, 145, 175);",
  "camera.position.set(180, 200, 250);"
);

// Update fog for larger scene
twin = twin.replace(
  "scene.fog = new THREE.FogExp2(0x060919, 0.0018)",
  "scene.fog = new THREE.FogExp2(0x060919, 0.0012)"
);

// Update shadow camera for larger scene
twin = twin.replace("const d = 220;", "const d = 380;");

// Extend green corridor to match Madhya Marg at z=-50
twin = twin.replace(
  "const greenHighway = new THREE.Mesh(new THREE.PlaneGeometry(620, 20), laneMat);",
  "const greenHighway = new THREE.Mesh(new THREE.PlaneGeometry(800, 22), laneMat);"
);
twin = twin.replace(
  "greenHighway.position.set(0, 0.28, 0);",
  "greenHighway.position.set(0, 0.28, -50);"
);

// Extend green corridor arrows
twin = twin.replace(
  "for (let x = -280; x <= 280; x += 32) {",
  "for (let x = -360; x <= 360; x += 32) {"
);
twin = twin.replace(
  "arrow.position.set(x, 0.32, 0);",
  "arrow.position.set(x, 0.32, -50);"
);

// Update tree positions along Madhya Marg (now at z=-50)
twin = twin.replace(
  "groupTrees.add(createRealisticTree(x, 23, 1.15, sp1));",
  "groupTrees.add(createRealisticTree(x, -32, 1.15, sp1));"
);
twin = twin.replace(
  "groupTrees.add(createRealisticTree(x, -23, 1.15, sp2));",
  "groupTrees.add(createRealisticTree(x, -68, 1.15, sp2));"
);

// Update tree skip for roundabouts
twin = twin.replace(
  "if (Math.abs(x) < 45) continue; // Skip rotary",
  "if (Math.abs(x) < 22 || (Math.abs(x) > 115 && Math.abs(x) < 135)) continue; // Skip rotaries"
);

// Update tree positions along Jan Marg
twin = twin.replace(
  "groupTrees.add(createRealisticTree(21, z, 1.1, 'emerald'));",
  "groupTrees.add(createRealisticTree(14, z, 1.1, 'emerald'));"
);
twin = twin.replace(
  "groupTrees.add(createRealisticTree(-21, z, 1.1, 'green'));",
  "groupTrees.add(createRealisticTree(-14, z, 1.1, 'green'));"
);

// Expand Jan Marg tree skip
twin = twin.replace(
  "if (Math.abs(z) < 45) continue;",
  "if (Math.abs(z) < 12) continue;"
);

// Reposition Rose Garden grove to Sector 16 area
twin = twin.replace("{ x: 55, z: 55, sp: 'rose', sc: 0.9 },", "{ x: 165, z: -30, sp: 'rose', sc: 0.9 },");
twin = twin.replace("{ x: 68, z: 62, sp: 'rose', sc: 1.0 },", "{ x: 178, z: -38, sp: 'rose', sc: 1.0 },");
twin = twin.replace("{ x: 60, z: 75, sp: 'emerald', sc: 1.2 },", "{ x: 170, z: -55, sp: 'emerald', sc: 1.2 },");
twin = twin.replace("{ x: 78, z: 80, sp: 'amaltas', sc: 1.3 },", "{ x: 195, z: -60, sp: 'amaltas', sc: 1.3 },");
twin = twin.replace("{ x: 85, z: 60, sp: 'gulmohar', sc: 1.2 },", "{ x: 200, z: -42, sp: 'gulmohar', sc: 1.2 },");
twin = twin.replace("{ x: 95, z: 72, sp: 'rose', sc: 0.95 },", "{ x: 210, z: -55, sp: 'rose', sc: 0.95 },");
twin = twin.replace("{ x: 72, z: 92, sp: 'emerald', sc: 1.15 },", "{ x: 185, z: -70, sp: 'emerald', sc: 1.15 },");
twin = twin.replace("{ x: 105, z: 55, sp: 'green', sc: 1.25 }", "{ x: 215, z: -35, sp: 'green', sc: 1.25 }");

// Streetlights along Madhya Marg at correct z=-50 position
twin = twin.replace(
  "[-140, 0, 19], [-85, 0, 19], [-30, 0, 19], [30, 0, 19], [85, 0, 19], [140, 0, 19],",
  "[-220, 0, -34], [-150, 0, -34], [-80, 0, -34], [40, 0, -34], [110, 0, -34], [200, 0, -34],"
);
twin = twin.replace(
  "[-140, 0, -19], [-85, 0, -19], [-30, 0, -19], [30, 0, -19], [85, 0, -19], [140, 0, -19],",
  "[-220, 0, -66], [-150, 0, -66], [-80, 0, -66], [40, 0, -66], [110, 0, -66], [200, 0, -66],"
);
// Jan Marg streetlights
twin = twin.replace(
  "[19, 0, -140], [19, 0, -85], [19, 0, -30], [19, 0, 30], [19, 0, 85], [19, 0, 140],",
  "[14, 0, -220], [14, 0, -150], [14, 0, -80], [14, 0, 20], [14, 0, 90], [14, 0, 160],"
);
twin = twin.replace(
  "[-19, 0, -140], [-19, 0, -85], [-19, 0, -30], [-19, 0, 30], [-19, 0, 85], [-19, 0, 140]",
  "[-14, 0, -220], [-14, 0, -150], [-14, 0, -80], [-14, 0, 20], [-14, 0, 90], [-14, 0, 160]"
);

// Waste bins repositioned along Chandigarh sectors
twin = twin.replace("{ x: -38, z: 14, fill: 94,", "{ x: 55, z: 42, fill: 94,");
twin = twin.replace("{ x: -78, z: 14, fill: 78,", "{ x: -55, z: 35, fill: 78,");
twin = twin.replace("{ x: 38, z: -14, fill: 35,", "{ x: -62, z: -130, fill: 35,");
twin = twin.replace("{ x: 88, z: -14, fill: 20,", "{ x: 187, z: -55, fill: 20,");
twin = twin.replace("{ x: 14, z: 54, fill: 89,", "{ x: 62, z: 140, fill: 89,");
twin = twin.replace("{ x: -14, z: -74, fill: 42,", "{ x: -187, z: -130, fill: 42,");

// Update drone orbit radius
twin = twin.replace("movingDrone.position.x = Math.sin(time * 0.28) * 65;", "movingDrone.position.x = Math.sin(time * 0.22) * 120;");
twin = twin.replace("movingDrone.position.z = Math.cos(time * 0.28) * 65;", "movingDrone.position.z = Math.cos(time * 0.22) * 100 - 50;");
twin = twin.replace("movingDrone.rotation.y = time * 0.28 + Math.PI / 2;", "movingDrone.rotation.y = time * 0.22 + Math.PI / 2;");

fs.writeFileSync(path.join(DIR, 'twin.html'), twin, 'utf8');
console.log('Chandigarh authentic layout applied successfully!');
console.log('File size:', (twin.length / 1024).toFixed(1), 'KB');
