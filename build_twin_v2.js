const fs = require('fs');

const origPath = 'C:/Users/staro/.gemini/antigravity/scratch/smart-chandigarh/twin.html';
const origContent = fs.readFileSync(origPath, 'utf8');

// Get HTML and CSS up to the Three.js script section
const splitToken = '<!-- ══════════════════════════════════════════════════════════════\n       THREE.JS DIGITAL TWIN CORE IMPLEMENTATION';
const headContent = origContent.substring(0, origContent.indexOf(splitToken));

const upgradedScript = `<!-- ══════════════════════════════════════════════════════════════
       THREE.JS DIGITAL TWIN CORE IMPLEMENTATION — HIGH REALISM V2
       ══════════════════════════════════════════════════════════════ -->
  <script>
    let scene, camera, renderer, controls;
    let isNight = true;
    let greenCorridorActive = false;

    // Layer Groups
    const groupCCTV = new THREE.Group();
    const groupBlind = new THREE.Group();
    const groupLighting = new THREE.Group();
    const groupBins = new THREE.Group();
    const groupPink = new THREE.Group();
    const groupVehicles = new THREE.Group();
    const groupCorridor = new THREE.Group();
    const groupTrees = new THREE.Group();
    const groupInfrastructure = new THREE.Group();

    // Animated objects & state
    let movingVehicles = [];
    let movingDrone = null;
    let openHandMesh = null;
    let waterMesh = null;
    let streetlightBulbs = [];
    let streetlightSources = [];
    let vehicleHeadlights = [];
    let vehicleBeacons = [];
    let blinkingAviationLights = [];
    let ambientLight, sunLight, hemiLight, moonLight;
    let corridorLanes = [];
    let corridorArrows = [];

    let currentSelectedTarget = null;

    // Smooth Camera Transition State
    let isCamTransitioning = false;
    let camStartTime = 0;
    const camDuration = 1.2;
    let camStartPos = new THREE.Vector3();
    let camEndPos = new THREE.Vector3();
    let camStartTarget = new THREE.Vector3();
    let camEndTarget = new THREE.Vector3();

    // Reusable Materials & Textures
    let windowTextureNight, windowTextureDay;

    function createProceduralWindowTexture(isNightMode) {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = isNightMode ? '#0c142b' : '#334155';
      ctx.fillRect(0, 0, 256, 256);

      const rows = 12;
      const cols = 8;
      const padX = 6;
      const padY = 4;
      const w = (256 - (cols + 1) * padX) / cols;
      const h = (256 - (rows + 1) * padY) / rows;

      const warmLights = ['#ffdd88', '#ffe4a0', '#00f0ff', '#70d6ff', '#ffffff'];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = padX + c * (w + padX);
          const y = padY + r * (h + padY);

          if (isNightMode) {
            // Randomly illuminate offices
            if (Math.random() > 0.42) {
              ctx.fillStyle = warmLights[Math.floor(Math.random() * warmLights.length)];
              ctx.fillRect(x, y, w, h);
            } else {
              ctx.fillStyle = '#070c1a';
              ctx.fillRect(x, y, w, h);
            }
          } else {
            // Daytime subtle glass reflection
            ctx.fillStyle = Math.random() > 0.3 ? '#88a4c2' : '#64748b';
            ctx.fillRect(x, y, w, h);
          }
        }
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      return texture;
    }

    function init3DTwin() {
      const container = document.getElementById('webgl-canvas');
      const w = window.innerWidth;
      const h = window.innerHeight;

      // 1. Scene & Atmospheric Fog
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x060919);
      scene.fog = new THREE.FogExp2(0x060919, 0.0024);

      // 2. Camera Setup
      camera = new THREE.PerspectiveCamera(45, w / h, 1, 2200);
      camera.position.set(135, 145, 175);

      // 3. Renderer with High Dynamic Range feeling & soft shadows
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      container.appendChild(renderer.domElement);

      // 4. Orbit Controls
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.06;
      controls.maxPolarAngle = Math.PI / 2.04;
      controls.minDistance = 15;
      controls.maxDistance = 650;
      controls.target.set(0, 0, 0);

      // 5. Rich Natural Lighting Model
      hemiLight = new THREE.HemisphereLight(0x4070a0, 0x0c142b, 0.85);
      scene.add(hemiLight);

      sunLight = new THREE.DirectionalLight(0xfff5e6, 0.25);
      sunLight.position.set(140, 220, 110);
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 2048;
      sunLight.shadow.mapSize.height = 2048;
      sunLight.shadow.camera.near = 10;
      sunLight.shadow.camera.far = 700;
      const d = 220;
      sunLight.shadow.camera.left = -d;
      sunLight.shadow.camera.right = d;
      sunLight.shadow.camera.top = d;
      sunLight.shadow.camera.bottom = -d;
      sunLight.shadow.bias = -0.0005;
      scene.add(sunLight);

      moonLight = new THREE.DirectionalLight(0x00F0FF, 0.35);
      moonLight.position.set(-140, 180, -120);
      scene.add(moonLight);

      // Add Sub-groups
      scene.add(groupInfrastructure);
      scene.add(groupTrees);
      scene.add(groupCCTV);
      scene.add(groupBlind);
      scene.add(groupLighting);
      scene.add(groupBins);
      scene.add(groupPink);
      scene.add(groupVehicles);
      scene.add(groupCorridor);

      // Generate Procedural Textures
      windowTextureNight = createProceduralWindowTexture(true);
      windowTextureDay = createProceduralWindowTexture(false);

      // 6. Build High-Fidelity 3D Environment
      buildGroundAndPavements();
      buildChandigarhRoundaboutAndRoads();
      buildLeCorbusierSectorArchitecture();
      buildLushChandigarhTreeCanopies();
      buildOpenHandMonument();
      buildPGIMERMedicalCenter();
      buildSector17Plaza();
      buildPinkBooths();
      buildSmartStreetlights();
      buildCCTVNetwork();
      buildBlindSpotsAndDarkZones();
      buildSmartWasteBins();
      buildRealisticVehicleFleet();
      buildSurveillanceDrone();
      buildEmergencyGreenCorridorMeshes();

      // 7. Raycasting & Interaction
      setupRaycaster();

      // 8. Event Listeners
      window.addEventListener('resize', onWindowResize);

      // 9. Start Simulation Loop
      animate();
    }

    // ══════════════════════════════════════════════════════════════
    // CITY GROUND & PAVEMENTS
    // ══════════════════════════════════════════════════════════════

    function buildGroundAndPavements() {
      // Primary Sub-base Ground
      const groundGeo = new THREE.PlaneGeometry(620, 620);
      const groundMat = new THREE.MeshStandardMaterial({
        color: 0x090e1e,
        roughness: 0.95,
        metalness: 0.05
      });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      scene.add(ground);

      // Subtle Holographic Cyber Grid Overlay
      const grid = new THREE.GridHelper(620, 62, 0x00F0FF, 0x132247);
      grid.position.y = 0.08;
      grid.material.opacity = 0.22;
      grid.material.transparent = true;
      scene.add(grid);

      // Sector Landscaped Berms / Green Belts
      const greenPads = [
        { x: -95, z: -95, w: 140, d: 140, color: 0x0a1a1f }, // Sector 22-A
        { x: -95, z: 95, w: 140, d: 140, color: 0x0a1a1f },  // Sector 22-B
        { x: 95, z: -95, w: 140, d: 140, color: 0x0d1c24 },  // Sector 17
        { x: 95, z: 95, w: 140, d: 140, color: 0x0b201a }   // Sector 16 Rose Garden area
      ];

      greenPads.forEach(pad => {
        const padMesh = new THREE.Mesh(
          new THREE.PlaneGeometry(pad.w, pad.d),
          new THREE.MeshStandardMaterial({ color: pad.color, roughness: 0.9 })
        );
        padMesh.rotation.x = -Math.PI / 2;
        padMesh.position.set(pad.x, 0.12, pad.z);
        padMesh.receiveShadow = true;
        scene.add(padMesh);
      });
    }

    // ══════════════════════════════════════════════════════════════
    // CHANDIGARH CHOWK (ROUNDABOUT) & REALISTIC HIGHWAYS
    // ══════════════════════════════════════════════════════════════

    function buildChandigarhRoundaboutAndRoads() {
      const roadMat = new THREE.MeshStandardMaterial({
        color: 0x151b29,
        roughness: 0.85,
        metalness: 0.15
      });

      const curbMat = new THREE.MeshStandardMaterial({
        color: 0x475569,
        roughness: 0.7
      });

      const sidewalkMat = new THREE.MeshStandardMaterial({
        color: 0x1e2738,
        roughness: 0.8
      });

      const grassMat = new THREE.MeshStandardMaterial({
        color: 0x103522,
        roughness: 0.95
      });

      // ─── 1. Madhya Marg (East-West V2 Arterial Highway, 34m wide) ───
      const madhyaRoad = new THREE.Mesh(new THREE.PlaneGeometry(620, 34), roadMat);
      madhyaRoad.rotation.x = -Math.PI / 2;
      madhyaRoad.position.set(0, 0.2, 0);
      madhyaRoad.receiveShadow = true;
      madhyaRoad.userData = {
        name: "Madhya Marg (V2 Arterial Corridor)",
        type: "Primary Transit Spine",
        desc: "Links PGI Trauma with East Chandigarh. Fitted with automated Green Corridor Signal Preemption for 108 Emergency Ambulances."
      };
      groupInfrastructure.add(madhyaRoad);

      // Madhya Marg Sidewalks (North & South)
      [-19.5, 19.5].forEach(zPos => {
        const sidewalk = new THREE.Mesh(new THREE.BoxGeometry(620, 0.4, 5), sidewalkMat);
        sidewalk.position.set(0, 0.25, zPos);
        sidewalk.receiveShadow = true;
        groupInfrastructure.add(sidewalk);

        // Concrete Curbing
        const curb = new THREE.Mesh(new THREE.BoxGeometry(620, 0.5, 0.5), curbMat);
        curb.position.set(0, 0.3, zPos > 0 ? zPos - 2.6 : zPos + 2.6);
        groupInfrastructure.add(curb);
      });

      // Madhya Marg Median Strip (excluding central roundabout radius 36)
      [-180, 180].forEach(xCenter => {
        const median = new THREE.Mesh(new THREE.BoxGeometry(240, 0.4, 3), grassMat);
        median.position.set(xCenter, 0.26, 0);
        median.receiveShadow = true;
        groupInfrastructure.add(median);

        // Median curb edging
        const mCurb1 = new THREE.Mesh(new THREE.BoxGeometry(240, 0.45, 0.3), curbMat);
        mCurb1.position.set(xCenter, 0.28, 1.6);
        const mCurb2 = new THREE.Mesh(new THREE.BoxGeometry(240, 0.45, 0.3), curbMat);
        mCurb2.position.set(xCenter, 0.28, -1.6);
        groupInfrastructure.add(mCurb1);
        groupInfrastructure.add(mCurb2);
      });

      // ─── 2. Jan Marg (North-South V2 Arterial Highway, 30m wide) ───
      const janRoad = new THREE.Mesh(new THREE.PlaneGeometry(30, 620), roadMat);
      janRoad.rotation.x = -Math.PI / 2;
      janRoad.position.set(0, 0.21, 0);
      janRoad.receiveShadow = true;
      janRoad.userData = {
        name: "Jan Marg (V2 Ceremonial Axis)",
        type: "Grand Civic Axis",
        desc: "Designed by Le Corbusier to connect Sector 17 Central Plaza directly with the Capitol Complex & Secretariat."
      };
      groupInfrastructure.add(janRoad);

      // Jan Marg Sidewalks (East & West)
      [-17.5, 17.5].forEach(xPos => {
        const sidewalk = new THREE.Mesh(new THREE.BoxGeometry(5, 0.4, 620), sidewalkMat);
        sidewalk.position.set(xPos, 0.25, 0);
        sidewalk.receiveShadow = true;
        groupInfrastructure.add(sidewalk);

        const curb = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 620), curbMat);
        curb.position.set(xPos > 0 ? xPos - 2.6 : xPos + 2.6, 0.3, 0);
        groupInfrastructure.add(curb);
      });

      // ─── 3. Iconic Chandigarh Rotary Chowk (Central Roundabout) ───
      const chowkGroup = new THREE.Group();
      chowkGroup.position.set(0, 0.22, 0);

      // Asphalt Ring for Roundabout
      const rotaryAsphalt = new THREE.Mesh(
        new THREE.RingGeometry(18, 38, 48),
        roadMat
      );
      rotaryAsphalt.rotation.x = -Math.PI / 2;
      rotaryAsphalt.receiveShadow = true;
      chowkGroup.add(rotaryAsphalt);

      // Central Landscaped Rotary Island
      const islandGeo = new THREE.CylinderGeometry(18, 19, 1.2, 48);
      const island = new THREE.Mesh(islandGeo, grassMat);
      island.position.y = 0.6;
      island.receiveShadow = true;
      island.castShadow = true;
      chowkGroup.add(island);

      // Roundabout Concrete Kerb Ring
      const curbRingGeo = new THREE.TorusGeometry(18.5, 0.4, 8, 48);
      const curbRing = new THREE.Mesh(curbRingGeo, curbMat);
      curbRing.rotation.x = Math.PI / 2;
      curbRing.position.y = 1.1;
      chowkGroup.add(curbRing);

      // Central Decorative Fountain / Civic Monument in Rotary
      const fountainBasin = new THREE.Mesh(
        new THREE.CylinderGeometry(7, 8, 1.4, 24),
        new THREE.MeshStandardMaterial({ color: 0x1f293d, roughness: 0.4, metalness: 0.6 })
      );
      fountainBasin.position.y = 1.8;
      fountainBasin.castShadow = true;
      chowkGroup.add(fountainBasin);

      // Water Surface
      const fountainWater = new THREE.Mesh(
        new THREE.CircleGeometry(6.6, 24),
        new THREE.MeshStandardMaterial({
          color: 0x00F0FF,
          emissive: 0x003355,
          roughness: 0.1,
          metalness: 0.9,
          transparent: true,
          opacity: 0.85
        })
      );
      fountainWater.rotation.x = -Math.PI / 2;
      fountainWater.position.y = 2.45;
      chowkGroup.add(fountainWater);

      // Futuristic Illuminated Spire in Chowk Center
      const spire = new THREE.Mesh(
        new THREE.ConeGeometry(1.4, 18, 8),
        new THREE.MeshStandardMaterial({
          color: 0x00F0FF,
          emissive: 0x004466,
          metalness: 0.8,
          roughness: 0.2
        })
      );
      spire.position.y = 11;
      spire.castShadow = true;
      chowkGroup.add(spire);

      // Chowk Uplight
      const chowkLight = new THREE.PointLight(0x00F0FF, 1.8, 45);
      chowkLight.position.set(0, 6, 0);
      chowkGroup.add(chowkLight);

      chowkGroup.userData = {
        name: "Matka Chowk / Press Rotary (Madhya-Jan Marg Intersection)",
        type: "Grade-Separated Smart Traffic Rotary",
        desc: "Core traffic hub connecting Sectors 17, 22, 16 and 9. Monitored with automated AI queue density & camera classification."
      };
      groupInfrastructure.add(chowkGroup);

      // ─── 4. High-Precision Road Markings ───
      const markingMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const yellowMarkingMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });

      // Madhya Marg Dashed Lane Dividers (North & South of median)
      for (let x = -290; x <= 290; x += 18) {
        if (Math.abs(x) < 42) continue; // Skip inside roundabout
        // Lane dividers
        const dashN = new THREE.Mesh(new THREE.PlaneGeometry(9, 0.45), markingMat);
        dashN.rotation.x = -Math.PI / 2;
        dashN.position.set(x, 0.26, 8.5);
        groupInfrastructure.add(dashN);

        const dashS = new THREE.Mesh(new THREE.PlaneGeometry(9, 0.45), markingMat);
        dashS.rotation.x = -Math.PI / 2;
        dashS.position.set(x, 0.26, -8.5);
        groupInfrastructure.add(dashS);
      }

      // Jan Marg Dashed Lane Dividers
      for (let z = -290; z <= 290; z += 18) {
        if (Math.abs(z) < 42) continue;
        const dashE = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 9), markingMat);
        dashE.rotation.x = -Math.PI / 2;
        dashE.position.set(7.5, 0.26, z);
        groupInfrastructure.add(dashE);

        const dashW = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 9), markingMat);
        dashW.rotation.x = -Math.PI / 2;
        dashW.position.set(-7.5, 0.26, z);
        groupInfrastructure.add(dashW);
      }

      // Zebra Pedestrian Crossings at Roundabout Approaches
      const approaches = [
        { axis: 'x', pos: -46, startZ: -16, endZ: 16 },
        { axis: 'x', pos: 46, startZ: -16, endZ: 16 },
        { axis: 'z', pos: -46, startX: -14, endX: 14 },
        { axis: 'z', pos: 46, startX: -14, endX: 14 }
      ];

      approaches.forEach(app => {
        if (app.axis === 'x') {
          for (let z = app.startZ; z <= app.endZ; z += 2.8) {
            const stripe = new THREE.Mesh(new THREE.PlaneGeometry(5, 1.4), markingMat);
            stripe.rotation.x = -Math.PI / 2;
            stripe.position.set(app.pos, 0.27, z);
            groupInfrastructure.add(stripe);
          }
        } else {
          for (let x = app.startX; x <= app.endX; x += 2.8) {
            const stripe = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 5), markingMat);
            stripe.rotation.x = -Math.PI / 2;
            stripe.position.set(x, 0.27, app.pos);
            groupInfrastructure.add(stripe);
          }
        }
      });
    }

    // ══════════════════════════════════════════════════════════════
    // LE CORBUSIER SECTOR ARCHITECTURE (BRISE-SOLEIL & REALISTIC WINDOWS)
    // ══════════════════════════════════════════════════════════════

    function buildLeCorbusierSectorArchitecture() {
      const sectors = [
        { name: "Sector 22-A", cx: -95, cz: -95, count: 12, type: "Residential Neighborhood & Safe Corridors", color: 0x1a264a },
        { name: "Sector 22-B", cx: -95, cz: 95, count: 12, type: "Commercial Market & Pink Safety Zone", color: 0x1f2b52 },
        { name: "Sector 17-C", cx: 95, cz: -95, count: 11, type: "Commercial City Center & Pedestrian Mall", color: 0x223668 },
        { name: "Sector 16", cx: 95, cz: 95, count: 10, type: "Rose Garden Heritage & Civic Infrastructure", color: 0x182c44 }
      ];

      sectors.forEach(sec => {
        for (let i = 0; i < sec.count; i++) {
          const row = Math.floor(i / 3);
          const col = i % 3;
          const bx = sec.cx + (col - 1) * 40 + (Math.sin(i * 1.5) * 5);
          const bz = sec.cz + (row - 1) * 40 + (Math.cos(i * 1.5) * 5);

          const w = 20 + ((i * 7) % 10);
          const d = 18 + ((i * 5) % 10);
          const h = 16 + ((i * 11) % 32);

          const buildingGroup = new THREE.Group();
          buildingGroup.position.set(bx, 0, bz);

          // 1. Recessed Ground Pilotis / Colonnade (Corbusian Stilt Concept)
          const podiumH = 4.5;
          const podium = new THREE.Mesh(
            new THREE.BoxGeometry(w * 0.9, podiumH, d * 0.9),
            new THREE.MeshStandardMaterial({
              color: 0x111c38,
              roughness: 0.5,
              metalness: 0.4
            })
          );
          podium.position.y = podiumH / 2;
          podium.castShadow = true;
          podium.receiveShadow = true;
          buildingGroup.add(podium);

          // 2. Main Architectural Tower Block with Window Texture
          const towerH = h - podiumH;
          const towerMat = new THREE.MeshStandardMaterial({
            color: sec.color,
            roughness: 0.6,
            metalness: 0.25,
            map: windowTextureNight
          });
          const towerGeo = new THREE.BoxGeometry(w, towerH, d);
          const tower = new THREE.Mesh(towerGeo, towerMat);
          tower.position.y = podiumH + towerH / 2;
          tower.castShadow = true;
          tower.receiveShadow = true;
          buildingGroup.add(tower);

          // 3. Brise-Soleil (Horizontal Concrete Sunshades — Chandigarh Hallmark)
          const floors = Math.floor(towerH / 5);
          for (let f = 1; f < floors; f++) {
            const louverY = podiumH + f * 5;
            const louverGeo = new THREE.BoxGeometry(w + 1.2, 0.5, d + 1.2);
            const louverMat = new THREE.MeshStandardMaterial({
              color: 0x475569,
              roughness: 0.7
            });
            const louver = new THREE.Mesh(louverGeo, louverMat);
            louver.position.y = louverY;
            louver.castShadow = true;
            buildingGroup.add(louver);
          }

          // 4. Rooftop Mechanical Terrace & Solar Panels
          const roofH = 2.5;
          const roofBox = new THREE.Mesh(
            new THREE.BoxGeometry(w * 0.6, roofH, d * 0.5),
            new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 })
          );
          roofBox.position.set(0, h + roofH / 2, 0);
          roofBox.castShadow = true;
          buildingGroup.add(roofBox);

          // Solar Panel Array Simulation on Roof
          const solarPanel = new THREE.Mesh(
            new THREE.PlaneGeometry(w * 0.5, d * 0.35),
            new THREE.MeshStandardMaterial({
              color: 0x00F0FF,
              emissive: 0x002233,
              roughness: 0.2,
              metalness: 0.9
            })
          );
          solarPanel.rotation.x = -Math.PI / 2.3;
          solarPanel.position.set(0, h + roofH + 0.5, 0);
          buildingGroup.add(solarPanel);

          // 5. Aviation Obstruction Red Blinking Mast for Taller Buildings (>32m)
          if (h > 32) {
            const mast = new THREE.Mesh(
              new THREE.CylinderGeometry(0.15, 0.2, 8),
              new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 })
            );
            mast.position.set(0, h + 4, 0);
            buildingGroup.add(mast);

            const beacon = new THREE.Mesh(
              new THREE.SphereGeometry(0.45, 8, 8),
              new THREE.MeshBasicMaterial({ color: 0xff0033 })
            );
            beacon.position.set(0, h + 8, 0);
            buildingGroup.add(beacon);
            blinkingAviationLights.push(beacon);
          }

          // Subtle Cyber Blue Edge Outlines
          const edges = new THREE.LineSegments(
            new THREE.EdgesGeometry(towerGeo),
            new THREE.LineBasicMaterial({ color: 0x00F0FF, transparent: true, opacity: 0.22 })
          );
          edges.position.y = podiumH + towerH / 2;
          buildingGroup.add(edges);

          buildingGroup.userData = {
            name: \`\${sec.name} Complex Block \${String.fromCharCode(65 + col)}\${row + 1}\`,
            type: sec.type,
            desc: \`Height: \${Math.round(h)}m • Pilotis Design • LoRa Connected • Smart Lux Sensor Integrated • Solar Grid Synchronized.\`
          };

          scene.add(buildingGroup);
        }
      });
    }

    // ══════════════════════════════════════════════════════════════
    // LUSH CHANDIGARH TREE CANOPIES (THE GREEN CITY BEAUTIFUL)
    // ══════════════════════════════════════════════════════════════

    function createRealisticTree(x, z, scale = 1, species = 'green') {
      const treeGroup = new THREE.Group();
      treeGroup.position.set(x, 0, z);

      // Trunk
      const trunkH = 4.5 * scale;
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35 * scale, 0.55 * scale, trunkH, 7),
        new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 0.9 })
      );
      trunk.position.y = trunkH / 2;
      trunk.castShadow = true;
      treeGroup.add(trunk);

      // Canopy Palette
      let foliageColor = 0x1f5c36;
      if (species === 'emerald') foliageColor = 0x2d6a4f;
      if (species === 'gulmohar') foliageColor = 0xd97706; // Flowering flame tree
      if (species === 'amaltas') foliageColor = 0xeab308; // Golden shower tree
      if (species === 'rose') foliageColor = 0xbe185d;

      const foliageMat = new THREE.MeshStandardMaterial({
        color: foliageColor,
        roughness: 0.85,
        flatShading: true
      });

      // Layered Organic Foliage Clusters
      const c1 = new THREE.Mesh(new THREE.DodecahedronGeometry(3.2 * scale, 1), foliageMat);
      c1.position.set(0, trunkH + 2.2 * scale, 0);
      c1.castShadow = true;
      treeGroup.add(c1);

      const c2 = new THREE.Mesh(new THREE.DodecahedronGeometry(2.4 * scale, 1), foliageMat);
      c2.position.set(1.2 * scale, trunkH + 3.4 * scale, 0.6 * scale);
      c2.castShadow = true;
      treeGroup.add(c2);

      const c3 = new THREE.Mesh(new THREE.DodecahedronGeometry(2.1 * scale, 1), foliageMat);
      c3.position.set(-1.1 * scale, trunkH + 3.1 * scale, -0.8 * scale);
      c3.castShadow = true;
      treeGroup.add(c3);

      return treeGroup;
    }

    function buildLushChandigarhTreeCanopies() {
      // 1. Avenue Trees along Madhya Marg (North & South Sidewalks)
      for (let x = -280; x <= 280; x += 22) {
        if (Math.abs(x) < 45) continue; // Skip rotary
        const sp1 = (Math.abs(x) % 4 === 0) ? 'gulmohar' : 'emerald';
        const sp2 = (Math.abs(x) % 6 === 0) ? 'amaltas' : 'green';
        groupTrees.add(createRealisticTree(x, 23, 1.15, sp1));
        groupTrees.add(createRealisticTree(x, -23, 1.15, sp2));

        // Shrubbery along Madhya Marg Median
        if (Math.abs(x) > 55 && Math.abs(x) < 260) {
          const shrub = new THREE.Mesh(
            new THREE.SphereGeometry(1.3, 6, 6),
            new THREE.MeshStandardMaterial({ color: 0x164e2e, roughness: 0.9, flatShading: true })
          );
          shrub.position.set(x, 0.8, 0);
          groupTrees.add(shrub);
        }
      }

      // 2. Avenue Trees along Jan Marg (East & West Sidewalks)
      for (let z = -280; z <= 280; z += 24) {
        if (Math.abs(z) < 45) continue;
        groupTrees.add(createRealisticTree(21, z, 1.1, 'emerald'));
        groupTrees.add(createRealisticTree(-21, z, 1.1, 'green'));
      }

      // 3. Sector 16 Zakir Rose Garden Botanical Grove
      const roseGrove = [
        { x: 55, z: 55, sp: 'rose', sc: 0.9 },
        { x: 68, z: 62, sp: 'rose', sc: 1.0 },
        { x: 60, z: 75, sp: 'emerald', sc: 1.2 },
        { x: 78, z: 80, sp: 'amaltas', sc: 1.3 },
        { x: 85, z: 60, sp: 'gulmohar', sc: 1.2 },
        { x: 95, z: 72, sp: 'rose', sc: 0.95 },
        { x: 72, z: 92, sp: 'emerald', sc: 1.15 },
        { x: 105, z: 55, sp: 'green', sc: 1.25 }
      ];

      roseGrove.forEach(rg => {
        groupTrees.add(createRealisticTree(rg.x, rg.z, rg.sc, rg.sp));
      });
    }

    // ══════════════════════════════════════════════════════════════
    // OPEN HAND MONUMENT & CAPITOL COMPLEX
    // ══════════════════════════════════════════════════════════════

    function buildOpenHandMonument() {
      const monumentGroup = new THREE.Group();
      monumentGroup.position.set(165, 0, -165);

      // Sunken Contemplation Pit (Fosse de la Contemplation)
      const pitGeo = new THREE.CylinderGeometry(28, 24, 4, 32);
      const pitMat = new THREE.MeshStandardMaterial({ color: 0x141e38, roughness: 0.8 });
      const pit = new THREE.Mesh(pitGeo, pitMat);
      pit.position.y = 2;
      pit.receiveShadow = true;
      monumentGroup.add(pit);

      // Terraced Concrete Steps
      for (let s = 1; s <= 3; s++) {
        const step = new THREE.Mesh(
          new THREE.CylinderGeometry(28 - s * 3.5, 28 - s * 3.5, 0.8, 32),
          new THREE.MeshStandardMaterial({ color: 0x1c2b50, roughness: 0.7 })
        );
        step.position.y = 2 + s * 0.8;
        step.receiveShadow = true;
        monumentGroup.add(step);
      }

      // Reflecting Pool with Shimmering Water
      const waterGeo = new THREE.CircleGeometry(16, 32);
      const waterMat = new THREE.MeshStandardMaterial({
        color: 0x00F0FF,
        emissive: 0x002d44,
        roughness: 0.1,
        metalness: 0.9,
        transparent: true,
        opacity: 0.8
      });
      waterMesh = new THREE.Mesh(waterGeo, waterMat);
      waterMesh.rotation.x = -Math.PI / 2;
      waterMesh.position.y = 4.45;
      monumentGroup.add(waterMesh);

      // Central Support Shaft / Bearings
      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(1.8, 2.4, 34, 16),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.25 })
      );
      shaft.position.y = 21;
      shaft.castShadow = true;
      monumentGroup.add(shaft);

      // The Sculptural 3D Open Hand Silhouette
      const handShape = new THREE.Shape();
      handShape.moveTo(0, 0);
      handShape.lineTo(7, 11);
      handShape.lineTo(14, 15);
      handShape.lineTo(10, 24);
      handShape.lineTo(5, 30);
      handShape.lineTo(0, 25);
      handShape.lineTo(-5, 34);
      handShape.lineTo(-10, 23);
      handShape.lineTo(-14, 13);
      handShape.lineTo(-7, 4);
      handShape.closePath();

      const extrudeSettings = { depth: 3.5, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.9, bevelThickness: 0.9 };
      const handGeo = new THREE.ExtrudeGeometry(handShape, extrudeSettings);
      const handMat = new THREE.MeshStandardMaterial({
        color: 0x00F0FF,
        emissive: 0x004466,
        metalness: 0.6,
        roughness: 0.35
      });
      openHandMesh = new THREE.Mesh(handGeo, handMat);
      openHandMesh.position.set(0, 40, -1.75);
      openHandMesh.castShadow = true;
      monumentGroup.add(openHandMesh);

      // Uplighting Spotlights
      const spot1 = new THREE.SpotLight(0x00F0FF, 3, 90, Math.PI / 4, 0.4);
      spot1.position.set(15, 6, 15);
      spot1.target = openHandMesh;
      monumentGroup.add(spot1);

      const spot2 = new THREE.SpotLight(0x9d4edd, 2, 90, Math.PI / 4, 0.4);
      spot2.position.set(-15, 6, -15);
      spot2.target = openHandMesh;
      monumentGroup.add(spot2);

      monumentGroup.userData = {
        name: "The Open Hand Monument (Capitol Complex)",
        type: "UNESCO Heritage World Landmark",
        desc: "Designed by Le Corbusier as the philosophical emblem of Chandigarh: 'Open to give, open to receive'. Anchors the Northern civic axis of the Smart City mesh."
      };

      scene.add(monumentGroup);
    }

    // ══════════════════════════════════════════════════════════════
    // PGIMER REGIONAL APEX TRAUMA & MEDICAL CENTER (SECTOR 12)
    // ══════════════════════════════════════════════════════════════

    function buildPGIMERMedicalCenter() {
      const pgiGroup = new THREE.Group();
      pgiGroup.position.set(-155, 0, 155);

      // Main Emergency Hospital Tower
      const mainTower = new THREE.Mesh(
        new THREE.BoxGeometry(50, 68, 50),
        new THREE.MeshStandardMaterial({ color: 0x19274e, roughness: 0.4, metalness: 0.35, map: windowTextureNight })
      );
      mainTower.position.y = 34;
      mainTower.castShadow = true;
      mainTower.receiveShadow = true;
      pgiGroup.add(mainTower);

      // Trauma Wing East
      const eastWing = new THREE.Mesh(
        new THREE.BoxGeometry(32, 38, 30),
        new THREE.MeshStandardMaterial({ color: 0x141f3d, roughness: 0.5, map: windowTextureNight })
      );
      eastWing.position.set(38, 19, -5);
      eastWing.castShadow = true;
      pgiGroup.add(eastWing);

      // Emergency Trauma Reception Drop-Off Bay
      const bay = new THREE.Mesh(
        new THREE.BoxGeometry(40, 7, 24),
        new THREE.MeshStandardMaterial({ color: 0x223668, roughness: 0.6 })
      );
      bay.position.set(-5, 3.5, 36);
      bay.castShadow = true;
      pgiGroup.add(bay);

      // Glowing Emergency Red Cross on 4 Facades
      const crossMat = new THREE.MeshBasicMaterial({ color: 0xFF2E63 });
      [
        { x: 0, y: 48, z: 25.5, rotY: 0 },
        { x: 0, y: 48, z: -25.5, rotY: Math.PI },
        { x: 25.5, y: 48, z: 0, rotY: Math.PI / 2 },
        { x: -25.5, y: 48, z: 0, rotY: -Math.PI / 2 }
      ].forEach(cp => {
        const cHoriz = new THREE.Mesh(new THREE.BoxGeometry(18, 5, 0.8), crossMat);
        const cVert = new THREE.Mesh(new THREE.BoxGeometry(5, 18, 0.8), crossMat);
        cHoriz.position.set(cp.x, cp.y, cp.z);
        cHoriz.rotation.y = cp.rotY;
        cVert.position.set(cp.x, cp.y, cp.z);
        cVert.rotation.y = cp.rotY;
        pgiGroup.add(cHoriz);
        pgiGroup.add(cVert);
      });

      // Rooftop Helipad
      const helipad = new THREE.Mesh(
        new THREE.CylinderGeometry(17, 17, 1.8, 32),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 })
      );
      helipad.position.set(0, 69, 0);
      pgiGroup.add(helipad);

      // Yellow Helipad Safety Circle
      const yellowRing = new THREE.Mesh(
        new THREE.RingGeometry(14.5, 15.5, 32),
        new THREE.MeshBasicMaterial({ color: 0xffd166, side: THREE.DoubleSide })
      );
      yellowRing.rotation.x = -Math.PI / 2;
      yellowRing.position.set(0, 70, 0);
      pgiGroup.add(yellowRing);

      // Helipad 'H'
      const hMat = new THREE.MeshBasicMaterial({ color: 0x00FF88 });
      const h1 = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 15), hMat);
      h1.rotation.x = -Math.PI / 2;
      h1.position.set(-4.5, 70.02, 0);
      const h2 = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 15), hMat);
      h2.rotation.x = -Math.PI / 2;
      h2.position.set(4.5, 70.02, 0);
      const h3 = new THREE.Mesh(new THREE.PlaneGeometry(9, 2.4), hMat);
      h3.rotation.x = -Math.PI / 2;
      h3.position.set(0, 70.02, 0);
      pgiGroup.add(h1);
      pgiGroup.add(h2);
      pgiGroup.add(h3);

      // Helipad Green Perimeter Navigation Lights
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        const navLight = new THREE.Mesh(
          new THREE.SphereGeometry(0.4, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0x00ff88 })
        );
        navLight.position.set(Math.cos(a) * 16, 70.4, Math.sin(a) * 16);
        pgiGroup.add(navLight);
      }

      pgiGroup.userData = {
        name: "PGIMER Trauma & Apex Medical Super-Specialty Center (Sector 12)",
        type: "Emergency Destination Hub",
        desc: "Regional tertiary care apex institute. Connected to Madhya Marg Green Wave Corridor with preemption for critical patient transfers."
      };

      scene.add(pgiGroup);
    }

    // ══════════════════════════════════════════════════════════════
    // SECTOR 17 PEDESTRIAN CONCOURSE & PLAZA
    // ══════════════════════════════════════════════════════════════

    function buildSector17Plaza() {
      const plazaGroup = new THREE.Group();
      plazaGroup.position.set(75, 0, -75);

      // Elevated Plaza Ground Deck
      const deck = new THREE.Mesh(
        new THREE.BoxGeometry(80, 2, 80),
        new THREE.MeshStandardMaterial({ color: 0x182344, roughness: 0.65 })
      );
      deck.position.y = 1;
      deck.receiveShadow = true;
      plazaGroup.add(deck);

      // Le Corbusier Brutalist Concrete Canopy / Spaceframe
      const canopy = new THREE.Mesh(
        new THREE.CylinderGeometry(22, 26, 3.5, 6),
        new THREE.MeshStandardMaterial({
          color: 0x9D4EDD,
          emissive: 0x331055,
          transparent: true,
          opacity: 0.85
        })
      );
      canopy.position.set(0, 24, 0);
      canopy.castShadow = true;
      plazaGroup.add(canopy);

      // Support Columns
      for (let i = 0; i < 4; i++) {
        const col = new THREE.Mesh(
          new THREE.CylinderGeometry(0.9, 0.9, 24),
          new THREE.MeshStandardMaterial({ color: 0x64748B, metalness: 0.8 })
        );
        const ang = (i * Math.PI) / 2;
        col.position.set(Math.cos(ang) * 16, 12, Math.sin(ang) * 16);
        col.castShadow = true;
        plazaGroup.add(col);
      }

      // Public Urban Benches
      [-18, 18].forEach(bx => {
        [-18, 18].forEach(bz => {
          const bench = new THREE.Mesh(
            new THREE.BoxGeometry(6, 1, 2),
            new THREE.MeshStandardMaterial({ color: 0x475569 })
          );
          bench.position.set(bx, 2.5, bz);
          plazaGroup.add(bench);
        });
      });

      plazaGroup.userData = {
        name: "Sector 17 Central Plaza & Pedestrian Concourse",
        type: "Pedestrian Commercial Spine",
        desc: "Zero-vehicle pedestrian precinct. Monitored by 360° Edge-AI footfall sensors and crowd safety telemetry."
      };

      scene.add(plazaGroup);
    }

    // ══════════════════════════════════════════════════════════════
    // POLICE PINK BOOTHS (WOMEN & CHILD SAFETY)
    // ══════════════════════════════════════════════════════════════

    function buildPinkBooths() {
      const pinkLocations = [
        { x: -28, z: 28, sec: "Sector 22 Market Kiosk" },
        { x: 28, z: -28, sec: "Sector 17 Plaza Kiosk" }
      ];

      pinkLocations.forEach(loc => {
        const kioskGroup = new THREE.Group();
        kioskGroup.position.set(loc.x, 0, loc.z);

        // Octagonal Kiosk Body
        const kiosk = new THREE.Mesh(
          new THREE.CylinderGeometry(5.5, 6, 8, 8),
          new THREE.MeshStandardMaterial({ color: 0xFF2E93, emissive: 0x59002b, roughness: 0.35 })
        );
        kiosk.position.y = 4;
        kiosk.castShadow = true;
        kioskGroup.add(kiosk);

        // Glass Observation Window Band
        const win = new THREE.Mesh(
          new THREE.CylinderGeometry(5.6, 5.6, 2.5, 8),
          new THREE.MeshStandardMaterial({ color: 0x00F0FF, emissive: 0x002233, roughness: 0.1, transparent: true, opacity: 0.75 })
        );
        win.position.y = 4.5;
        kioskGroup.add(win);

        // Roof Sign
        const roofSign = new THREE.Mesh(
          new THREE.CylinderGeometry(6.5, 6.5, 1.8, 8),
          new THREE.MeshBasicMaterial({ color: 0xFF69B4 })
        );
        roofSign.position.y = 8.9;
        kioskGroup.add(roofSign);

        // High-Lux Emergency Beacon
        const beaconLight = new THREE.PointLight(0xFF2E93, 2.2, 35);
        beaconLight.position.set(0, 11.5, 0);
        kioskGroup.add(beaconLight);

        kioskGroup.userData = {
          name: \`Pink Safety Booth (\${loc.sec})\`,
          type: "Women & Child 24/7 Protection Node",
          desc: "Staffed by women police officers with dedicated SOS panic alert, rapid response escort, and secure shelter."
        };

        groupPink.add(kioskGroup);
      });
    }

    // ══════════════════════════════════════════════════════════════
    // SMART LORAWAN STREETLIGHT NETWORK
    // ══════════════════════════════════════════════════════════════

    function buildSmartStreetlights() {
      const lampPositions = [
        [-140, 0, 19], [-85, 0, 19], [-30, 0, 19], [30, 0, 19], [85, 0, 19], [140, 0, 19],
        [-140, 0, -19], [-85, 0, -19], [-30, 0, -19], [30, 0, -19], [85, 0, -19], [140, 0, -19],
        [19, 0, -140], [19, 0, -85], [19, 0, -30], [19, 0, 30], [19, 0, 85], [19, 0, 140],
        [-19, 0, -140], [-19, 0, -85], [-19, 0, -30], [-19, 0, 30], [-19, 0, 85], [-19, 0, 140]
      ];

      lampPositions.forEach((pos, idx) => {
        const poleGroup = new THREE.Group();
        poleGroup.position.set(pos[0], 0, pos[2]);

        // Modern Sleek Cantilever Pole
        const pole = new THREE.Mesh(
          new THREE.CylinderGeometry(0.35, 0.45, 17, 8),
          new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 })
        );
        pole.position.y = 8.5;
        pole.castShadow = true;
        poleGroup.add(pole);

        // Curved Overhang Arm
        const arm = new THREE.Mesh(
          new THREE.BoxGeometry(0.4, 0.4, 4.5),
          new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 })
        );
        arm.position.set(0, 16.8, pos[2] > 0 ? -2 : 2);
        poleGroup.add(arm);

        // Luminaire Head
        const head = new THREE.Mesh(
          new THREE.BoxGeometry(1.6, 0.5, 3),
          new THREE.MeshStandardMaterial({ color: 0x1e293b })
        );
        head.position.set(0, 16.6, pos[2] > 0 ? -3.5 : 3.5);
        poleGroup.add(head);

        // LED Bulb
        const bulb = new THREE.Mesh(
          new THREE.PlaneGeometry(1.2, 2.4),
          new THREE.MeshBasicMaterial({ color: 0xffe29a, side: THREE.DoubleSide })
        );
        bulb.rotation.x = Math.PI / 2;
        bulb.position.set(0, 16.3, pos[2] > 0 ? -3.5 : 3.5);
        poleGroup.add(bulb);
        streetlightBulbs.push(bulb);

        // Ground Illumination Light Pool
        const puddle = new THREE.Mesh(
          new THREE.CircleGeometry(16, 16),
          new THREE.MeshBasicMaterial({
            color: 0xffd166,
            transparent: true,
            opacity: 0.22,
            depthWrite: false
          })
        );
        puddle.rotation.x = -Math.PI / 2;
        puddle.position.set(0, 0.23, pos[2] > 0 ? -7 : 7);
        poleGroup.add(puddle);

        // Active PointLight on alternate poles
        if (idx % 2 === 0) {
          const pl = new THREE.PointLight(0xffe29a, 1.35, 55);
          pl.position.set(0, 15.5, pos[2] > 0 ? -3.5 : 3.5);
          poleGroup.add(pl);
          streetlightSources.push(pl);
        }

        poleGroup.userData = {
          name: \`Smart LED Luminaire Node #LP-\${idx + 101}\`,
          type: "Adaptive Street Illumination",
          desc: "Dynamic LoRaWAN Lux Modulation. Automatically dims to 30% during low traffic and boosts to 100% when SafePath pedestrians approach."
        };

        groupLighting.add(poleGroup);
      });
    }

    // ══════════════════════════════════════════════════════════════
    // VOLUMETRIC CCTV VISION CONES
    // ══════════════════════════════════════════════════════════════

    function buildCCTVNetwork() {
      const cctvCoords = [
        { x: -24, z: -24, rot: Math.PI / 4, id: "CCTV-CHD-2201" },
        { x: 24, z: -24, rot: 3 * Math.PI / 4, id: "CCTV-CHD-1702" },
        { x: -24, z: 24, rot: -Math.PI / 4, id: "CCTV-CHD-2203" },
        { x: 24, z: 24, rot: -3 * Math.PI / 4, id: "CCTV-CHD-1604" },
        { x: -95, z: 0, rot: 0, id: "CCTV-CHD-2205" },
        { x: 95, z: 0, rot: Math.PI, id: "CCTV-CHD-1706" }
      ];

      cctvCoords.forEach(c => {
        const camGroup = new THREE.Group();
        camGroup.position.set(c.x, 0, c.z);

        const pole = new THREE.Mesh(
          new THREE.CylinderGeometry(0.35, 0.45, 21),
          new THREE.MeshStandardMaterial({ color: 0x00F0FF, metalness: 0.85 })
        );
        pole.position.y = 10.5;
        camGroup.add(pole);

        const camUnit = new THREE.Mesh(
          new THREE.BoxGeometry(2.2, 1.6, 4),
          new THREE.MeshStandardMaterial({ color: 0x00F0FF, emissive: 0x003344 })
        );
        camUnit.position.set(0, 21, 0);
        camUnit.rotation.y = c.rot;
        camGroup.add(camUnit);

        // Volumetric Scanning Cone
        const cone = new THREE.Mesh(
          new THREE.ConeGeometry(28, 34, 18, 1, true),
          new THREE.MeshBasicMaterial({
            color: 0x00F0FF,
            transparent: true,
            opacity: 0.19,
            side: THREE.DoubleSide,
            depthWrite: false
          })
        );
        cone.position.set(Math.sin(c.rot) * 18, 10.5, Math.cos(c.rot) * 18);
        cone.rotation.x = Math.PI;
        cone.rotation.y = c.rot;
        camGroup.add(cone);

        // Ground Radar Footprint
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(18, 22, 24),
          new THREE.MeshBasicMaterial({
            color: 0x00F0FF,
            transparent: true,
            opacity: 0.38,
            side: THREE.DoubleSide
          })
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(Math.sin(c.rot) * 18, 0.26, Math.cos(c.rot) * 18);
        camGroup.add(ring);

        camGroup.userData = {
          name: \`Edge-AI Neural Camera (\${c.id})\`,
          type: "Autonomous 4K Surveillance Node",
          desc: "Hardware-level Real-Time Face & License Plate Blurring (DPDP Act 2023 Compliant). Edge incident triage with automated SOS dispatch."
        };

        groupCCTV.add(camGroup);
      });
    }

    // ══════════════════════════════════════════════════════════════
    // HAZARD DETECTION & AI BLIND SPOTS
    // ══════════════════════════════════════════════════════════════

    function buildBlindSpotsAndDarkZones() {
      const hazardZones = [
        {
          x: -68, z: 68, w: 36, d: 30, color: 0xFF3366,
          name: "AI Identified Camera Blind Spot #BS-09",
          type: "Camera Shadow Zone",
          desc: "⚠️ Identified zero-coverage corridor behind Sector 22 Block C. Recommendation: Deploy 1 LoRa retrofitted edge dome camera."
        },
        {
          x: 68, z: -68, w: 32, d: 32, color: 0xFF3366,
          name: "AI Identified Camera Blind Spot #BS-14",
          type: "Alleyway Shadow Zone",
          desc: "⚠️ Sector 17 commercial service lane blind spot. SafePath reroutes night commuters away from this section automatically."
        },
        {
          x: -62, z: -58, w: 42, d: 26, color: 0xFFB800,
          name: "Low-Lux Dark Stretch #LS-04",
          type: "Insufficient Streetlight Illumination",
          desc: "🌙 Mean Illumination: 3.8 Lux. Scheduled for high-efficiency LED lumen upgrade under MCC Smart City phase 2."
        }
      ];

      hazardZones.forEach(hz => {
        const zone = new THREE.Mesh(
          new THREE.PlaneGeometry(hz.w, hz.d),
          new THREE.MeshBasicMaterial({
            color: hz.color,
            transparent: true,
            opacity: 0.36,
            side: THREE.DoubleSide
          })
        );
        zone.rotation.x = -Math.PI / 2;
        zone.position.set(hz.x, 0.27, hz.z);

        // Hovering Pulsing Marker
        const marker = new THREE.Mesh(
          new THREE.OctahedronGeometry(2.5, 0),
          new THREE.MeshBasicMaterial({ color: hz.color, wireframe: true })
        );
        marker.position.set(hz.x, 9, hz.z);
        scene.add(marker);

        zone.userData = {
          name: hz.name,
          type: hz.type,
          desc: hz.desc
        };

        groupBlind.add(zone);
      });
    }

    // ══════════════════════════════════════════════════════════════
    // SMART IOT COMPACTOR WASTE BINS
    // ══════════════════════════════════════════════════════════════

    function buildSmartWasteBins() {
      const binData = [
        { x: -38, z: 14, fill: 94, status: "CRITICAL OVERFLOW", color: 0xFF3366 },
        { x: -78, z: 14, fill: 78, status: "WARNING", color: 0xFFB800 },
        { x: 38, z: -14, fill: 35, status: "NORMAL", color: 0x00FF88 },
        { x: 88, z: -14, fill: 20, status: "NORMAL", color: 0x00FF88 },
        { x: 14, z: 54, fill: 89, status: "CRITICAL OVERFLOW", color: 0xFF3366 },
        { x: -14, z: -74, fill: 42, status: "NORMAL", color: 0x00FF88 }
      ];

      binData.forEach((b, i) => {
        const binGroup = new THREE.Group();
        binGroup.position.set(b.x, 0, b.z);

        // Compactor Stainless Housing
        const binBody = new THREE.Mesh(
          new THREE.CylinderGeometry(1.8, 1.6, 5, 16),
          new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 })
        );
        binBody.position.y = 2.5;
        binBody.castShadow = true;
        binGroup.add(binBody);

        // LED Fill Ring on Collar
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(1.7, 0.35, 8, 24),
          new THREE.MeshBasicMaterial({ color: b.color })
        );
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 4.8;
        binGroup.add(ring);

        // Ultrasonic Sensor Dome
        const sensor = new THREE.Mesh(
          new THREE.SphereGeometry(0.55, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0x00F0FF })
        );
        sensor.position.set(0, 5.3, 0);
        binGroup.add(sensor);

        binGroup.userData = {
          name: \`IoT Smart Bin #WB-22\${i + 1} (\${b.status})\`,
          type: "Solar Powered Waste Compactor Node",
          desc: \`Capacity Fill: \${b.fill}% • Ultrasonic Telemetry Active. Dynamic route generated for MCC Compactor Truck.\`
        };

        groupBins.add(binGroup);
      });
    }

    // ══════════════════════════════════════════════════════════════
    // REALISTIC MULTI-MESH VEHICLE FLEET
    // ══════════════════════════════════════════════════════════════

    function createWheel(x, y, z) {
      const wheelGeo = new THREE.CylinderGeometry(1.1, 1.1, 0.8, 14);
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, y, z);
      wheel.castShadow = true;

      // Rim
      const rim = new THREE.Mesh(
        new THREE.CylinderGeometry(0.65, 0.65, 0.82, 8),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 })
      );
      wheel.add(rim);
      return wheel;
    }

    function createRealisticPolicePCRVan() {
      const car = new THREE.Group();

      // Lower Chassis (Dark Navy)
      const chassis = new THREE.Mesh(
        new THREE.BoxGeometry(4.6, 1.8, 9),
        new THREE.MeshStandardMaterial({ color: 0x0c1e40, roughness: 0.3, metalness: 0.5 })
      );
      chassis.position.y = 1.6;
      chassis.castShadow = true;
      car.add(chassis);

      // White Police Door & Hood Livery
      const livery = new THREE.Mesh(
        new THREE.BoxGeometry(4.65, 0.9, 5),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
      );
      livery.position.set(0, 1.8, 0);
      car.add(livery);

      // Cabin & Tinted Windows
      const cabin = new THREE.Mesh(
        new THREE.BoxGeometry(4.2, 1.6, 5.2),
        new THREE.MeshStandardMaterial({ color: 0x00F0FF, emissive: 0x002233, roughness: 0.1, metalness: 0.8, transparent: true, opacity: 0.85 })
      );
      cabin.position.set(0, 3.1, -0.4);
      car.add(cabin);

      // Roof Emergency Siren Lightbar
      const redLight = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.5, 0.7), new THREE.MeshBasicMaterial({ color: 0xff0033 }));
      redLight.position.set(-1.1, 4.1, -0.4);
      const blueLight = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.5, 0.7), new THREE.MeshBasicMaterial({ color: 0x0055ff }));
      blueLight.position.set(1.1, 4.1, -0.4);
      car.add(redLight);
      car.add(blueLight);

      // Flashing Light Source
      const sirenPL = new THREE.PointLight(0xff0033, 2.5, 30);
      sirenPL.position.set(0, 4.5, -0.4);
      car.add(sirenPL);
      vehicleBeacons.push({ light: sirenPL, redMesh: redLight, blueMesh: blueLight });

      // Headlights & Taillights
      const hl1 = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), new THREE.MeshBasicMaterial({ color: 0xfff5dd }));
      hl1.position.set(-1.6, 1.6, 4.55);
      const hl2 = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), new THREE.MeshBasicMaterial({ color: 0xfff5dd }));
      hl2.position.set(1.6, 1.6, 4.55);
      car.add(hl1);
      car.add(hl2);

      // 4 Wheels
      car.add(createWheel(-2.3, 1.1, 2.7));
      car.add(createWheel(2.3, 1.1, 2.7));
      car.add(createWheel(-2.3, 1.1, -2.7));
      car.add(createWheel(2.3, 1.1, -2.7));

      return car;
    }

    function createRealisticAmbulance() {
      const ambu = new THREE.Group();

      // Main Ambulance High-Roof Body
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(4.8, 3.6, 10.5),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25, metalness: 0.2 })
      );
      body.position.y = 2.7;
      body.castShadow = true;
      ambu.add(body);

      // Orange Reflective Chevron Band
      const band = new THREE.Mesh(
        new THREE.BoxGeometry(4.85, 0.8, 9.8),
        new THREE.MeshBasicMaterial({ color: 0xff6600 })
      );
      band.position.set(0, 2.4, 0);
      ambu.add(band);

      // Red Medical Crosses on Sides
      const crossMat = new THREE.MeshBasicMaterial({ color: 0xff0033 });
      [-2.45, 2.45].forEach(xSide => {
        const c1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.8, 0.6), crossMat);
        const c2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.6, 1.8), crossMat);
        c1.position.set(xSide, 3.4, 0);
        c2.position.set(xSide, 3.4, 0);
        ambu.add(c1);
        ambu.add(c2);
      });

      // Front Windshield
      const glass = new THREE.Mesh(
        new THREE.BoxGeometry(4.4, 1.6, 0.2),
        new THREE.MeshStandardMaterial({ color: 0x00F0FF, roughness: 0.1, metalness: 0.9 })
      );
      glass.position.set(0, 3.2, 5.26);
      ambu.add(glass);

      // Roof Beacon
      const ambuBeacon = new THREE.PointLight(0x00F0FF, 3, 35);
      ambuBeacon.position.set(0, 4.8, 2);
      ambu.add(ambuBeacon);
      vehicleBeacons.push({ light: ambuBeacon });

      // 4 Heavy-Duty Wheels
      ambu.add(createWheel(-2.4, 1.1, 3.2));
      ambu.add(createWheel(2.4, 1.1, 3.2));
      ambu.add(createWheel(-2.4, 1.1, -3.2));
      ambu.add(createWheel(2.4, 1.1, -3.2));

      return ambu;
    }

    function createRealisticWasteTruck() {
      const truck = new THREE.Group();

      // Cab (MCC Green)
      const cab = new THREE.Mesh(
        new THREE.BoxGeometry(5.2, 3.6, 4.5),
        new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.4 })
      );
      cab.position.set(0, 2.7, 4.2);
      cab.castShadow = true;
      truck.add(cab);

      // Compactor Hopper Container (Grey Metallic)
      const hopper = new THREE.Mesh(
        new THREE.BoxGeometry(5.4, 4.6, 8.5),
        new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.3 })
      );
      hopper.position.set(0, 3.4, -2.2);
      hopper.castShadow = true;
      truck.add(hopper);

      // Flashing Amber Hazard Beacon
      const hazardLight = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.6), new THREE.MeshBasicMaterial({ color: 0xffaa00 }));
      hazardLight.position.set(0, 4.8, 4.2);
      truck.add(hazardLight);

      // 6 Heavy Wheels
      truck.add(createWheel(-2.6, 1.2, 4.2));
      truck.add(createWheel(2.6, 1.2, 4.2));
      truck.add(createWheel(-2.6, 1.2, -1.5));
      truck.add(createWheel(2.6, 1.2, -1.5));
      truck.add(createWheel(-2.6, 1.2, -4.5));
      truck.add(createWheel(2.6, 1.2, -4.5));

      return truck;
    }

    function createCivilianCar(color = 0xffffff) {
      const car = new THREE.Group();

      // Lower Body
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(4.2, 1.4, 8),
        new THREE.MeshStandardMaterial({ color: color, roughness: 0.3, metalness: 0.6 })
      );
      body.position.y = 1.3;
      body.castShadow = true;
      car.add(body);

      // Cabin Roof
      const roof = new THREE.Mesh(
        new THREE.BoxGeometry(3.8, 1.3, 4.4),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 })
      );
      roof.position.set(0, 2.45, -0.4);
      car.add(roof);

      // Wheels
      car.add(createWheel(-2.1, 0.95, 2.3));
      car.add(createWheel(2.1, 0.95, 2.3));
      car.add(createWheel(-2.1, 0.95, -2.3));
      car.add(createWheel(2.1, 0.95, -2.3));

      return car;
    }

    function buildRealisticVehicleFleet() {
      // 1. PCR-04 Police Interceptor
      const pcr = createRealisticPolicePCRVan();
      pcr.position.set(-8.5, 0, -140);
      pcr.userData = {
        name: "PCR-04 Chandigarh Police Patrol (Rapid Response)",
        type: "Active Safety Interceptor",
        desc: "Speed: 42 km/h • GPS Tracked. Patrolling Jan Marg corridor between Sector 22 Market and Central Plaza."
      };
      groupVehicles.add(pcr);
      movingVehicles.push({ mesh: pcr, axis: 'z', speed: 0.52, min: -170, max: 170 });

      // 2. 108 Emergency Ambulance MED-01
      const ambu = createRealisticAmbulance();
      ambu.position.set(150, 0, 8.5);
      ambu.rotation.y = -Math.PI / 2;
      ambu.userData = {
        name: "108 Emergency Ambulance MED-01 (Apex Trauma)",
        type: "Emergency Life Support",
        desc: "Navigating Madhya Marg towards PGIMER. Madhya Marg Green Wave Corridor grants preemptive right-of-way."
      };
      groupVehicles.add(ambu);
      movingVehicles.push({ mesh: ambu, axis: 'x', speed: -0.75, min: -170, max: 170 });

      // 3. MCC Smart Compactor Waste Truck #WM-04
      const truck = createRealisticWasteTruck();
      truck.position.set(8.5, 0, 120);
      truck.userData = {
        name: "MCC Smart Compactor Truck #WM-04",
        type: "Dynamic Municipal Logistics",
        desc: "Automated route targeting overflowing smart bins (>80%). Optimized route reduces municipal diesel burn by 34%."
      };
      groupVehicles.add(truck);
      movingVehicles.push({ mesh: truck, axis: 'z', speed: -0.32, min: -160, max: 160 });

      // 4. Civilian Ambient Traffic
      const civ1 = createCivilianCar(0xe2e8f0);
      civ1.position.set(-150, 0, -8.5);
      civ1.rotation.y = Math.PI / 2;
      civ1.userData = { name: "Civilian Commuter Sedan (Sector 17/PGI)", type: "Smart Urban Mobility", desc: "Speed: 45 km/h • FASTag & Smart Parking sync active." };
      groupVehicles.add(civ1);
      movingVehicles.push({ mesh: civ1, axis: 'x', speed: 0.62, min: -170, max: 170 });

      const civ2 = createCivilianCar(0xd97706);
      civ2.position.set(7.5, 0, -80);
      civ2.userData = { name: "City EV Commuter", type: "Sustainable Mobility", desc: "Green Plate Electric Vehicle. Sector 17 fast charger scheduled." };
      groupVehicles.add(civ2);
      movingVehicles.push({ mesh: civ2, axis: 'z', speed: 0.48, min: -160, max: 160 });
    }

    // ══════════════════════════════════════════════════════════════
    // AUTONOMOUS SURVEILLANCE DRONE
    // ══════════════════════════════════════════════════════════════

    function buildSurveillanceDrone() {
      movingDrone = new THREE.Group();
      movingDrone.position.set(0, 52, 0);

      // Drone Body
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(4.5, 1.4, 4.5),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 })
      );
      movingDrone.add(body);

      // 4 Carbon Arms & Quad Rotors
      [-2.4, 2.4].forEach(rx => {
        [-2.4, 2.4].forEach(rz => {
          const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 3), new THREE.MeshStandardMaterial({ color: 0x475569 }));
          arm.position.set(rx * 0.5, 0, rz * 0.5);
          arm.rotation.z = rx > 0 ? -Math.PI / 4 : Math.PI / 4;
          movingDrone.add(arm);

          const rotor = new THREE.Mesh(
            new THREE.CylinderGeometry(1.6, 1.6, 0.1, 8),
            new THREE.MeshBasicMaterial({ color: 0x00F0FF, transparent: true, opacity: 0.55 })
          );
          rotor.position.set(rx, 0.8, rz);
          movingDrone.add(rotor);
        });
      });

      // Gimbal FLIR Camera
      const gimbal = new THREE.Mesh(
        new THREE.SphereGeometry(0.8, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0x00F0FF, emissive: 0x003344 })
      );
      gimbal.position.set(0, -0.9, 0);
      movingDrone.add(gimbal);

      // Searchlight Spot Cone
      const searchLight = new THREE.SpotLight(0x00F0FF, 3.5, 120, Math.PI / 5, 0.5);
      searchLight.position.set(0, -1, 0);
      const target = new THREE.Object3D();
      target.position.set(0, -60, 0);
      movingDrone.add(target);
      searchLight.target = target;
      movingDrone.add(searchLight);

      movingDrone.userData = {
        name: "Autonomous Aerial Drone SkyMesh-01",
        type: "Overhead Night Safety Patrol",
        desc: "Equipped with FLIR thermal night vision & AI crowd anomaly alerts. Continuously patrols SafePath corridors."
      };

      scene.add(movingDrone);
    }

    // ══════════════════════════════════════════════════════════════
    // EMERGENCY GREEN WAVE HIGHWAY CORRIDOR
    // ══════════════════════════════════════════════════════════════

    function buildEmergencyGreenCorridorMeshes() {
      const laneMat = new THREE.MeshBasicMaterial({
        color: 0x00FF88,
        transparent: true,
        opacity: 0.0,
        side: THREE.DoubleSide
      });

      const greenHighway = new THREE.Mesh(new THREE.PlaneGeometry(620, 20), laneMat);
      greenHighway.rotation.x = -Math.PI / 2;
      greenHighway.position.set(0, 0.28, 0);
      groupCorridor.add(greenHighway);
      corridorLanes.push(laneMat);

      // Pulsing Green Directional Arrows pointing to PGIMER (West)
      for (let x = -280; x <= 280; x += 32) {
        const arrow = new THREE.Mesh(
          new THREE.ConeGeometry(2.5, 6, 3),
          new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.0 })
        );
        arrow.rotation.x = -Math.PI / 2;
        arrow.rotation.z = Math.PI / 2; // Point West towards PGIMER
        arrow.position.set(x, 0.32, 0);
        groupCorridor.add(arrow);
        corridorArrows.push(arrow.material);
      }
    }

    // ══════════════════════════════════════════════════════════════
    // INTERACTION & RAYCASTING
    // ══════════════════════════════════════════════════════════════

    function setupRaycaster() {
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      window.addEventListener('click', (event) => {
        if (event.clientY < 80 || event.clientX < 260 && event.clientY > 100) return;
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);

        if (intersects.length > 0) {
          let obj = intersects[0].object;
          while (obj && (!obj.userData || !obj.userData.name) && obj.parent) {
            obj = obj.parent;
          }

          if (obj && obj.userData && obj.userData.name) {
            playBeep('click');
            showInspector(obj);
          }
        }
      });
    }

    function showInspector(obj) {
      currentSelectedTarget = obj;
      const card = document.getElementById('inspectorCard');
      document.getElementById('inspBadge').textContent = (obj.userData.type || 'URBAN MESH').toUpperCase();
      document.getElementById('inspTitle').textContent = obj.userData.name;
      document.getElementById('inspDesc').textContent = obj.userData.desc || "Smart city spatial infrastructure node.";
      card.style.display = 'block';
    }

    function closeInspector() {
      playBeep('click');
      document.getElementById('inspectorCard').style.display = 'none';
      currentSelectedTarget = null;
    }

    function focusInspectorTarget() {
      if (!currentSelectedTarget) return;
      playBeep('safe');
      const pos = new THREE.Vector3();
      currentSelectedTarget.getWorldPosition(pos);
      startCameraTransition(
        new THREE.Vector3(pos.x + 36, pos.y + 44, pos.z + 46),
        new THREE.Vector3(pos.x, pos.y, pos.z)
      );
    }

    // ══════════════════════════════════════════════════════════════
    // SMOOTH CINEMATIC CAMERA TRANSITIONS
    // ══════════════════════════════════════════════════════════════

    function startCameraTransition(targetCam, targetLookAt) {
      camStartPos.copy(camera.position);
      camEndPos.copy(targetCam);
      camStartTarget.copy(controls.target);
      camEndTarget.copy(targetLookAt);
      camStartTime = performance.now();
      isCamTransitioning = true;
    }

    function setCameraView(preset, elem) {
      playBeep('click');
      document.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
      if (elem) elem.classList.add('active');

      if (preset === 'overview') {
        startCameraTransition(new THREE.Vector3(135, 145, 175), new THREE.Vector3(0, 0, 0));
      } else if (preset === 'plaza') {
        startCameraTransition(new THREE.Vector3(115, 42, -32), new THREE.Vector3(75, 4, -75));
      } else if (preset === 'openhand') {
        startCameraTransition(new THREE.Vector3(185, 52, -125), new THREE.Vector3(165, 34, -165));
      } else if (preset === 'hospital') {
        startCameraTransition(new THREE.Vector3(-115, 72, 115), new THREE.Vector3(-155, 32, 155));
      } else if (preset === 'street') {
        startCameraTransition(new THREE.Vector3(-8, 7, 52), new THREE.Vector3(0, 4, -35));
      } else if (preset === 'drone') {
        startCameraTransition(new THREE.Vector3(0, 165, 125), new THREE.Vector3(0, 25, 0));
      }
    }

    function resetCameraToDefault() {
      playBeep('click');
      setCameraView('overview', document.querySelector('.preset-chip'));
    }

    // ══════════════════════════════════════════════════════════════
    // LAYER TOGGLES & DAY/NIGHT MODES
    // ══════════════════════════════════════════════════════════════

    function toggleLayer(layer, elem) {
      playBeep('click');
      elem.classList.toggle('checked');
      const isVisible = elem.classList.contains('checked');

      if (layer === 'cctv') groupCCTV.visible = isVisible;
      if (layer === 'blind') groupBlind.visible = isVisible;
      if (layer === 'lighting') groupLighting.visible = isVisible;
      if (layer === 'bins') groupBins.visible = isVisible;
      if (layer === 'pink') groupPink.visible = isVisible;
      if (layer === 'vehicles') groupVehicles.visible = isVisible;
    }

    function toggleTimeOfDay() {
      playBeep('click');
      isNight = !isNight;
      const icon = document.getElementById('dayNightIcon');
      const text = document.getElementById('dayNightText');

      if (isNight) {
        icon.textContent = "🌙";
        text.textContent = "Night Cyber Mode";
        scene.background.set(0x060919);
        scene.fog.color.set(0x060919);
        hemiLight.color.set(0x4070a0);
        hemiLight.groundColor.set(0x0c142b);
        hemiLight.intensity = 0.85;
        sunLight.intensity = 0.25;
        moonLight.intensity = 0.35;
        streetlightBulbs.forEach(b => b.material.color.set(0xffe29a));
        streetlightSources.forEach(s => s.intensity = 1.35);
      } else {
        icon.textContent = "☀️";
        text.textContent = "Day Architecture Mode";
        scene.background.set(0xbeddf4); // Warm Punjab daytime sky
        scene.fog.color.set(0xbeddf4);
        hemiLight.color.set(0xffffff);
        hemiLight.groundColor.set(0x7c94a6);
        hemiLight.intensity = 1.3;
        sunLight.intensity = 1.6;
        moonLight.intensity = 0.05;
        streetlightBulbs.forEach(b => b.material.color.set(0x888888));
        streetlightSources.forEach(s => s.intensity = 0.0);
      }
    }

    function triggerEmergencyGreenWave() {
      greenCorridorActive = !greenCorridorActive;
      const banner = document.getElementById('corridorBanner');
      const btn = document.getElementById('greenWaveBtn');

      if (greenCorridorActive) {
        playBeep('alert');
        banner.style.display = 'flex';
        btn.classList.add('active');
        btn.textContent = "🛑 Stop Green Corridor";
        corridorLanes.forEach(m => m.opacity = 0.55);
        corridorArrows.forEach(m => m.opacity = 0.85);
      } else {
        playBeep('click');
        banner.style.display = 'none';
        btn.classList.remove('active');
        btn.textContent = "🚨 Preempt Green Corridor (PGIMER)";
        corridorLanes.forEach(m => m.opacity = 0.0);
        corridorArrows.forEach(m => m.opacity = 0.0);
      }
    }

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // ══════════════════════════════════════════════════════════════
    // ANIMATION & SIMULATION LOOP
    // ══════════════════════════════════════════════════════════════

    let clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // 1. Smooth Camera Transition Interpolation
      if (isCamTransitioning) {
        const progress = Math.min((performance.now() - camStartTime) / (camDuration * 1000), 1.0);
        // Smooth Cubic Easing
        const ease = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        camera.position.lerpVectors(camStartPos, camEndPos, ease);
        controls.target.lerpVectors(camStartTarget, camEndTarget, ease);
        controls.update();

        if (progress >= 1.0) isCamTransitioning = false;
      }

      // 2. Rotate The Open Hand Monument gently with Punjab winds
      if (openHandMesh) {
        openHandMesh.rotation.y = Math.sin(time * 0.4) * 0.35;
      }

      // 3. Water Specular Shimmer
      if (waterMesh) {
        waterMesh.material.opacity = 0.75 + Math.sin(time * 2.5) * 0.1;
      }

      // 4. Animate Realistic Vehicle Fleet along Lanes
      movingVehicles.forEach(v => {
        if (v.axis === 'z') {
          v.mesh.position.z += v.speed;
          if (v.mesh.position.z > v.max || v.mesh.position.z < v.min) {
            v.speed *= -1;
            v.mesh.rotation.y += Math.PI; // Rotate vehicle on U-turn
          }
        } else if (v.axis === 'x') {
          v.mesh.position.x += v.speed;
          if (v.mesh.position.x > v.max || v.mesh.position.x < v.min) {
            v.speed *= -1;
            v.mesh.rotation.y += Math.PI;
          }
        }
      });

      // 5. Alternate Emergency Siren Beacons
      const flash = Math.floor(time * 8) % 2;
      vehicleBeacons.forEach(b => {
        if (b.redMesh && b.blueMesh) {
          b.redMesh.material.color.setHex(flash === 0 ? 0xff0033 : 0x220005);
          b.blueMesh.material.color.setHex(flash === 1 ? 0x0055ff : 0x000a22);
          b.light.color.setHex(flash === 0 ? 0xff0033 : 0x0055ff);
        } else if (b.light) {
          b.light.intensity = 2.0 + Math.sin(time * 12) * 1.5;
        }
      });

      // 6. Blink High-Rise Aviation Obstruction Lights
      const aviationBlink = (Math.floor(time * 2) % 2 === 0);
      blinkingAviationLights.forEach(b => {
        b.visible = aviationBlink;
      });

      // 7. Aerial Drone Orbit & Thermal Gimbal Sweep
      if (movingDrone) {
        movingDrone.position.x = Math.sin(time * 0.28) * 65;
        movingDrone.position.z = Math.cos(time * 0.28) * 65;
        movingDrone.position.y = 52 + Math.sin(time * 1.6) * 1.8;
        movingDrone.rotation.y = time * 0.28 + Math.PI / 2;
      }

      // 8. Emergency Green Corridor Dynamic Pulse
      if (greenCorridorActive) {
        corridorLanes.forEach(m => {
          m.opacity = 0.42 + Math.sin(time * 6) * 0.18;
        });
        corridorArrows.forEach(m => {
          m.opacity = 0.6 + Math.sin(time * 8) * 0.3;
        });
      }

      // 9. Update Orbit Controls
      controls.update();

      // 10. Render Frame
      renderer.render(scene, camera);
    }

    // Auto-boot 3D environment on load
    window.addEventListener('DOMContentLoaded', init3DTwin);
  </script>
</body>
</html>`;

const finalContent = headContent + upgradedScript;
fs.writeFileSync(origPath, finalContent, 'utf8');
console.log('Successfully upgraded twin.html! New file size:', finalContent.length);
