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
      opacity: number;
      sway: number;
      swaySpeed: number;
    }

    // Limit particles gracefully on mobile viewports for high frame rates
    const isMobile = width < 768;
    const count = isMobile ? Math.min(particleCount, 25) : particleCount;

    const particles: Particle[] = Array.from({ length: count }, () => {
      const radius =
        particleMinSize + Math.random() * (particleMaxSize - particleMinSize);
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        radius,
        speedY: (0.4 + Math.random() * 0.8) * speed,
        speedX: (Math.random() - 0.5) * 0.6 * speed,
        opacity: (0.3 + Math.random() * 0.7) * opacity,
        sway: Math.random() * Math.PI * 2,
        swaySpeed: 0.01 + Math.random() * 0.02,
      };
    });

    // Main 60 FPS animation loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move downward with gentle horizontal sway
        p.sway += p.swaySpeed;
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(p.sway) * 0.4;

        // Wrap around viewport edges
        if (p.y > height + 10) {
          p.y = -10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) {
          p.x = width + 10;
        } else if (p.x > width + 10) {
          p.x = -10;
        }

        // Draw particle based on destination effect
        ctx.beginPath();
        if (effectType === 'snowfall') {
          // Kashmir soft snow crystals
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
          ctx.shadowBlur = 4;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
          ctx.fill();
        } else if (effectType === 'tropical-mist') {
          // Kerala warm mist motes
          ctx.arc(p.x, p.y, p.radius * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(220, 252, 231, ${p.opacity * 0.6})`;
          ctx.shadowBlur = 6;
          ctx.shadowColor = 'rgba(74, 222, 128, 0.2)';
          ctx.fill();
        } else if (effectType === 'desert-dust') {
          // Rajasthan warm golden dust
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(253, 230, 138, ${p.opacity * 0.65})`;
          ctx.shadowBlur = 4;
          ctx.shadowColor = 'rgba(217, 119, 6, 0.3)';
          ctx.fill();
        } else {
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
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
      {/* Full-Screen Non-Obtrusive Ambient Particle Canvas (Snowfall / Mist) — Layer 3 (z-10) */}
      {!reducedMotion && effectType !== 'none' && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 pointer-events-none z-10 w-full h-full select-none"
          style={{ opacity: 0.8 }}
          aria-hidden="true"
        />
      )}

      {/* Static Reduced Motion Fallback */}
      {reducedMotion && (
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{ background: theme.ambientEffects.reducedMotionFallback }}
          aria-hidden="true"
        />
      )}
    </>
  );
}
