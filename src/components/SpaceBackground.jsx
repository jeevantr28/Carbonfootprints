import React, { useMemo } from 'react';

const SpaceBackground = () => {
  // Generate random stars
  const stars = useMemo(() => {
    return Array.from({ length: 150 }).map((_, i) => {
      const size = Math.random() * 2 + 1;
      return {
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        width: `${size}px`,
        height: `${size}px`,
        animationDelay: `${Math.random() * 5}s`,
        animationDuration: `${Math.random() * 3 + 2}s`
      };
    });
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#050810]">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white animate-[flicker_3s_linear_infinite]"
          style={{
            top: star.top,
            left: star.left,
            width: star.width,
            height: star.height,
            opacity: Math.random() * 0.5 + 0.3,
            animationDelay: star.animationDelay,
            animationDuration: star.animationDuration,
            boxShadow: `0 0 ${star.width} rgba(255, 255, 255, 0.8)`
          }}
        />
      ))}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#00FFB2]/5 via-[#050810]/50 to-[#050810] opacity-60"></div>
    </div>
  );
};

export default SpaceBackground;
