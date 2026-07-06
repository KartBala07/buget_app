import { useEffect, useState } from 'react';

export default function LoadingScreen({ onDone }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFading(true), 1500);
    const t2 = setTimeout(() => onDone(), 1900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div className={`loading-screen ${fading ? 'fade-out' : ''}`}>
      <div className="loading-logo">💰</div>
      <div className="loading-title">Budget<span>AI</span></div>
      <div className="loading-subtitle">Your smart money manager</div>
      <div className="loading-bar-wrap">
        <div className="loading-bar" />
      </div>
      <div className="loading-dots">
        <span /><span /><span />
      </div>
    </div>
  );
}
