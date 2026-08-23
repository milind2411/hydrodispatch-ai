import React, { useMemo } from 'react';
import Velaris from '@/components/ui/velaris';

export default function AnimatedBackground() {
  // Generate random particles once
  const particles = useMemo(() => {
    return Array.from({ length: 22 }).map((_, i) => ({
      id: i,
      left: `${(i * 4.5 + Math.random() * 3)}%`,
      size: `${Math.random() * 4 + 2}px`,
      duration: `${Math.random() * 12 + 14}s`,
      delay: `${Math.random() * 8}s`,
      color: i % 3 === 0 ? 'rgba(6, 182, 212, 0.7)' : i % 3 === 1 ? 'rgba(16, 185, 129, 0.7)' : 'rgba(56, 189, 248, 0.5)',
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#030712]">
      {/* Living WebGL Velaris Simplex Shader Canvas */}
      <Velaris
        height="100%"
        speed={1.5}
        grain={0.18}
        bg="#030712"
        colors={["#06b6d4", "#10b981", "#0284c7", "#059669"]}
        className="absolute inset-0 w-full h-full opacity-80 pointer-events-none"
      />

      {/* Dynamic Animated Glowing Gradient Light Pools */}
      <div
        className="absolute -top-[15%] -left-[10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full animate-orb-1 blur-[120px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.25) 0%, rgba(6, 182, 212, 0) 70%)',
        }}
      />
      <div
        className="absolute top-[35%] -right-[15%] w-[55vw] h-[55vw] max-w-[750px] max-h-[750px] rounded-full animate-orb-2 blur-[130px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, rgba(16, 185, 129, 0) 70%)',
        }}
      />
      <div
        className="absolute -bottom-[15%] left-[20%] w-[50vw] h-[50vw] max-w-[700px] max-h-[700px] rounded-full animate-orb-1 blur-[140px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, rgba(99, 102, 241, 0) 70%)',
          animationDelay: '-6s',
        }}
      />

      {/* Subtle Tech Grid */}
      <div className="absolute inset-0 bg-tech-grid opacity-30 pointer-events-none" />

      {/* Floating Hydrogen Micro-Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: p.left,
            bottom: '-20px',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 12px ${p.color}`,
            animation: `floatParticle ${p.duration} ease-in-out infinite`,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  );
}
