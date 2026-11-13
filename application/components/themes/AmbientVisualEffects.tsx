'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useDestinationTheme } from '@/lib/themes/DestinationThemeProvider';

export default function AmbientVisualEffects() {
  const theme = useDestinationTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Check for prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const effectType = theme.ambientEffects.type;

  useEffect(() => {
    // If no canvas effect needed or reduced motion is enabled, skip canvas loop
    if (reducedMotion || effectType === 'none') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle setup
    const {
      particleCount,
      particleMinSize,
      particleMaxSize,
      speed,
      color,
      opacity,
    } = theme.ambientEffects;

    interface Particle {
      x: number;
      y: number;
      radius: number;
      speedY: number;
      speedX: number;
      swayOffset: number;
      swaySpeed: number;
      alpha: number;
    }

    const particles: Particle[] = [];

    // Scale count gently on smaller screens
    const effectiveCount = width < 768 ? Math.floor(particleCount * 0.5) : particleCount;

    for (let i = 0; i < effectiveCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: particleMinSize + Math.random() * (particleMaxSize - particleMinSize),
        speedY: (0.4 + Math.random() * 0.8) * speed,
        speedX: (Math.random() - 0.5) * 0.4,
        swayOffset: Math.random() * Math.PI * 2,
        swaySpeed: 0.015 + Math.random() * 0.02,
        alpha: opacity * (0.4 + Math.random() * 0.6),
      });
    }

    let time = 0;

    const render = () => {
      time += 1;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (effectType === 'snowfall') {
          // Kashmiri Snowfall: Gentle downward drift with subtle sinusoidal horizontal sway
          p.y += p.speedY;
          p.x += Math.sin(time * p.swaySpeed + p.swayOffset) * 0.45;

          // Wrap around viewport edges
          if (p.y > height) {
            p.y = -p.radius * 2;
            p.x = Math.random() * width;
          }
          if (p.x > width) p.x = 0;
          if (p.x < 0) p.x = width;

          // Draw soft, crisp snowflake
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
          ctx.shadowColor = 'rgba(186, 230, 253, 0.4)';
          ctx.shadowBlur = p.radius > 3 ? 3 : 1;
          ctx.fill();
        } else if (effectType === 'tropical-mist') {
          // Kerala Tropical Mist & Light Motes: Gentle ascending / wandering ambient warmth
          p.y -= p.speedY * 0.5;
          p.x += Math.sin(time * p.swaySpeed + p.swayOffset) * 0.3;

          if (p.y < -p.radius * 2) {
            p.y = height + p.radius * 2;
            p.x = Math.random() * width;
          }
          if (p.x > width) p.x = 0;
          if (p.x < 0) p.x = width;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(22, 134, 83, ${p.alpha * 0.8})`;
          ctx.shadowColor = 'rgba(196, 151, 70, 0.3)';
          ctx.shadowBlur = 4;
          ctx.fill();
        } else if (effectType === 'desert-dust' || effectType === 'ocean-breeze') {
          // Warm desert dunes or coastal wave breeze
          p.x += p.speedY * 0.7;
          p.y += Math.sin(time * p.swaySpeed + p.swayOffset) * 0.3;

          if (p.x > width + p.radius * 2) {
            p.x = -p.radius * 2;
            p.y = Math.random() * height;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.globalAlpha = p.alpha;
          ctx.fill();
          ctx.globalAlpha = 1.0;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [effectType, theme.ambientEffects, reducedMotion]);

  return (
    <>
      {/* 1. Fixed Viewport Background Ambient Glow Orbs */}
      <div
        className="fixed inset-0 pointer-events-none -z-10 overflow-hidden transition-opacity duration-700"
        aria-hidden="true"
      >
        <div
          className="absolute -top-32 -left-32 w-[34rem] h-[34rem] rounded-full blur-[100px] transition-all duration-700 opacity-60"
          style={{ backgroundColor: theme.colors.ambientOrbPrimary }}
        />
        <div
          className="absolute top-1/3 -right-32 w-[30rem] h-[30rem] rounded-full blur-[120px] transition-all duration-700 opacity-50"
          style={{ backgroundColor: theme.colors.ambientOrbSecondary }}
        />
      </div>

      {/* 2. Full-Screen Non-Obtrusive Ambient Particle Canvas (Snowfall / Mist) */}
      {!reducedMotion && effectType !== 'none' && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 pointer-events-none z-20 w-full h-full select-none"
          style={{ opacity: 0.85 }}
          aria-hidden="true"
        />
      )}

      {/* 3. Static Reduced Motion Fallback */}
      {reducedMotion && (
        <div
          className="fixed inset-0 pointer-events-none -z-10"
          style={{ background: theme.ambientEffects.reducedMotionFallback }}
          aria-hidden="true"
        />
      )}
    </>
  );
}
