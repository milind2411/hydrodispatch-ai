import React, { useMemo } from 'react';

export default function AnimatedBackground() {
  // Generate random particles once
  const particles = useMemo(() => {
    return Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      left: `${(i * 5.5 + Math.random() * 4)}%`,
      size: `${Math.random() * 4 + 2}px`,
      duration: `${Math.random() * 12 + 14}s`,
      delay: `${Math.random() * 8}s`,
      color: i % 3 === 0 ? 'rgba(6, 182, 212, 0.6)' : i % 3 === 1 ? 'rgba(16, 185, 129, 0.6)' : 'rgba(56, 189, 248, 0.4)',
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#060911]">
      {/* Background Subtle Tech Grid */}
      <div className="absolute inset-0 bg-tech-grid opacity-60" />

      {/* Floating Animated Gradient Glow Orbs */}
      <div
        className="absolute -top-[10%] -left-[10%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] rounded-full animate-orb-1 blur-[120px]"
        style={{
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.18) 0%, rgba(6, 182, 212, 0) 70%)',
        }}
      />
      <div
        className="absolute top-[40%] -right-[10%] w-[50vw] h-[50vw] max-w-[650px] max-h-[650px] rounded-full animate-orb-2 blur-[130px]"
        style={{
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.14) 0%, rgba(16, 185, 129, 0) 70%)',
        }}
      />
      <div
        className="absolute -bottom-[10%] left-[25%] w-[45vw] h-[45vw] max-w-[600px] max-h-[600px] rounded-full animate-orb-1 blur-[140px]"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, rgba(139, 92, 246, 0) 70%)',
          animationDelay: '-8s',
        }}
      />

      {/* Floating Hydrogen Micro-Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left,
            bottom: '-20px',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 10px ${p.color}`,
            animation: `floatParticle ${p.duration} ease-in-out infinite`,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  );
}
