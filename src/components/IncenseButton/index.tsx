import { useState, useCallback } from 'react';
import './index.scss';

interface IncenseButtonProps {
  count: number;
  onIncense: () => void;
}

export default function IncenseButton({ count, onIncense }: IncenseButtonProps) {
  const [animating, setAnimating] = useState(false);
  const [particles, setParticles] = useState<number[]>([]);
  const [displayCount, setDisplayCount] = useState(count);

  // Sync displayCount when count prop changes externally
  if (!animating && displayCount !== count) {
    setDisplayCount(count);
  }

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (animating) return;
    setAnimating(true);
    setParticles(Array.from({ length: 8 }, (_, i) => i));
    setDisplayCount(prev => prev + 1);
    onIncense();
    setTimeout(() => {
      setAnimating(false);
      setParticles([]);
    }, 900);
  }, [animating, onIncense]);

  return (
    <div className="incense-btn-wrapper">
      <button className={`incense-btn ${animating ? 'incense-btn--lit' : ''}`} onClick={handleClick}>
        <span className="incense-btn__candle">{animating ? '🕯️' : '🕯️'}</span>
        <span className={`incense-btn__count ${animating ? 'incense-btn__count--bump' : ''}`}>{displayCount}</span>
        <span className="incense-btn__label">上香</span>
      </button>
      {particles.map(i => (
        <span
          key={i}
          className="incense-particle"
          style={{
            '--angle': `${i * 45 + Math.random() * 20}deg`,
            '--distance': `${25 + Math.random() * 35}px`,
            '--delay': `${Math.random() * 0.15}s`,
            '--size': `${3 + Math.random() * 4}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
