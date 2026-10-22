import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function ThreeHeroJar({ className = "" }) {
  const containerRef = useRef(null);
  const [isInteracting, setIsInteracting] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Dimensions
    let width = container.clientWidth || 400;
    let height = container.clientHeight || 450;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.72, 3.8);

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
      renderer.toneMappingExposure = 1.15;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(renderer.domElement);
    } catch (err) {
      console.warn("ThreeHeroJar WebGL not available:", err);
      return;
    }

    // Root Group for rotations
    const jarGroup = new THREE.Group();
    scene.add(jarGroup);

    // Materials & Textures
    const textureLoader = new THREE.TextureLoader();
    const stickerTexture = textureLoader.load('/assets/hand_cream_sticker.png');
    stickerTexture.colorSpace = THREE.SRGBColorSpace;

    // 1. Blush Pink Porcelain / Luxury Resin (matching authentic cosmetic jar)
    const pinkPorcelainMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#F7D0DC'),
      roughness: 0.18,
      metalness: 0.04,
      clearcoat: 0.85,
      clearcoatRoughness: 0.12
    });

    // 2. Pure White Thread Neck
    const whiteThreadMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FFFFFF'),
      roughness: 0.28,
      metalness: 0.02
    });

    // 3. Luxurious Whipped Ivory Whitening Cream Inside
    const creamMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FFFDFB'),
      roughness: 0.38,
      metalness: 0.02
    });

    // 4. Subtle Rose Gold Trim Accent Ring
    const roseGoldTrimMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#E2A2B0'),
      metalness: 0.92,
      roughness: 0.18
    });

    // 5. Authentic Hand & Feet Circular Label Sticker
    const stickerMaterial = new THREE.MeshStandardMaterial({
      map: stickerTexture,
      transparent: true,
      roughness: 0.22,
      metalness: 0.02
    });

    // Geometry Assembly
    // 1. Blush Pink Jar Body (Shallow luxury cosmetic tub)
    const tubGeo = new THREE.CylinderGeometry(1.08, 1.05, 0.58, 64);
    const tubMesh = new THREE.Mesh(tubGeo, pinkPorcelainMaterial);
    tubMesh.position.y = -0.16;
    tubMesh.castShadow = true;
    tubMesh.receiveShadow = true;
    jarGroup.add(tubMesh);

    // Rounded bottom edge
    const tubBottomGeo = new THREE.CylinderGeometry(1.05, 0.98, 0.08, 64);
    const tubBottomMesh = new THREE.Mesh(tubBottomGeo, pinkPorcelainMaterial);
    tubBottomMesh.position.y = -0.49;
    jarGroup.add(tubBottomMesh);

    // 2. Inner Whipped Cream
    const creamGeo = new THREE.CylinderGeometry(0.98, 0.95, 0.44, 48);
    const creamMesh = new THREE.Mesh(creamGeo, creamMaterial);
    creamMesh.position.y = -0.12;
    jarGroup.add(creamMesh);

    // 3. Screw Neck / Inner Threads
    const neckGeo = new THREE.CylinderGeometry(1.035, 1.035, 0.12, 64);
    const neckMesh = new THREE.Mesh(neckGeo, whiteThreadMaterial);
    neckMesh.position.y = 0.16;
    jarGroup.add(neckMesh);

    // 4. Rose Gold Trim Ring
    const ringGeo = new THREE.TorusGeometry(1.065, 0.016, 16, 64);
    const ringMesh = new THREE.Mesh(ringGeo, roseGoldTrimMaterial);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = 0.13;
    jarGroup.add(ringMesh);

    // 5. Blush Pink Screw Cap / Lid
    const capGeo = new THREE.CylinderGeometry(1.09, 1.09, 0.36, 64);
    const capMesh = new THREE.Mesh(capGeo, pinkPorcelainMaterial);
    capMesh.position.y = 0.36;
    capMesh.castShadow = true;
    jarGroup.add(capMesh);

    // Cap Top Bevel Ring
    const capBevelGeo = new THREE.CylinderGeometry(1.06, 1.09, 0.04, 64);
    const capBevelMesh = new THREE.Mesh(capBevelGeo, pinkPorcelainMaterial);
    capBevelMesh.position.y = 0.54;
    jarGroup.add(capBevelMesh);

    // 6. Authentic Circular Branding Sticker on Top of Lid
    const stickerGeo = new THREE.CircleGeometry(1.03, 64);
    const stickerMesh = new THREE.Mesh(stickerGeo, stickerMaterial);
    stickerMesh.rotation.x = -Math.PI / 2;
    stickerMesh.position.y = 0.562;
    jarGroup.add(stickerMesh);

    // Travertine Pedestal underneath
    const pedestalGeo = new THREE.CylinderGeometry(1.4, 1.45, 0.15, 48);
    const pedestalMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#EFEAE1'),
      roughness: 0.85,
      metalness: 0.02
    });
    const pedestalMesh = new THREE.Mesh(pedestalGeo, pedestalMaterial);
    pedestalMesh.position.y = -0.68;
    pedestalMesh.receiveShadow = true;
    scene.add(pedestalMesh);

    // Ambient Contact Shadow
    const shadowGeo = new THREE.PlaneGeometry(2.8, 2.8);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d');
    const grad = sCtx.createRadialGradient(64, 64, 10, 64, 64, 60);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.35)');
    grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.12)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 128, 128);

    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowMaterial = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      depthWrite: false
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMaterial);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -0.76;
    scene.add(shadowMesh);

    // Radiance Floating Particles
    const particleCount = 35;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = [];

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.1 + Math.random() * 1.3;
      const y = -0.5 + Math.random() * 1.8;
      particlePositions[i * 3] = Math.cos(angle) * radius;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = Math.sin(angle) * radius;
      particleSpeeds.push({
        angle,
        radius,
        speed: 0.005 + Math.random() * 0.008,
        yBase: y,
        yFloatSpeed: 0.002 + Math.random() * 0.003
      });
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    // Particle Texture
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 32;
    pCanvas.height = 32;
    const pCtx = pCanvas.getContext('2d');
    const pGrad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
    pGrad.addColorStop(0, 'rgba(238, 175, 150, 1)');
    pGrad.addColorStop(0.4, 'rgba(226, 130, 159, 0.7)');
    pGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    pCtx.fillStyle = pGrad;
    pCtx.fillRect(0, 0, 32, 32);

    const pTexture = new THREE.CanvasTexture(pCanvas);
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.09,
      map: pTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const particles = new THREE.Points(particleGeo, particleMaterial);
    scene.add(particles);

    // Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xfff6ed, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(4, 5, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xf2b5a0, 1.8);
    rimLight.position.set(-3, 3, -3);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0xffecd9, 1.2, 8);
    fillLight.position.set(0, -1, 3);
    scene.add(fillLight);

    // Initial orientation: angled slightly forward so top circular branding is clearly visible
    jarGroup.rotation.x = 0.32;
    jarGroup.rotation.y = 0.25;

    // Mouse / Touch Interactivity
    let targetRotY = 0.25;
    let targetRotX = 0.32;
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };

    const handlePointerDown = (e) => {
      isDragging = true;
      setIsInteracting(true);
      prevMousePos = {
        x: e.clientX || (e.touches && e.touches[0].clientX) || 0,
        y: e.clientY || (e.touches && e.touches[0].clientY) || 0
      };
    };

    const handlePointerMove = (e) => {
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

      if (isDragging) {
        const deltaX = clientX - prevMousePos.x;
        const deltaY = clientY - prevMousePos.y;
        targetRotY += deltaX * 0.012;
        targetRotX += deltaY * 0.008;
        // Clamp vertical tilt
        targetRotX = Math.max(-0.25, Math.min(0.4, targetRotX));
        prevMousePos = { x: clientX, y: clientY };
      } else {
        // Subtle tilt following pointer when hovering
        const rect = container.getBoundingClientRect();
        const normX = ((clientX - rect.left) / rect.width) * 2 - 1;
        const normY = -(((clientY - rect.top) / rect.height) * 2 - 1);
        if (normX >= -1.2 && normX <= 1.2 && normY >= -1.2 && normY <= 1.2) {
          targetRotY = 0.45 + normX * 0.45;
          targetRotX = 0.12 - normY * 0.25;
        }
      }
    };

    const handlePointerUp = () => {
      isDragging = false;
      setIsInteracting(false);
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);

    domElem.addEventListener('touchstart', handlePointerDown, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth damping rotation
      if (!isDragging) {
        targetRotY += 0.003; // continuous subtle rotation
      }
      jarGroup.rotation.y += (targetRotY - jarGroup.rotation.y) * 0.06;
      jarGroup.rotation.x += (targetRotX - jarGroup.rotation.x) * 0.06;

      // Gentle floating sine wave
      jarGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.04;

      // Orbiting radiant particles
      const positions = particleGeo.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const item = particleSpeeds[i];
        item.angle += item.speed;
        positions[i * 3] = Math.cos(item.angle) * item.radius;
        positions[i * 3 + 1] = item.yBase + Math.sin(elapsedTime * 2 + i) * 0.15;
        positions[i * 3 + 2] = Math.sin(item.angle) * item.radius;
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      domElem.removeEventListener('mousedown', handlePointerDown);
      if (domElem) {
        domElem.removeEventListener('touchstart', handlePointerDown);
      }
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);

      // Clean up WebGL resources
      if (renderer) renderer.dispose();
      tubGeo?.dispose();
      tubBottomGeo?.dispose();
      creamGeo?.dispose();
      neckGeo?.dispose();
      ringGeo?.dispose();
      capGeo?.dispose();
      capBevelGeo?.dispose();
      stickerGeo?.dispose();
      pedestalGeo?.dispose();
      shadowGeo?.dispose();
      particleGeo?.dispose();
      pinkPorcelainMaterial?.dispose();
      whiteThreadMaterial?.dispose();
      creamMaterial?.dispose();
      roseGoldTrimMaterial?.dispose();
      stickerMaterial?.dispose();
      pedestalMaterial?.dispose();
      shadowMaterial?.dispose();
      particleMaterial?.dispose();
      shadowTexture?.dispose();
      stickerTexture?.dispose();
      pTexture?.dispose();
      if (domElem && container && container.contains(domElem)) {
        container.removeChild(domElem);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: 'clamp(280px, 38vw, 420px)',
        minHeight: '260px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: isInteracting ? 'grabbing' : 'grab',
        touchAction: 'pan-y'
      }}
      className={className}
    >
      {/* Interactive Drag Hint */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '9999px',
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(18, 18, 18, 0.08)',
          fontSize: '11px',
          fontWeight: 700,
          color: '#736C65',
          pointerEvents: 'none',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          transition: 'opacity 0.3s'
        }}
      >
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#E2829F', display: 'inline-block' }}></span>
        <span>Drag to rotate 3D jar</span>
      </div>
    </div>
  );
}
