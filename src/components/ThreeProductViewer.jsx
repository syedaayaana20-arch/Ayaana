import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, Sparkles, Wind } from 'lucide-react';

export default function ThreeProductViewer({ productName = "Radiance Cream", className = "" }) {
  const containerRef = useRef(null);
  const lowerName = (productName || '').toLowerCase();
  const isToner = lowerName.includes('toner');
  const isMask = !isToner && lowerName.includes('mask');
  const isHandFeetCream = !isToner && !isMask && (lowerName.includes('hand') || lowerName.includes('feet') || lowerName.includes('foot'));
  const isFaceWhiteningCream = !isToner && !isMask && !isHandFeetCream && (lowerName.includes('whitening') || lowerName.includes('face') || lowerName.includes('radiance') || lowerName.includes('repair'));

  const [isCapOpen, setIsCapOpen] = useState(false);
  const isCapOpenRef = useRef(isCapOpen);
  const capMeshRef = useRef(null);

  // Toner specific states & refs
  const [tonerShade, setTonerShade] = useState('rose'); // 'rose' | 'amber' | 'clear'
  const tonerShadeRef = useRef(tonerShade);
  const liquidMaterialRef = useRef(null);

  const [isSpraying, setIsSpraying] = useState(false);
  const isSprayingRef = useRef(false);
  const sprayActuatorRef = useRef(null);
  const sprayCapRef = useRef(null);
  const overcapMaterialRef = useRef(null);
  const particlesRef = useRef(null);

  useEffect(() => {
    isCapOpenRef.current = isCapOpen;
  }, [isCapOpen]);

  useEffect(() => {
    tonerShadeRef.current = tonerShade;
    if (liquidMaterialRef.current) {
      const colors = {
        rose: new THREE.Color('#EF6C8A'),
        amber: new THREE.Color('#C68228'),
        clear: new THREE.Color('#BFE6F5')
      };
      liquidMaterialRef.current.color.copy(colors[tonerShade] || colors.rose);
    }
  }, [tonerShade]);

  const handleSpray = () => {
    if (isSpraying) return;
    setIsSpraying(true);
    isSprayingRef.current = true;
    setTimeout(() => {
      setIsSpraying(false);
      isSprayingRef.current = false;
    }, 1400);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || 360;
    let height = container.clientHeight || 360;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);

    // Position camera based on product shape
    if (isToner) {
      camera.position.set(0, 0.05, 4.3);
    } else if (isHandFeetCream) {
      camera.position.set(0, 0.38, 4.1);
    } else if (isFaceWhiteningCream || isMask) {
      camera.position.set(0, 0.22, 4.4);
    } else {
      camera.position.set(0, 0.35, 3.7);
    }

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance"
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;
      container.appendChild(renderer.domElement);
    } catch (err) {
      console.warn("ThreeProductViewer WebGL not available:", err);
      return;
    }

    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    let lidTexture = null;
    let bodyTexture = null;
    let tonerLabelTexture = null;

    if (isToner) {
      // ==========================================
      // --- AYANA'S WHITENING TONER 3D BOTTLE ---
      // ==========================================

      // 1. Crystal Clear Outer Bottle Wall (PET / Glass)
      const bottleGlassMaterial = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#FFFFFF'),
        metalness: 0.02,
        roughness: 0.06,
        transmission: 0.94,
        ior: 1.49,
        thickness: 0.2,
        transparent: true,
        opacity: 0.92,
        clearcoat: 0.85,
        clearcoatRoughness: 0.08
      });

      // 2. Translucent Toner Fluid Inside
      const initialLiquidColor = tonerShadeRef.current === 'amber'
        ? new THREE.Color('#C68228')
        : (tonerShadeRef.current === 'clear' ? new THREE.Color('#BFE6F5') : new THREE.Color('#EF6C8A'));

      const liquidMaterial = new THREE.MeshPhysicalMaterial({
        color: initialLiquidColor,
        metalness: 0.05,
        roughness: 0.05,
        transmission: 0.68,
        ior: 1.34,
        transparent: true,
        opacity: 0.94
      });
      liquidMaterialRef.current = liquidMaterial;

      // 3. Clear Bottle Body Mesh
      const bodyGeo = new THREE.CylinderGeometry(0.48, 0.48, 1.46, 64);
      const bodyMesh = new THREE.Mesh(bodyGeo, bottleGlassMaterial);
      bodyMesh.position.y = -0.32;
      modelGroup.add(bodyMesh);

      // Base bevel (rounded bottom curve)
      const baseGeo = new THREE.CylinderGeometry(0.48, 0.43, 0.08, 64);
      const baseMesh = new THREE.Mesh(baseGeo, bottleGlassMaterial);
      baseMesh.position.y = -1.09;
      modelGroup.add(baseMesh);

      // 4. Liquid Cylinder Inside
      const liquidGeo = new THREE.CylinderGeometry(0.455, 0.455, 1.34, 48);
      const liquidMesh = new THREE.Mesh(liquidGeo, liquidMaterial);
      liquidMesh.position.y = -0.37;
      modelGroup.add(liquidMesh);

      // Liquid Surface Disk
      const meniscusGeo = new THREE.CircleGeometry(0.455, 48);
      const meniscusMesh = new THREE.Mesh(meniscusGeo, liquidMaterial);
      meniscusMesh.rotation.x = -Math.PI / 2;
      meniscusMesh.position.y = 0.30;
      modelGroup.add(meniscusMesh);

      // 5. Dip Tube
      const dipTubeMaterial = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#FFFFFF'),
        transmission: 0.9,
        transparent: true,
        opacity: 0.75,
        roughness: 0.1
      });
      const dipTubeGeo = new THREE.CylinderGeometry(0.018, 0.018, 1.48, 16);
      const dipTubeMesh = new THREE.Mesh(dipTubeGeo, dipTubeMaterial);
      dipTubeMesh.position.set(0.02, -0.32, 0.01);
      modelGroup.add(dipTubeMesh);

      // 6. Authentic Wrap-Around Label
      const textureLoader = new THREE.TextureLoader();
      tonerLabelTexture = textureLoader.load('/assets/toner_3d_label.png');
      tonerLabelTexture.colorSpace = THREE.SRGBColorSpace;

      const labelMaterial = new THREE.MeshStandardMaterial({
        map: tonerLabelTexture,
        roughness: 0.32,
        metalness: 0.02,
        side: THREE.FrontSide
      });

      const labelGeo = new THREE.CylinderGeometry(0.488, 0.488, 0.94, 64, 1, true);
      const labelMesh = new THREE.Mesh(labelGeo, labelMaterial);
      labelMesh.position.y = -0.27;
      labelMesh.rotation.y = Math.PI; // Face the front label directly forward
      modelGroup.add(labelMesh);

      // 7. Bottle Shoulder
      const shoulderGeo = new THREE.CylinderGeometry(0.24, 0.48, 0.16, 64);
      const shoulderMesh = new THREE.Mesh(shoulderGeo, bottleGlassMaterial);
      shoulderMesh.position.y = 0.49;
      modelGroup.add(shoulderMesh);

      // 8. Neck Ring & White Screw Collar
      const collarMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#F7F7F7'),
        roughness: 0.3,
        metalness: 0.05
      });

      const collarGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.24, 48);
      const collarMesh = new THREE.Mesh(collarGeo, collarMaterial);
      collarMesh.position.y = 0.69;
      modelGroup.add(collarMesh);

      for (let i = 0; i < 32; i++) {
        const angle = (i / 32) * Math.PI * 2;
        const ribGeo = new THREE.BoxGeometry(0.015, 0.20, 0.018);
        const ribMesh = new THREE.Mesh(ribGeo, collarMaterial);
        ribMesh.position.set(Math.sin(angle) * 0.254, 0.69, Math.cos(angle) * 0.254);
        ribMesh.rotation.y = angle;
        modelGroup.add(ribMesh);
      }

      // Gasket ring
      const gasketMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#D8D8D8'),
        metalness: 0.85,
        roughness: 0.2
      });
      const gasketGeo = new THREE.TorusGeometry(0.246, 0.012, 16, 48);
      const gasketMesh = new THREE.Mesh(gasketGeo, gasketMaterial);
      gasketMesh.rotation.x = Math.PI / 2;
      gasketMesh.position.y = 0.58;
      modelGroup.add(gasketMesh);

      // 9. Spray Actuator Head Group
      const actuatorGroup = new THREE.Group();
      actuatorGroup.position.y = 0.95;
      modelGroup.add(actuatorGroup);
      sprayActuatorRef.current = actuatorGroup;

      const actuatorMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#FFFFFF'),
        roughness: 0.28,
        metalness: 0.04
      });

      const actuatorGeo = new THREE.CylinderGeometry(0.17, 0.17, 0.32, 48);
      const actuatorMesh = new THREE.Mesh(actuatorGeo, actuatorMaterial);
      actuatorMesh.position.y = 0;
      actuatorGroup.add(actuatorMesh);

      const topDipGeo = new THREE.CylinderGeometry(0.155, 0.17, 0.03, 48);
      const topDipMesh = new THREE.Mesh(topDipGeo, actuatorMaterial);
      topDipMesh.position.y = 0.17;
      actuatorGroup.add(topDipMesh);

      const nozzleHoleMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color('#3A3A3A') });
      const nozzleHoleGeo = new THREE.CircleGeometry(0.022, 24);
      const nozzleHoleMesh = new THREE.Mesh(nozzleHoleGeo, nozzleHoleMaterial);
      nozzleHoleMesh.position.set(0, 0.02, 0.172);
      actuatorGroup.add(nozzleHoleMesh);

      // 10. Clear Protective Overcap
      const overcapMaterial = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#FFFFFF'),
        transmission: 0.92,
        transparent: true,
        opacity: 0.65,
        roughness: 0.12,
        ior: 1.46
      });
      overcapMaterialRef.current = overcapMaterial;

      const overcapGroup = new THREE.Group();
      overcapGroup.position.y = 1.05;
      modelGroup.add(overcapGroup);
      sprayCapRef.current = overcapGroup;
      capMeshRef.current = overcapGroup;

      const overcapGeo = new THREE.CylinderGeometry(0.252, 0.252, 0.62, 48);
      const overcapMesh = new THREE.Mesh(overcapGeo, overcapMaterial);
      overcapMesh.position.y = 0;
      overcapGroup.add(overcapMesh);

      const capDomeGeo = new THREE.SphereGeometry(0.252, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
      const capDomeMesh = new THREE.Mesh(capDomeGeo, overcapMaterial);
      capDomeMesh.position.y = 0.31;
      overcapGroup.add(capDomeMesh);

      // 11. 3D Spray Mist Particles
      const particleCount = 75;
      const particleGeo = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const velocities = [];
      const initialPositions = [];

      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = 0;
        positions[i * 3 + 1] = 0.97;
        positions[i * 3 + 2] = 0.18;
        initialPositions.push(0, 0.97, 0.18);
        velocities.push({
          x: (Math.random() - 0.5) * 0.045,
          y: (Math.random() * 0.035) + 0.005,
          z: (Math.random() * 0.09) + 0.05,
          life: 0,
          maxLife: 0.8 + Math.random() * 0.4
        });
      }
      particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const particleMat = new THREE.PointsMaterial({
        color: new THREE.Color('#FFFFFF'),
        size: 0.055,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      const particleSystem = new THREE.Points(particleGeo, particleMat);
      modelGroup.add(particleSystem);
      particlesRef.current = { system: particleSystem, velocities, initialPositions, geo: particleGeo, mat: particleMat };

    } else if (isMask) {
      // --- NATURAL GLOW MASK (Pure Porcelain Tub with Authentic Branded Lid & Body Labels) ---
      const porcelainMaterial = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#FFFFFF'),
        roughness: 0.22,
        metalness: 0.04,
        clearcoat: 0.6,
        clearcoatRoughness: 0.15
      });

      const goldTrimMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#D4AF37'),
        metalness: 0.95,
        roughness: 0.18
      });

      const clayMaskMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#FBE7E0'),
        roughness: 0.45,
        metalness: 0.02
      });

      const textureLoader = new THREE.TextureLoader();
      lidTexture = textureLoader.load('/assets/natural_glow_mask_lid_texture.png');
      lidTexture.colorSpace = THREE.SRGBColorSpace;
      lidTexture.center.set(0.5, 0.5);
      lidTexture.rotation = Math.PI;

      bodyTexture = textureLoader.load('/assets/natural_glow_mask_body_texture.png');
      bodyTexture.colorSpace = THREE.SRGBColorSpace;

      const tubSideMaterial = new THREE.MeshStandardMaterial({
        map: bodyTexture,
        roughness: 0.22,
        metalness: 0.04
      });
      const tubMaterials = [tubSideMaterial, porcelainMaterial, porcelainMaterial];
      const tubGeo = new THREE.CylinderGeometry(1.08, 1.05, 0.88, 64);
      const tubMesh = new THREE.Mesh(tubGeo, tubMaterials);
      tubMesh.position.y = -0.22;
      tubMesh.rotation.y = Math.PI;
      modelGroup.add(tubMesh);

      const creamGeo = new THREE.CylinderGeometry(0.98, 0.96, 0.76, 48);
      const creamMesh = new THREE.Mesh(creamGeo, clayMaskMaterial);
      creamMesh.position.y = -0.21;
      modelGroup.add(creamMesh);

      const swirlGeo = new THREE.SphereGeometry(0.96, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.2);
      const swirlMesh = new THREE.Mesh(swirlGeo, clayMaskMaterial);
      swirlMesh.position.y = 0.16;
      swirlMesh.rotation.x = Math.PI;
      modelGroup.add(swirlMesh);

      const ringGeo = new THREE.TorusGeometry(1.06, 0.016, 16, 64);
      const ringMesh = new THREE.Mesh(ringGeo, goldTrimMaterial);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.y = 0.23;
      modelGroup.add(ringMesh);

      const capGroup = new THREE.Group();
      modelGroup.add(capGroup);
      capMeshRef.current = capGroup;

      const lidTopMaterial = new THREE.MeshStandardMaterial({
        map: lidTexture,
        roughness: 0.22,
        metalness: 0.04
      });

      const lidGeo = new THREE.CylinderGeometry(1.09, 1.09, 0.38, 64);
      const lidMaterials = [porcelainMaterial, lidTopMaterial, porcelainMaterial];
      const lidMesh = new THREE.Mesh(lidGeo, lidMaterials);
      lidMesh.position.y = 0.44;
      capGroup.add(lidMesh);

      const lidRingGeo = new THREE.TorusGeometry(1.09, 0.014, 16, 64);
      const lidRingMesh = new THREE.Mesh(lidRingGeo, goldTrimMaterial);
      lidRingMesh.rotation.x = Math.PI / 2;
      lidRingMesh.position.y = 0.63;
      capGroup.add(lidRingMesh);

    } else if (isHandFeetCream) {
      // --- AYAANA'S HAND AND FEET WHITENING CREAM (Shallow Blush-Pink Jar with Authentic Circular Lid Sticker) ---
      const pinkPorcelainMaterial = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#F7D0DC'),
        roughness: 0.18,
        metalness: 0.04,
        clearcoat: 0.85,
        clearcoatRoughness: 0.12
      });

      const whiteThreadMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#FFFFFF'),
        roughness: 0.28,
        metalness: 0.02
      });

      const roseGoldTrimMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#E2A2B0'),
        metalness: 0.92,
        roughness: 0.18
      });

      const whiteningCreamMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#FFFDFB'),
        roughness: 0.38,
        metalness: 0.02
      });

      const textureLoader = new THREE.TextureLoader();
      lidTexture = textureLoader.load('/assets/hand_cream_sticker.png');
      lidTexture.colorSpace = THREE.SRGBColorSpace;

      const stickerMaterial = new THREE.MeshStandardMaterial({
        map: lidTexture,
        roughness: 0.22,
        metalness: 0.02,
        transparent: true
      });

      // 1. Blush Pink Shallow Jar Body
      const tubGeo = new THREE.CylinderGeometry(1.08, 1.05, 0.58, 64);
      const tubMesh = new THREE.Mesh(tubGeo, pinkPorcelainMaterial);
      tubMesh.position.y = -0.16;
      modelGroup.add(tubMesh);

      const tubBottomGeo = new THREE.CylinderGeometry(1.05, 0.98, 0.08, 64);
      const tubBottomMesh = new THREE.Mesh(tubBottomGeo, pinkPorcelainMaterial);
      tubBottomMesh.position.y = -0.49;
      modelGroup.add(tubBottomMesh);

      // 2. White Screw Neck / Threads
      const neckGeo = new THREE.CylinderGeometry(1.035, 1.035, 0.12, 64);
      const neckMesh = new THREE.Mesh(neckGeo, whiteThreadMaterial);
      neckMesh.position.y = 0.16;
      modelGroup.add(neckMesh);

      // 3. Luxurious Whipped Ivory Cream Inside
      const creamGeo = new THREE.CylinderGeometry(0.98, 0.95, 0.44, 48);
      const creamMesh = new THREE.Mesh(creamGeo, whiteningCreamMaterial);
      creamMesh.position.y = -0.12;
      modelGroup.add(creamMesh);

      // Cream Swirl Peak
      const swirlGeo = new THREE.SphereGeometry(0.95, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.2);
      const swirlMesh = new THREE.Mesh(swirlGeo, whiteningCreamMaterial);
      swirlMesh.position.y = 0.12;
      swirlMesh.rotation.x = Math.PI;
      modelGroup.add(swirlMesh);

      // 4. Rose Gold Trim Accent Ring
      const ringGeo = new THREE.TorusGeometry(1.065, 0.016, 16, 64);
      const ringMesh = new THREE.Mesh(ringGeo, roseGoldTrimMaterial);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.y = 0.13;
      modelGroup.add(ringMesh);

      // 5. Cap / Lid Group (Interactive Smooth Opening)
      const capGroup = new THREE.Group();
      modelGroup.add(capGroup);
      capMeshRef.current = capGroup;

      const lidGeo = new THREE.CylinderGeometry(1.09, 1.09, 0.36, 64);
      const lidMesh = new THREE.Mesh(lidGeo, pinkPorcelainMaterial);
      lidMesh.position.y = 0.36;
      capGroup.add(lidMesh);

      const capBevelGeo = new THREE.CylinderGeometry(1.06, 1.09, 0.04, 64);
      const capBevelMesh = new THREE.Mesh(capBevelGeo, pinkPorcelainMaterial);
      capBevelMesh.position.y = 0.54;
      capGroup.add(capBevelMesh);

      // Top Circular Label Sticker
      const stickerGeo = new THREE.CircleGeometry(1.03, 64);
      const stickerMesh = new THREE.Mesh(stickerGeo, stickerMaterial);
      stickerMesh.rotation.x = -Math.PI / 2;
      stickerMesh.position.y = 0.562;
      capGroup.add(stickerMesh);

    } else if (isFaceWhiteningCream) {
      // --- AYANA'S FACE WHITENING CREAM (Shallow Blush-Pink Jar with Authentic Circular Lid Sticker) ---
      const pinkPorcelainMaterial = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#F7D0DC'),
        roughness: 0.18,
        metalness: 0.04,
        clearcoat: 0.85,
        clearcoatRoughness: 0.12
      });

      const whiteThreadMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#FFFFFF'),
        roughness: 0.28,
        metalness: 0.02
      });

      const roseGoldTrimMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#E2A2B0'),
        metalness: 0.92,
        roughness: 0.18
      });

      const whiteningCreamMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#FFFDFB'),
        roughness: 0.38,
        metalness: 0.02
      });

      const textureLoader = new THREE.TextureLoader();
      lidTexture = textureLoader.load('/assets/face_whitening_cream_lid_texture.png');
      lidTexture.colorSpace = THREE.SRGBColorSpace;

      const stickerMaterial = new THREE.MeshStandardMaterial({
        map: lidTexture,
        roughness: 0.22,
        metalness: 0.02,
        transparent: true
      });

      // 1. Blush Pink Shallow Jar Tub Body
      const tubGeo = new THREE.CylinderGeometry(1.08, 1.05, 0.58, 64);
      const tubMesh = new THREE.Mesh(tubGeo, pinkPorcelainMaterial);
      tubMesh.position.y = -0.16;
      modelGroup.add(tubMesh);

      const tubBottomGeo = new THREE.CylinderGeometry(1.05, 0.98, 0.08, 64);
      const tubBottomMesh = new THREE.Mesh(tubBottomGeo, pinkPorcelainMaterial);
      tubBottomMesh.position.y = -0.49;
      modelGroup.add(tubBottomMesh);

      // 2. White Screw Neck / Threads
      const neckGeo = new THREE.CylinderGeometry(1.035, 1.035, 0.12, 64);
      const neckMesh = new THREE.Mesh(neckGeo, whiteThreadMaterial);
      neckMesh.position.y = 0.16;
      modelGroup.add(neckMesh);

      // 3. Luxurious Whipped Ivory Cream Inside
      const creamGeo = new THREE.CylinderGeometry(0.98, 0.95, 0.44, 48);
      const creamMesh = new THREE.Mesh(creamGeo, whiteningCreamMaterial);
      creamMesh.position.y = -0.12;
      modelGroup.add(creamMesh);

      // Cream Swirl Peak
      const swirlGeo = new THREE.SphereGeometry(0.95, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.2);
      const swirlMesh = new THREE.Mesh(swirlGeo, whiteningCreamMaterial);
      swirlMesh.position.y = 0.12;
      swirlMesh.rotation.x = Math.PI;
      modelGroup.add(swirlMesh);

      // 4. Rose Gold Trim Accent Ring
      const ringGeo = new THREE.TorusGeometry(1.065, 0.016, 16, 64);
      const ringMesh = new THREE.Mesh(ringGeo, roseGoldTrimMaterial);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.y = 0.13;
      modelGroup.add(ringMesh);

      // 5. Cap / Lid Group (Interactive Smooth Opening)
      const capGroup = new THREE.Group();
      modelGroup.add(capGroup);
      capMeshRef.current = capGroup;

      const lidGeo = new THREE.CylinderGeometry(1.09, 1.09, 0.36, 64);
      const lidMesh = new THREE.Mesh(lidGeo, pinkPorcelainMaterial);
      lidMesh.position.y = 0.36;
      capGroup.add(lidMesh);

      const capBevelGeo = new THREE.CylinderGeometry(1.06, 1.09, 0.04, 64);
      const capBevelMesh = new THREE.Mesh(capBevelGeo, pinkPorcelainMaterial);
      capBevelMesh.position.y = 0.54;
      capGroup.add(capBevelMesh);

      // Top Circular Label Sticker (FACE WHITENING CREAM)
      const stickerGeo = new THREE.CircleGeometry(1.03, 64);
      const stickerMesh = new THREE.Mesh(stickerGeo, stickerMaterial);
      stickerMesh.rotation.x = -Math.PI / 2;
      stickerMesh.position.y = 0.562;
      capGroup.add(stickerMesh);

    } else {
      // --- LUXURY GLASS JAR (For Radiance Skin Repair Creams) ---
      const capMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#E6A895'),
        metalness: 0.9,
        roughness: 0.2
      });

      const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#FCFAF6'),
        metalness: 0.05,
        roughness: 0.1,
        transmission: 0.85,
        thickness: 1.2,
        ior: 1.52,
        transparent: true,
        opacity: 0.9
      });

      const creamMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#FFFDF9'),
        roughness: 0.4,
        metalness: 0.02
      });

      const goldRingMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#ECC79B'),
        metalness: 0.95,
        roughness: 0.15
      });

      const glassGeo = new THREE.CylinderGeometry(0.92, 0.9, 0.85, 48);
      const glassMesh = new THREE.Mesh(glassGeo, glassMaterial);
      glassMesh.position.y = -0.2;
      modelGroup.add(glassMesh);

      const creamGeo = new THREE.CylinderGeometry(0.84, 0.82, 0.74, 36);
      const creamMesh = new THREE.Mesh(creamGeo, creamMaterial);
      creamMesh.position.y = -0.21;
      modelGroup.add(creamMesh);

      const ringGeo = new THREE.TorusGeometry(0.9, 0.02, 16, 48);
      const ringMesh = new THREE.Mesh(ringGeo, goldRingMaterial);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.y = 0.23;
      modelGroup.add(ringMesh);

      const capGroup = new THREE.Group();
      modelGroup.add(capGroup);
      capMeshRef.current = capGroup;

      const capGeo = new THREE.CylinderGeometry(0.93, 0.93, 0.46, 48);
      const capMesh = new THREE.Mesh(capGeo, capMaterial);
      capMesh.position.y = 0.48;
      capGroup.add(capMesh);

      const capBevelGeo = new THREE.CylinderGeometry(0.91, 0.93, 0.04, 48);
      const capBevelMesh = new THREE.Mesh(capBevelGeo, capMaterial);
      capBevelMesh.position.y = 0.72;
      capGroup.add(capBevelMesh);
    }

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xfff8f2, 1.9);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(3.5, 4.5, 3.5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xf7d9cc, 1.8);
    fillLight.position.set(-3.5, 2.5, -2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.4);
    rimLight.position.set(0, -2, 3);
    scene.add(rimLight);

    // Initial angle
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let targetRotY = isHandFeetCream ? 0.22 : 0; // Front label facing forward
    let targetRotX = isToner ? 0.04 : ((isMask || isFaceWhiteningCream || isHandFeetCream) ? 0.36 : 0.15);

    const onMouseDown = (e) => {
      isDragging = true;
      const touch = e.touches && e.touches[0];
      prevMouse = {
        x: touch ? touch.clientX : (e.clientX ?? 0),
        y: touch ? touch.clientY : (e.clientY ?? 0)
      };
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const touch = e.touches && e.touches[0];
      const clientX = touch ? touch.clientX : (e.clientX ?? 0);
      const clientY = touch ? touch.clientY : (e.clientY ?? 0);
      const dx = clientX - prevMouse.x;
      const dy = clientY - prevMouse.y;
      targetRotY += dx * 0.015;
      targetRotX += dy * 0.01;
      targetRotX = Math.max(-0.4, Math.min(0.85, targetRotX));
      prevMouse = { x: clientX, y: clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    dom.addEventListener('touchstart', onMouseDown, { passive: true });
    window.addEventListener('touchmove', onMouseMove, { passive: true });
    window.addEventListener('touchend', onMouseUp);

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (!isDragging && !isSprayingRef.current) {
        targetRotY += 0.0022; // Gentle luxury showcase rotation
      }

      modelGroup.rotation.y += (targetRotY - modelGroup.rotation.y) * 0.08;
      modelGroup.rotation.x += (targetRotX - modelGroup.rotation.x) * 0.08;

      if (isToner) {
        // Toner spray animation
        if (isSprayingRef.current) {
          // Depress actuator button
          if (sprayActuatorRef.current) {
            sprayActuatorRef.current.position.y += (0.87 - sprayActuatorRef.current.position.y) * 0.28;
          }
          // Remove protective cap smoothly
          if (sprayCapRef.current) {
            sprayCapRef.current.position.y += (1.95 - sprayCapRef.current.position.y) * 0.18;
          }
          if (overcapMaterialRef.current) {
            overcapMaterialRef.current.opacity = Math.max(0.1, overcapMaterialRef.current.opacity - 0.04);
          }
          // Emit mist particles
          if (particlesRef.current) {
            const { geo, mat, velocities } = particlesRef.current;
            mat.opacity = Math.min(0.9, mat.opacity + 0.12);
            const pos = geo.attributes.position.array;
            for (let i = 0; i < velocities.length; i++) {
              const v = velocities[i];
              pos[i * 3] += v.x;
              pos[i * 3 + 1] += v.y;
              pos[i * 3 + 2] += v.z;
              v.y -= 0.0006;
            }
            geo.attributes.position.needsUpdate = true;
          }
        } else {
          // Release actuator button
          if (sprayActuatorRef.current) {
            sprayActuatorRef.current.position.y += (0.95 - sprayActuatorRef.current.position.y) * 0.15;
          }
          // Cap position
          if (sprayCapRef.current) {
            const targetCapY = isCapOpenRef.current ? 1.75 : 1.05;
            sprayCapRef.current.position.y += (targetCapY - sprayCapRef.current.position.y) * 0.12;
          }
          if (overcapMaterialRef.current) {
            const targetCapOpacity = isCapOpenRef.current ? 0.25 : 0.65;
            overcapMaterialRef.current.opacity += (targetCapOpacity - overcapMaterialRef.current.opacity) * 0.12;
          }
          // Fade mist particles & reset position
          if (particlesRef.current) {
            const { geo, mat, velocities, initialPositions } = particlesRef.current;
            mat.opacity = Math.max(0, mat.opacity - 0.06);
            if (mat.opacity <= 0.02) {
              const pos = geo.attributes.position.array;
              for (let i = 0; i < velocities.length; i++) {
                pos[i * 3] = initialPositions[i * 3];
                pos[i * 3 + 1] = initialPositions[i * 3 + 1];
                pos[i * 3 + 2] = initialPositions[i * 3 + 2];
              }
              geo.attributes.position.needsUpdate = true;
            }
          }
        }
      } else {
        // Smooth lid open/closed for Cream / Mask Jars
        if (capMeshRef.current) {
          const targetCapY = isCapOpenRef.current ? 0.95 : 0;
          const targetCapRotZ = isCapOpenRef.current ? 0.35 : 0;
          const targetCapRotX = isCapOpenRef.current ? -0.12 : 0;
          capMeshRef.current.position.y += (targetCapY - capMeshRef.current.position.y) * 0.1;
          capMeshRef.current.rotation.z += (targetCapRotZ - capMeshRef.current.rotation.z) * 0.1;
          capMeshRef.current.rotation.x += (targetCapRotX - capMeshRef.current.rotation.x) * 0.1;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    const onResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('touchstart', onMouseDown);
      window.removeEventListener('touchmove', onMouseMove);
      window.removeEventListener('touchend', onMouseUp);
      if (lidTexture) lidTexture.dispose();
      if (bodyTexture) bodyTexture.dispose();
      if (tonerLabelTexture) tonerLabelTexture.dispose();
      if (renderer) renderer.dispose();
      if (dom && container && container.contains(dom)) container.removeChild(dom);
    };
  }, [productName, isToner, isMask, isFaceWhiteningCream, isHandFeetCream]);

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '100%' }} className={className}>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          minHeight: 'clamp(280px, 36vw, 350px)',
          cursor: 'grab',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          touchAction: 'pan-y'
        }}
      />

      {/* Toner Essence Shade Switcher (Only on Toner 3D View) */}
      {isToner && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '9999px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(18, 18, 18, 0.08)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
            fontSize: '11px',
            fontWeight: 700,
            zIndex: 6
          }}
        >
          <span style={{ color: '#736C65', marginRight: '2px' }}>Essence:</span>
          <button
            onClick={() => setTonerShade('rose')}
            title="Rose Botanical Glow"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '9999px',
              border: 'none',
              backgroundColor: tonerShade === 'rose' ? '#FEE2E8' : 'transparent',
              color: tonerShade === 'rose' ? '#C75678' : '#6E675F',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '10.5px'
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F4B2C0', display: 'inline-block' }} />
            Rose
          </button>
          <button
            onClick={() => setTonerShade('amber')}
            title="Herbal Infusion"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '9999px',
              border: 'none',
              backgroundColor: tonerShade === 'amber' ? '#FEF3D6' : 'transparent',
              color: tonerShade === 'amber' ? '#97611A' : '#6E675F',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '10.5px'
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#C98D42', display: 'inline-block' }} />
            Herbal
          </button>
          <button
            onClick={() => setTonerShade('clear')}
            title="Pure Dew Clarifying"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '9999px',
              border: 'none',
              backgroundColor: tonerShade === 'clear' ? '#E0F2FE' : 'transparent',
              color: tonerShade === 'clear' ? '#0369A1' : '#6E675F',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '10.5px'
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#A5F3FC', display: 'inline-block' }} />
            Clear
          </button>
        </div>
      )}

      {/* 3D Interactive Control Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '5px 12px',
          maxWidth: 'calc(100% - 16px)',
          overflowX: 'auto',
          borderRadius: '9999px',
          backgroundColor: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(18, 18, 18, 0.08)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          fontSize: '11px',
          color: '#2E2B28',
          zIndex: 5,
          scrollbarWidth: 'none'
        }}
      >
        {isToner ? (
          <>
            <button
              onClick={handleSpray}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 14px',
                borderRadius: '9999px',
                backgroundColor: isSpraying ? '#C75678' : '#FDFBF7',
                color: isSpraying ? '#FFFFFF' : '#121212',
                border: '1px solid rgba(226, 130, 159, 0.4)',
                fontWeight: 700,
                fontSize: '11px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: isSpraying ? '0 2px 10px rgba(199, 86, 120, 0.35)' : 'none'
              }}
            >
              <Wind style={{ width: '13px', height: '13px', color: isSpraying ? '#FFFFFF' : '#C75678' }} />
              <span>{isSpraying ? "Spraying Mist..." : "Spray Mist"}</span>
            </button>
            <button
              onClick={() => setIsCapOpen(!isCapOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '5px 10px',
                borderRadius: '9999px',
                backgroundColor: 'transparent',
                border: '1px solid rgba(18, 18, 18, 0.1)',
                fontWeight: 600,
                fontSize: '10.5px',
                color: '#554F48',
                cursor: 'pointer'
              }}
            >
              <span>{isCapOpen ? "Replace Cap" : "Remove Cap"}</span>
            </button>
          </>
        ) : (
          <button
            id="toggle-cream-lid-btn"
            onClick={() => setIsCapOpen(!isCapOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: '9999px',
              backgroundColor: '#FDFBF7',
              border: '1px solid rgba(226, 130, 159, 0.35)',
              fontWeight: 700,
              fontSize: '11px',
              color: '#121212',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            <Sparkles style={{ width: '13px', height: '13px', color: '#C75678' }} />
            <span>{isCapOpen ? "Close Lid" : "Open Lid (Inspect Cream)"}</span>
          </button>
        )}

        <span style={{ color: 'rgba(18, 18, 18, 0.2)' }}>|</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#736C65' }}>
          <RotateCw style={{ width: '12px', height: '12px', color: '#9B948C' }} />
          <span>360° Drag</span>
        </div>
      </div>
    </div>
  );
}
