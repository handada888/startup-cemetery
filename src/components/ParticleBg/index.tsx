import { useEffect, useRef } from 'react';
import './index.scss';

export default function ParticleBg() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const particles: HTMLSpanElement[] = [];
    for (let i = 0; i < 20; i++) {
      const p = document.createElement('span');
      p.className = 'particle-bg__particle';
      p.style.left = `${Math.random() * 100}%`;
      p.style.animationDelay = `${Math.random() * 8}s`;
      p.style.animationDuration = `${6 + Math.random() * 8}s`;
      p.style.opacity = String(0.03 + Math.random() * 0.06);
      p.style.width = `${2 + Math.random() * 4}px`;
      p.style.height = p.style.width;
      container.appendChild(p);
      particles.push(p);
    }
    
    return () => {
      particles.forEach(p => p.remove());
    };
  }, []);

  return <div ref={containerRef} className="particle-bg" />;
}
