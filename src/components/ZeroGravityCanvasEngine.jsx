import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, Wind, RotateCw } from 'lucide-react';

export default function ZeroGravityCanvasEngine({
  accentColor = '#E2829F',
  onInteractChange
}) {
  const containerRef = useRef(null);
  const accentColorRef = useRef(accentColor);
  const onInteractChangeRef = useRef(onInteractChange);

  useEffect(() => {
    accentColorRef.current = accentColor;
    onInteractChangeRef.current = onInteractChange;
  }, [accentColor, onInteractChange]);

  const [particleSpeedMode, setParticleSpeedMode] = useState('gentle'); // 'gentle' | 'cosmic'
  const particleSpeedRef = useRef(1.0);
  const pulseTriggerRef = useRef(0);

  useEffect(() => {
    particleSpeedRef.current = particleSpeedMode === 'cosmic' ? 2.2 : 1.0;
  }, [particleSpeedMode]);

  const triggerPulse = (e) => {
    if (e) e.stopPropagation();
    pulseTriggerRef.current = performance.now();
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || 1200;
    let height = container.clientHeight || 675;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 5.0);

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
      renderer.toneMappingExposure = 1.2;
      container.appendChild(renderer.domElement);
    } catch (err) {
      console.warn("ZeroGravityCanvasEngine WebGL not available:", err);
      return;
    }

    // 2. Lighting setup tailored for floating glass droplets & rose petals
    const ambientLight = new THREE.AmbientLight(0xfff0f5, 1.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(3, 4, 3.5);
    scene.add(keyLight);

    // Rose gold rim light from top-left
    const rimLight = new THREE.DirectionalLight(0xe2829f, 3.5);
    rimLight.position.set(-4, 3, -2);
    scene.add(rimLight);

    // Golden specular rim light from bottom-right
    const goldRimLight = new THREE.DirectionalLight(0xffd700, 2.2);
    goldRimLight.position.set(3.5, -2.5, -2);
    scene.add(goldRimLight);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 3. REAL 3D ZERO-GRAVITY PARTICLES
    // A. 3D Curved Rose Petals
    const petalShape = new THREE.Shape();
    petalShape.moveTo(0, -0.35);
    petalShape.bezierCurveTo(0.3, -0.18, 0.42, 0.28, 0, 0.55);
    petalShape.bezierCurveTo(-0.42, 0.28, -0.3, -0.18, 0, -0.35);

    const petalGeo = new THREE.ShapeGeometry(petalShape, 16);
    // Add organic 3D curvature along Z
    const petalPos = petalGeo.attributes.position;
    for (let i = 0; i < petalPos.count; i++) {
      const px = petalPos.getX(i);
      const py = petalPos.getY(i);
      petalPos.setZ(i, (1 - Math.cos(px * 2.8)) * 0.13 - Math.sin((py + 0.35) * 1.8) * 0.08);
    }
    petalGeo.computeVertexNormals();

    const petalMaterial1 = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#F4A6BA'),
      roughness: 0.42,
      metalness: 0.04,
      side: THREE.DoubleSide
    });

    const petalMaterial2 = new THREE.MeshStandardMaterial({
      color: new THREE.Color(accentColorRef.current || '#ECC1CC'),
      roughness: 0.45,
      metalness: 0.02,
      side: THREE.DoubleSide
    });

    const petalMaterial3 = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#F9CBD5'),
      roughness: 0.48,
      metalness: 0.03,
      side: THREE.DoubleSide
    });

    const petalsCount = 24;
    const petalsData = [];
    const petalsGroup = new THREE.Group();
    rootGroup.add(petalsGroup);

    for (let i = 0; i < petalsCount; i++) {
      const mat = i % 3 === 0 ? petalMaterial1 : i % 3 === 1 ? petalMaterial2 : petalMaterial3;
      const mesh = new THREE.Mesh(petalGeo, mat);

      // Distribute in a wide 16:9 ellipse around the center product
      const angle = (i / petalsCount) * Math.PI * 2 + Math.random() * 0.4;
      const rx = 2.4 + Math.random() * 1.8;
      const ry = 1.3 + Math.random() * 1.2;
      const rz = (Math.random() - 0.5) * 2.2;

      const x = rx * Math.cos(angle);
      const y = ry * Math.sin(angle);
      const z = rz;

      mesh.position.set(x, y, z);
      const scale = 0.32 + Math.random() * 0.28;
      mesh.scale.set(scale, scale, scale);

      mesh.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );

      petalsGroup.add(mesh);

      petalsData.push({
        mesh,
        baseX: x,
        baseY: y,
        baseZ: z,
        angle,
        radiusX: rx,
        radiusY: ry,
        orbitSpeed: (0.08 + Math.random() * 0.12) * (Math.random() > 0.5 ? 1 : -1),
        rotSpeedX: (Math.random() - 0.5) * 0.016,
        rotSpeedY: (Math.random() - 0.5) * 0.022,
        rotSpeedZ: (Math.random() - 0.5) * 0.018,
        floatFreq: 0.7 + Math.random() * 0.6,
        floatAmp: 0.14 + Math.random() * 0.1,
        phase: Math.random() * Math.PI * 2,
        currentImpulse: new THREE.Vector3(0, 0, 0)
      });
    }

    // B. 3D Floating Water Droplets / Crystal Spheres (Physical glass refraction)
    const dropletMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#FFFFFF'),
      roughness: 0.04,
      transmission: 0.96,
      thickness: 0.7,
      transparent: true,
      opacity: 0.92,
      ior: 1.333,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04
    });

    const dropletsCount = 36;
    const dropletsData = [];
    const dropletsGroup = new THREE.Group();
    rootGroup.add(dropletsGroup);

    for (let i = 0; i < dropletsCount; i++) {
      const radius = 0.035 + Math.random() * 0.085;
      const sphereGeo = new THREE.SphereGeometry(radius, 20, 20);
      const mesh = new THREE.Mesh(sphereGeo, dropletMaterial);

      const angle = Math.random() * Math.PI * 2;
      const rx = 1.6 + Math.random() * 2.6;
      const ry = 1.0 + Math.random() * 1.5;
      const rz = (Math.random() - 0.5) * 2.5;

      const x = rx * Math.cos(angle);
      const y = ry * Math.sin(angle);
      const z = rz;

      mesh.position.set(x, y, z);
      dropletsGroup.add(mesh);

      dropletsData.push({
        mesh,
        baseX: x,
        baseY: y,
        baseZ: z,
        angle,
        radiusX: rx,
        radiusY: ry,
        orbitSpeed: (0.07 + Math.random() * 0.1) * (Math.random() > 0.5 ? 1 : -1),
        floatFreq: 0.6 + Math.random() * 0.8,
        floatAmp: 0.09 + Math.random() * 0.08,
        phase: Math.random() * Math.PI * 2,
        currentImpulse: new THREE.Vector3(0, 0, 0)
      });
    }

    // C. 3D Floating Gold Flakes / Shimmering Chips
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FFD700'),
      metalness: 0.96,
      roughness: 0.14,
      side: THREE.DoubleSide
    });

    const goldFlakeCount = 28;
    const goldFlakesData = [];
    const goldFlakesGroup = new THREE.Group();
    rootGroup.add(goldFlakesGroup);

    for (let i = 0; i < goldFlakeCount; i++) {
      const flakeSize = 0.05 + Math.random() * 0.07;
      const flakeGeo = new THREE.PlaneGeometry(flakeSize, flakeSize * 0.75, 2, 2);

      const pos = flakeGeo.attributes.position;
      for (let j = 0; j < pos.count; j++) {
        pos.setZ(j, (Math.random() - 0.5) * 0.02);
      }
      flakeGeo.computeVertexNormals();

      const mesh = new THREE.Mesh(flakeGeo, goldMaterial);

      const angle = Math.random() * Math.PI * 2;
      const rx = 1.4 + Math.random() * 2.4;
      const ry = 0.8 + Math.random() * 1.4;
      const rz = (Math.random() - 0.5) * 2.2;

      const x = rx * Math.cos(angle);
      const y = ry * Math.sin(angle);
      const z = rz;

      mesh.position.set(x, y, z);
      goldFlakesGroup.add(mesh);

      goldFlakesData.push({
        mesh,
        baseX: x,
        baseY: y,
        baseZ: z,
        angle,
        radiusX: rx,
        radiusY: ry,
        orbitSpeed: (0.12 + Math.random() * 0.16) * (Math.random() > 0.5 ? 1 : -1),
        rotSpeedX: (Math.random() - 0.5) * 0.04,
        rotSpeedY: (Math.random() - 0.5) * 0.05,
        rotSpeedZ: (Math.random() - 0.5) * 0.04,
        floatFreq: 1.0 + Math.random() * 0.7,
        floatAmp: 0.07 + Math.random() * 0.06,
        phase: Math.random() * Math.PI * 2,
        currentImpulse: new THREE.Vector3(0, 0, 0)
      });
    }

    // D. 3D Cosmic Stardust (Points)
    const stardustCount = 200;
    const stardustPositions = new Float32Array(stardustCount * 3);
    for (let i = 0; i < stardustCount; i++) {
      stardustPositions[i * 3] = (Math.random() - 0.5) * 10;
      stardustPositions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      stardustPositions[i * 3 + 2] = (Math.random() - 0.5) * 5;
    }
    const stardustGeo = new THREE.BufferGeometry();
    stardustGeo.setAttribute('position', new THREE.BufferAttribute(stardustPositions, 3));

    const stardustMat = new THREE.PointsMaterial({
      color: 0xffd1dc,
      size: 0.04,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });
    const stardustMesh = new THREE.Points(stardustGeo, stardustMat);
    rootGroup.add(stardustMesh);

    // 4. Mouse Interactive Kinetic Tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;
    let lastClientX = 0;
    let lastClientY = 0;

    const handlePointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX);
      const clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY);
      if (clientX === undefined || clientY === undefined) return;

      const normX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((clientY - rect.top) / rect.height) * 2 - 1);

      targetMouseX = normX;
      targetMouseY = normY;

      // Calculate kinetic mouse push on nearby 3D particles
      const deltaX = clientX - lastClientX;
      const deltaY = clientY - lastClientY;
      lastClientX = clientX;
      lastClientY = clientY;

      const pushPower = Math.min(0.25, Math.hypot(deltaX, deltaY) * 0.003);

      if (pushPower > 0.01) {
        // Disperse nearby 3D particles
        const mouseWorld = new THREE.Vector3(normX * 3.5, normY * 2.0, 0);

        petalsData.forEach((p) => {
          const d = p.mesh.position.distanceTo(mouseWorld);
          if (d < 1.8) {
            const dir = p.mesh.position.clone().sub(mouseWorld).normalize();
            p.currentImpulse.add(dir.multiplyScalar(pushPower * (1.8 - d)));
          }
        });

        dropletsData.forEach((d) => {
          const dist = d.mesh.position.distanceTo(mouseWorld);
          if (dist < 1.6) {
            const dir = d.mesh.position.clone().sub(mouseWorld).normalize();
            d.currentImpulse.add(dir.multiplyScalar(pushPower * (1.6 - dist)));
          }
        });
      }
    };

    const handlePointerDown = () => onInteractChangeRef.current?.(true);
    const handlePointerUp = () => onInteractChangeRef.current?.(false);

    container.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('touchmove', handlePointerMove, { passive: true });
    container.addEventListener('pointerdown', handlePointerDown);
    container.addEventListener('pointerup', handlePointerUp);
    container.addEventListener('pointerleave', handlePointerUp);

    // 5. 60FPS Zero-Gravity Physics Render Loop
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();
      const speedMult = particleSpeedRef.current;

      // Smooth mouse interpolation
      mouseX += (targetMouseX - mouseX) * 0.08;
      mouseY += (targetMouseY - mouseY) * 0.08;

      // Zero-Gravity Pulse wave calculation
      let pulseFactor = 0;
      if (pulseTriggerRef.current > 0) {
        const elapsed = (performance.now() - pulseTriggerRef.current) / 1000;
        if (elapsed < 2.2) {
          pulseFactor = Math.sin((elapsed / 2.2) * Math.PI) * 1.2;
        } else {
          pulseTriggerRef.current = 0;
        }
      }

      // Root subtle parallax tilt
      rootGroup.rotation.y = mouseX * 0.15;
      rootGroup.rotation.x = -mouseY * 0.12;

      // Animate 3D Rose Petals
      petalsData.forEach((p) => {
        p.angle += p.orbitSpeed * delta * speedMult;
        const dynamicRx = p.radiusX + pulseFactor * 0.8 + p.currentImpulse.x;
        const dynamicRy = p.radiusY + pulseFactor * 0.6 + p.currentImpulse.y;

        p.mesh.position.x = dynamicRx * Math.cos(p.angle);
        p.mesh.position.y =
          dynamicRy * Math.sin(p.angle) +
          Math.sin(time * p.floatFreq + p.phase) * p.floatAmp +
          p.currentImpulse.y;
        p.mesh.position.z = p.baseZ + pulseFactor * 0.4 + p.currentImpulse.z;

        p.mesh.rotation.x += p.rotSpeedX * speedMult;
        p.mesh.rotation.y += p.rotSpeedY * speedMult;
        p.mesh.rotation.z += p.rotSpeedZ * speedMult;

        // Dampen impulses smoothly back to zero
        p.currentImpulse.multiplyScalar(0.92);
      });

      // Animate 3D Water Droplets
      dropletsData.forEach((d) => {
        d.angle += d.orbitSpeed * delta * speedMult;
        const dynamicRx = d.radiusX + pulseFactor * 1.0 + d.currentImpulse.x;
        const dynamicRy = d.radiusY + pulseFactor * 0.7 + d.currentImpulse.y;

        d.mesh.position.x = dynamicRx * Math.cos(d.angle);
        d.mesh.position.y =
          dynamicRy * Math.sin(d.angle) +
          Math.sin(time * d.floatFreq + d.phase) * d.floatAmp +
          d.currentImpulse.y;
        d.mesh.position.z = d.baseZ + pulseFactor * 0.5 + d.currentImpulse.z;

        d.currentImpulse.multiplyScalar(0.92);
      });

      // Animate 3D Gold Flakes
      goldFlakesData.forEach((g) => {
        g.angle += g.orbitSpeed * delta * speedMult;
        const dynamicRx = g.radiusX + pulseFactor * 0.9 + g.currentImpulse.x;
        const dynamicRy = g.radiusY + pulseFactor * 0.6 + g.currentImpulse.y;

        g.mesh.position.x = dynamicRx * Math.cos(g.angle);
        g.mesh.position.y =
          dynamicRy * Math.sin(g.angle) +
          Math.sin(time * g.floatFreq + g.phase) * g.floatAmp +
          g.currentImpulse.y;
        g.mesh.position.z = g.baseZ + pulseFactor * 0.3 + g.currentImpulse.z;

        g.mesh.rotation.x += g.rotSpeedX * speedMult;
        g.mesh.rotation.y += g.rotSpeedY * speedMult;
        g.mesh.rotation.z += g.rotSpeedZ * speedMult;

        g.currentImpulse.multiplyScalar(0.92);
      });

      // Stardust drift
      stardustMesh.rotation.y = time * 0.015 * speedMult;
      stardustMesh.rotation.x = Math.sin(time * 0.02) * 0.04;

      renderer.render(scene, camera);
    };

    animate();

    // 6. Resize Handling
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 1200;
      height = container.clientHeight || 675;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('touchmove', handlePointerMove);
      container.removeEventListener('pointerdown', handlePointerDown);
      container.removeEventListener('pointerup', handlePointerUp);
      container.removeEventListener('pointerleave', handlePointerUp);

      if (renderer?.domElement && container?.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      if (renderer) renderer.dispose();
      petalGeo?.dispose();
      petalMaterial1?.dispose();
      petalMaterial2?.dispose();
      petalMaterial3?.dispose();
      dropletMaterial?.dispose();
      goldMaterial?.dispose();
      stardustGeo?.dispose();
      stardustMat?.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onClick={triggerPulse}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'auto',
        zIndex: 10,
        cursor: 'pointer'
      }}
    >
      <style>{`
        .zg-canvas-top-controls {
          position: absolute;
          top: clamp(48px, 6vw, 56px);
          left: clamp(14px, 2.5vw, 28px);
          z-index: 30;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          pointer-events: auto;
        }
        .zg-canvas-bottom-hint {
          position: absolute;
          bottom: clamp(75px, 12vw, 115px);
          left: 50%;
          transform: translateX(-50%);
          background-color: rgba(18, 18, 18, 0.72);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #E8DFD8;
          padding: 4px 14px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
          pointer-events: none;
          z-index: 20;
        }
        @media (max-width: 768px) {
          .zg-canvas-top-controls {
            display: none !important;
          }
          .zg-canvas-bottom-hint {
            display: none !important;
          }
        }
      `}</style>

      {/* Floating Control Badges on Top (Desktop only, positioned under top bar) */}
      <div
        className="zg-canvas-top-controls"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Zero-G Pulse Button */}
        <button
          onClick={triggerPulse}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(18, 18, 18, 0.82)',
            border: '1px solid rgba(226, 130, 159, 0.5)',
            backdropFilter: 'blur(12px)',
            color: '#FFFFFF',
            padding: '5px 13px',
            borderRadius: '9999px',
            fontSize: '11px',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 4px 16px rgba(226, 130, 159, 0.3)'
          }}
          title="Click to trigger zero-gravity kinetic shockwave"
        >
          <Sparkles style={{ width: '12px', height: '12px', color: '#E2829F' }} />
          <span>Zero-G Kinetic Pulse 💫</span>
        </button>

        {/* Drift Speed Toggle */}
        <button
          onClick={() => setParticleSpeedMode(particleSpeedMode === 'gentle' ? 'cosmic' : 'gentle')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(18, 18, 18, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(12px)',
            color: '#FFFFFF',
            padding: '5px 13px',
            borderRadius: '9999px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          title="Toggle zero-gravity particle speed"
        >
          <Wind style={{ width: '12px', height: '12px', color: '#BFE6F5' }} />
          <span>{particleSpeedMode === 'gentle' ? 'Drift: Gentle Float' : 'Drift: Cosmic Swirl'}</span>
        </button>
      </div>

      {/* Helper click hint (Desktop only) */}
      <div className="zg-canvas-bottom-hint">
        <RotateCw style={{ width: '11px', height: '11px', color: '#E2829F' }} />
        <span>Move cursor to guide 3D particles • Click for Zero-G pulse</span>
      </div>
    </div>
  );
}
