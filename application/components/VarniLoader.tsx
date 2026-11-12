'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * VARNI HOLIDAYS — TYPOGRAPHIC PRELOADER & PORTAL REVEAL
 *
 * Exact specifications:
 * - Structure: Main page fully rendered underneath (normal flow, low z-index).
 * - Fixed full-screen overlay on top (z-index 50) containing one full-viewport SVG.
 * - Phase 1 (0 to 100%): #161616 dark canvas, "VARNI" & "HOLIDAYS" in Archivo Black justified to 1340px width.
 *   Liquid sine wave rising inside letters via clipPath. Counter "loading... XX %" under bottom-right.
 *   Holds at 99% until document fonts and page are fully ready.
 * - Phase 2 (The Reveal):
 *   1. Letters reach 100% full white.
 *   2. Crossfade (350ms): fade out white text, fade in SVG mask hole -> letters become transparent windows into the live page.
 *   3. Zoom-in: scale whole SVG from scale(1,1) to scale(60,42) over 1.6s with cubic-bezier(0.75, 0, 0.25, 1).
 *   4. transformOrigin set to left stroke of "O" in HOLIDAYS.
 *   5. Remove overlay on finish; body.go triggers main page .rise content entrance.
 */
export default function VarniLoader() {
  const [mounted, setMounted] = useState(true);
  const svgRef = useRef<SVGSVGElement>(null);
  const waveRef = useRef<SVGPathElement>(null);
  const cntRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<SVGGElement>(null);
  const holeGRef = useRef<SVGGElement>(null);
  const t2Ref = useRef<SVGTextElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Mark body as loading
    document.body.classList.add('loader-active');
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const svg = svgRef.current;
    const wave = waveRef.current;
    const cnt = cntRef.current;
    const layers = layersRef.current;
    const holeG = holeGRef.current;
    const t2 = t2Ref.current;

    if (!svg || !wave || !cnt || !layers || !holeG || !t2) {
      document.body.classList.remove('loader-active');
      document.body.classList.add('page-ready');
      document.body.style.overflow = originalOverflow;
      setMounted(false);
      return;
    }

    const W = 1400;
    const H = 560;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const geom = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const k = Math.min(w / W, h / H);
      return { k, ox: (w - W * k) / 2, oy: (h - H * k) / 2 };
    };

    function place() {
      if (!cnt) return;
      const g = geom();
      cnt.style.left = g.ox + 1370 * g.k + 'px';
      cnt.style.top = g.oy + 510 * g.k + 'px';
      cnt.style.fontSize = Math.max(12, 18 * g.k) + 'px';
    }

    function draw(p: number, t: number) {
      if (!wave) return;
      const lv = 510 - 540 * p;
      const A = 15 * (1 - Math.pow(p, 6));
      let d = 'M-50 800 L-50 ' + lv.toFixed(1);
      for (let x = -50; x <= 1450; x += 25) {
        const y = lv + A * Math.sin(x * 0.011 + t * 3.2) + A * 0.5 * Math.sin(x * 0.023 - t * 2.1);
        d += ' L' + x + ' ' + y.toFixed(1);
      }
      wave.setAttribute('d', d + ' L1450 800Z');
    }

    let ready = false;
    const pageLoaded =
      document.readyState === 'complete'
        ? Promise.resolve()
        : new Promise((r) => window.addEventListener('load', r, { once: true }));

    Promise.all([document.fonts ? document.fonts.ready : null, pageLoaded]).then(() => {
      ready = true;
    });

    // Safety timeout ceiling so slow network never hangs the preloader
    const safetyTimeout = setTimeout(() => {
      ready = true;
    }, 3200);

    const DUR = reduce ? 600 : 2200;
    let t0: number | null = null;
    let animId: number;

    function finish() {
      setTimeout(() => {
        document.body.classList.add('go');

        if (reduce) {
          document.body.classList.add('page-ready');
          document.body.classList.remove('loader-active', 'go');
          document.body.style.overflow = originalOverflow;
          setMounted(false);
          return;
        }

        // Crossfade: fade out white text layer, fade in transparent mask hole (350ms)
        if (layers) layers.style.opacity = '0';
        if (holeG) holeG.style.opacity = '1';
        if (cnt) cnt.style.opacity = '0';

        setTimeout(() => {
          const g = geom();
          let ox = 700;
          try {
            const e = (t2 as any).getExtentOfChar(1); // Left stroke of "O" in HOLIDAYS
            ox = e.x + e.width * 0.1;
          } catch {
            ox = 700;
          }
          const oy = 496 - 223 * 0.35;

          if (svg) {
            svg.style.transformOrigin = g.ox + ox * g.k + 'px ' + (g.oy + oy * g.k) + 'px';

            // Zoom SVG from scale(1,1) to scale(60,42) over 1.6s
            const a = svg.animate(
              [
                { transform: 'scale(1, 1)' },
                { transform: 'scale(60, 42)' },
              ],
              {
                duration: 1600,
                easing: 'cubic-bezier(0.75, 0, 0.25, 1)',
                fill: 'forwards',
              }
            );

            a.onfinish = () => {
              document.body.classList.add('page-ready');
              document.body.classList.remove('loader-active', 'go');
              document.body.style.overflow = originalOverflow;
              setMounted(false);
            };
          }
        }, 300);
      }, 250);
    }

    function frame(now: number) {
      if (t0 === null) t0 = now;
      let p = Math.min((now - t0) / DUR, 1);
      p = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;

      if (!ready) p = Math.min(p, 0.99);

      draw(p, now / 1000);
      if (cnt) cnt.textContent = 'loading... ' + Math.round(p * 100) + ' %';

      if (p < 1) {
        animId = requestAnimationFrame(frame);
      } else {
        finish();
      }
    }

    window.addEventListener('resize', place);
    place();
    animId = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener('resize', place);
      cancelAnimationFrame(animId);
      clearTimeout(safetyTimeout);
      document.body.style.overflow = originalOverflow;
      document.body.classList.remove('loader-active', 'go');
      document.body.classList.add('page-ready');
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      id="ov"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        overflow: 'visible',
        pointerEvents: 'none',
      }}
    >
      <svg
        ref={svgRef}
        id="s"
        viewBox="0 0 1400 560"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          overflow: 'visible',
        }}
      >
        <defs>
          <clipPath id="fillclip">
            <path ref={waveRef} id="wave" d="" />
          </clipPath>
          <mask
            id="hole"
            maskUnits="userSpaceOnUse"
            x="-30000"
            y="-30000"
            width="60000"
            height="60000"
          >
            <rect x="-30000" y="-30000" width="60000" height="60000" fill="#fff" />
            <g
              ref={holeGRef}
              id="holeG"
              fill="#000"
              style={{ opacity: 0, transition: 'opacity .35s ease' }}
            >
              <use href="#t1" />
              <use href="#t2" />
            </g>
          </mask>
        </defs>

        {/* 60000x60000 dark canvas with dynamic hole mask */}
        <rect
          x="-30000"
          y="-30000"
          width="60000"
          height="60000"
          fill="#161616"
          mask="url(#hole)"
        />

        {/* Typographic text layers */}
        <g ref={layersRef} id="layers" style={{ transition: 'opacity .35s ease' }}>
          {/* Dim text baseline (#444) */}
          <g fill="#444" style={{ fontFamily: "'Archivo Black', Impact, 'Arial Black', sans-serif" }}>
            <text id="t1" x="30" y="300" fontSize="357" textLength="1340" lengthAdjust="spacingAndGlyphs">
              VARNI
            </text>
            <text
              ref={t2Ref}
              id="t2"
              x="30"
              y="496"
              fontSize="223"
              textLength="1340"
              lengthAdjust="spacingAndGlyphs"
            >
              HOLIDAYS
            </text>
          </g>

          {/* Liquid wavy white text fill */}
          <g
            fill="#fff"
            clipPath="url(#fillclip)"
            style={{ fontFamily: "'Archivo Black', Impact, 'Arial Black', sans-serif" }}
          >
            <use href="#t1" />
            <use href="#t2" />
          </g>
        </g>
      </svg>

      {/* Percentage Counter */}
      <div
        ref={cntRef}
        id="cnt"
        style={{
          position: 'fixed',
          transform: 'translateX(-100%)',
          color: '#fff',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          transition: 'opacity .25s',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        loading... 0 %
      </div>
    </div>
  );
}
