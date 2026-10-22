import React, { useEffect, useState, useRef } from 'react';

export default function CustomCursor() {
  const [isHoveredText, setIsHoveredText] = useState(false);
  const [isHoveredInteractive, setIsHoveredInteractive] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [sparkles, setSparkles] = useState([]);

  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const mouseRef = useRef({ x: -100, y: -100 });
  const trailingRef = useRef({ x: -100, y: -100 });
  const animFrameRef = useRef(null);
  const lastSparkleTime = useRef(0);
  const hoverStateRef = useRef({ text: false, interactive: false });
  const isVisibleRef = useRef(false);

  useEffect(() => {
    // Check if touch device - don't show custom cursor on touch screens
    if (window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const onMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }

      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        setIsVisible(true);
      }

      // Throttled sparkle emission (max 1 every 100ms)
      const now = Date.now();
      if (now - lastSparkleTime.current > 100 && Math.random() < 0.4) {
        lastSparkleTime.current = now;
        const id = now + Math.random();
        setSparkles((prev) => [
          ...prev.slice(-8),
          { id, x: e.clientX, y: e.clientY, size: 4 + Math.random() * 5 }
        ]);
        setTimeout(() => {
          setSparkles((prev) => prev.filter((s) => s.id !== id));
        }, 500);
      }

      // Check what element is being hovered
      const target = e.target;
      if (!target) return;

      const isText = !!target.closest('h1, h2, h3, h4, .glow-hover-text, p, strong, span');
      const isClickable = !!target.closest('button, a, input, select, .card-3d, .category-pill, [role="button"]');

      const nextText = isText && !isClickable;
      const nextInteractive = isClickable;

      if (hoverStateRef.current.text !== nextText) {
        hoverStateRef.current.text = nextText;
        setIsHoveredText(nextText);
      }
      if (hoverStateRef.current.interactive !== nextInteractive) {
        hoverStateRef.current.interactive = nextInteractive;
        setIsHoveredInteractive(nextInteractive);
      }
    };

    const onMouseLeave = () => {
      isVisibleRef.current = false;
      setIsVisible(false);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);

    // Ultra-smooth 60-120fps hardware-accelerated lerp without React re-renders
    const loop = () => {
      const dx = mouseRef.current.x - trailingRef.current.x;
      const dy = mouseRef.current.y - trailingRef.current.y;
      trailingRef.current.x += dx * 0.18;
      trailingRef.current.y += dy * 0.18;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${trailingRef.current.x}px, ${trailingRef.current.y}px, 0) translate(-50%, -50%)`;
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* 1. Precise Inner Dot */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: isHoveredInteractive ? '10px' : '7px',
          height: isHoveredInteractive ? '10px' : '7px',
          borderRadius: '50%',
          backgroundColor: isHoveredText ? '#C75678' : '#121212',
          boxShadow: '0 0 8px rgba(226, 130, 159, 0.8)',
          pointerEvents: 'none',
          zIndex: 99999,
          transition: 'width 0.2s, height 0.2s, background-color 0.2s',
          willChange: 'transform'
        }}
      />

      {/* 2. Trailing Luminous 3D Ring */}
      <div
        ref={ringRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: isHoveredText ? '64px' : (isHoveredInteractive ? '52px' : '36px'),
          height: isHoveredText ? '64px' : (isHoveredInteractive ? '52px' : '36px'),
          borderRadius: '50%',
          border: isHoveredText
            ? '2px solid rgba(226, 130, 159, 0.85)'
            : (isHoveredInteractive ? '2px solid rgba(18, 18, 18, 0.8)' : '1.5px solid rgba(214, 166, 133, 0.7)'),
          backgroundColor: isHoveredText
            ? 'rgba(226, 130, 159, 0.12)'
            : (isHoveredInteractive ? 'rgba(18, 18, 18, 0.06)' : 'rgba(255, 255, 255, 0.25)'),
          backdropFilter: isHoveredText ? 'blur(2px)' : 'none',
          boxShadow: isHoveredText
            ? '0 0 20px rgba(226, 130, 159, 0.5), inset 0 0 10px rgba(226, 130, 159, 0.3)'
            : (isHoveredInteractive ? '0 0 15px rgba(0, 0, 0, 0.15)' : '0 0 10px rgba(214, 166, 133, 0.3)'),
          pointerEvents: 'none',
          zIndex: 99998,
          transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1), height 0.25s cubic-bezier(0.16, 1, 0.3, 1), border 0.25s, background-color 0.25s, box-shadow 0.25s',
          willChange: 'transform'
        }}
      />

      {/* 3. Sparkling Glow Trail Particles */}
      {sparkles.map((sp) => (
        <div
          key={sp.id}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: `${sp.size}px`,
            height: `${sp.size}px`,
            borderRadius: '50%',
            backgroundColor: '#E2829F',
            boxShadow: '0 0 6px #C75678, 0 0 12px #D6A685',
            pointerEvents: 'none',
            zIndex: 99997,
            transform: `translate3d(${sp.x - sp.size / 2}px, ${sp.y - sp.size / 2}px, 0)`,
            animation: 'sparkleFade 0.5s forwards ease-out'
          }}
        />
      ))}

      <style>{`
        @keyframes sparkleFade {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(0.2) translateY(10px);
          }
        }
      `}</style>
    </>
  );
}
