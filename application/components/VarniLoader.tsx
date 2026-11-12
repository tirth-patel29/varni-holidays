'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * Varni Holidays - Cinematic Liquid Wave Loader & Portal Reveal
 * 
 * Based on the signature Varni Holidays liquid typographic loader:
 * 1. Deep cinematic background overlay covering viewport during background page load
 * 2. Massive dual-line typography: "VARNI" & "HOLIDAYS"
 * 3. Physics-based organic liquid wave sloshing upward to fill the brand text
 * 4. Dynamic loading percentage counter tracking DOM hydration & font readiness
 * 5. Portal hole cut-out zoom-through transition into the fully rendered website
 */
export default function VarniLoader() {
  const [active, setActive] = useState(true);
  const [fading, setFading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const waveRef = useRef<SVGPathElement>(null);
  const cntRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<SVGGElement>(null);
  const holeGRef = useRef<SVGGElement>(null);

  useEffect(() => {
    // Only execute in browser
    if (typeof window === 'undefined') return;

    // Prevent body scrolling while loader is displaying
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const svg = svgRef.current;
    const wave = waveRef.current;
    const cnt = cntRef.current;
    const layers = layersRef.current;
    const holeG = holeGRef.current;
    const container = containerRef.current;

    if (!svg || !wave || !cnt || !layers || !holeG || !container) {
      document.body.style.overflow = originalOverflow;
      setActive(false);
      return;
    }

    const W = 1400;
    const H = 560;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Viewport geometry calculation
    const getGeom = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const k = Math.min(w / W, h / H);
      return { k, ox: (w - W * k) / 2, oy: (h - H * k) / 2 };
    };

    // Responsive positioning of the % counter next to "HOLIDAYS"
    const placeCounter = () => {
      if (!cnt) return;
      const g = getGeom();
      cnt.style.left = `${g.ox + 1370 * g.k}px`;
      cnt.style.top = `${g.oy + 510 * g.k}px`;
      cnt.style.fontSize = `${Math.max(12, Math.round(18 * g.k))}px`;
    };

    // Draw organic dual-sine liquid wave
    const drawWave = (progress: number, timeSec: number) => {
      if (!wave) return;
      // Progress ranges from 0 to 1; lv goes from 510 down to -30
      const lv = 510 - 540 * progress;
      const amplitude = 15 * (1 - Math.pow(progress, 6));

      let d = `M-50 800 L-50 ${lv.toFixed(1)}`;
      for (let x = -50; x <= 1450; x += 25) {
        const y = lv + amplitude * Math.sin(x * 0.011 + timeSec * 3.2) + amplitude * 0.5 * Math.sin(x * 0.023 - timeSec * 2.1);
        d += ` L${x} ${y.toFixed(1)}`;
      }
      d += ' L1450 800Z';
      wave.setAttribute('d', d);
    };

    let isPageReady = false;
    let animFrameId: number;

    // Check when fonts & background page are ready
    const fontReady = document.fonts ? document.fonts.ready : Promise.resolve();
    const docReady =
      document.readyState === 'complete'
        ? Promise.resolve()
        : new Promise((resolve) => window.addEventListener('load', resolve, { once: true }));

    Promise.all([fontReady, docReady]).then(() => {
      isPageReady = true;
    });

    // Safety fallback: ready after at most 2.4s even on slow 3G
    const fallbackTimer = setTimeout(() => {
      isPageReady = true;
    }, 2400);

    const DURATION = reduceMotion ? 500 : 2000;
    let startTime: number | null = null;
    let finished = false;

    const finishReveal = () => {
      if (finished) return;
      finished = true;
      clearTimeout(fallbackTimer);

      setTimeout(() => {
        document.body.classList.add('varni-page-ready');

        if (reduceMotion) {
          setFading(true);
          setTimeout(() => {
            document.body.style.overflow = originalOverflow;
            setActive(false);
          }, 300);
          return;
        }

        // Fade out colored text layers, show transparent hole cutouts, hide counter
        layers.style.opacity = '0';
        holeG.style.opacity = '1';
        cnt.style.opacity = '0';

        setTimeout(() => {
          const g = getGeom();
          let ox = 700;
          try {
            const t2 = document.getElementById('varni-t2') as any;
            if (t2 && t2.getExtentOfChar) {
              const e = t2.getExtentOfChar(1); // 'O' in HOLIDAYS
              ox = e.x + e.width * 0.1;
            }
          } catch {
            ox = 700;
          }
          const oy = 496 - 223 * 0.35;

          svg.style.transformOrigin = `${g.ox + ox * g.k}px ${g.oy + oy * g.k}px`;

          // Web Animations API zoom through letter cutout into website
          if (typeof svg.animate === 'function') {
            const zoomAnim = svg.animate(
              [
                { transform: 'scale(1, 1)', opacity: 1 },
                { transform: 'scale(65, 45)', opacity: 0.95 },
                { transform: 'scale(85, 60)', opacity: 0 },
              ],
              {
                duration: 1100,
                easing: 'cubic-bezier(0.75, 0, 0.25, 1)',
                fill: 'forwards',
              }
            );

            zoomAnim.onfinish = () => {
              document.body.style.overflow = originalOverflow;
              setActive(false);
            };
          } else {
            // Fallback smooth fade if animate API is unavailable
            setFading(true);
            setTimeout(() => {
              document.body.style.overflow = originalOverflow;
              setActive(false);
            }, 500);
          }
        }, 220);
      }, 150);
    };

    const loop = (now: number) => {
      if (startTime === null) startTime = now;
      let p = Math.min((now - startTime) / DURATION, 1);

      // Smooth easeInOutQuad easing
      p = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;

      // Hold at 98% if page assets / hydration still in progress
      if (!isPageReady) {
        p = Math.min(p, 0.98);
      }

      drawWave(p, now / 1000);
      if (cnt) {
        cnt.textContent = `loading... ${Math.round(p * 100)} %`;
      }

      if (p < 1) {
        animFrameId = requestAnimationFrame(loop);
      } else {
        finishReveal();
      }
    };

    window.addEventListener('resize', placeCounter);
    placeCounter();
    animFrameId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', placeCounter);
      cancelAnimationFrame(animFrameId);
      clearTimeout(fallbackTimer);
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  if (!active) return null;

  return (
    <div
      ref={containerRef}
      id="varni-loader-ov"
      aria-hidden="true"
      className={`fixed inset-0 z-[99999] bg-[#161616] text-[#F6E7C8] overflow-hidden pointer-events-none select-none transition-opacity duration-300 ${
        fading ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <svg
        ref={svgRef}
        id="varni-loader-svg"
        viewBox="0 0 1400 560"
        preserveAspectRatio="xMidYMid meet"
        className="fixed inset-0 w-full h-full overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id="varni-fillclip">
            <path ref={waveRef} id="varni-wave" d="" />
          </clipPath>
          <mask
            id="varni-hole"
            maskUnits="userSpaceOnUse"
            x="-30000"
            y="-30000"
            width="60000"
            height="60000"
          >
            <rect x="-30000" y="-30000" width="60000" height="60000" fill="#fff" />
            <g ref={holeGRef} id="varni-holeG" fill="#000" style={{ opacity: 0, transition: 'opacity 0.35s ease' }}>
              <use href="#varni-t1" />
              <use href="#varni-t2" />
            </g>
          </mask>
        </defs>

        {/* Outer Dark Mask Screen */}
        <rect
          x="-30000"
          y="-30000"
          width="60000"
          height="60000"
          fill="#161616"
          mask="url(#varni-hole)"
        />

        {/* Typographic Fill Layers */}
        <g ref={layersRef} id="varni-layers" style={{ transition: 'opacity 0.35s ease' }}>
          {/* Dim Base Typography */}
          <g
            fill="#384353"
            style={{
              fontFamily: "'Archivo Black', Impact, 'Arial Black', sans-serif",
              fontWeight: 900,
            }}
          >
            <text
              id="varni-t1"
              x="30"
              y="300"
              fontSize="357"
              textLength="1340"
              lengthAdjust="spacingAndGlyphs"
            >
              VARNI
            </text>
            <text
              id="varni-t2"
              x="30"
              y="496"
              fontSize="223"
              textLength="1340"
              lengthAdjust="spacingAndGlyphs"
            >
              HOLIDAYS
            </text>
          </g>

          {/* Liquid Wave Filled Typography */}
          <g
            fill="#FFFFFF"
            clipPath="url(#varni-fillclip)"
            style={{
              fontFamily: "'Archivo Black', Impact, 'Arial Black', sans-serif",
              fontWeight: 900,
            }}
          >
            <use href="#varni-t1" />
            <use href="#varni-t2" />
          </g>
        </g>
      </svg>

      {/* Progress Counter positioned dynamically */}
      <div
        ref={cntRef}
        id="varni-cnt"
        className="fixed text-white font-semibold whitespace-nowrap transition-opacity duration-200 font-mono tracking-wider"
        style={{
          transform: 'translateX(-100%)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        loading... 0 %
      </div>
    </div>
  );
}

