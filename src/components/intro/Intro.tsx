import { useEffect, useRef, useState } from 'react';
import { noiseScreenPoints } from '../hero/plotRenderer';
import { cssVar, prefersReducedMotion } from '../../lib/env';
import './intro.css';

// ?introSpeed=0.25 plays the intro in slow motion (for tuning)
const SPEED = Number(new URLSearchParams(window.location.search).get('introSpeed')) || 1;
const T_GATHER = 950, T_HOLD = 1250, T_BURST = 1450, T_LAND = 2150, T_END = 2550;

type P = { sx: number; sy: number; lx: number; ly: number; bx: number; by: number; hx: number; hy: number; hero: boolean; d: number };

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

function markReady() {
  document.documentElement.classList.add('ready');
  document.documentElement.classList.remove('intro-lock');
}

/** Plays on every page load, except for reduced motion or a deep link (e.g. /#work), which go straight to the content. */
function shouldPlay(): boolean {
  return !prefersReducedMotion() && !window.location.hash;
}

// The intro always starts from the top, so don't let the browser restore an old scroll position on refresh.
if (shouldPlay() && 'scrollRestoration' in history) history.scrollRestoration = 'manual';

/** Sample points inside the letters "VL" drawn in the display serif. */
function letterPoints(W: number, H: number, count: number) {
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d')!;
  const size = Math.min(W * 0.42, H * 0.5);
  x.fillStyle = '#000';
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.font = `400 ${size}px "Instrument Serif", "Times New Roman", serif`;
  x.fillText('VL', W / 2, H / 2);
  const data = x.getImageData(0, 0, W, H).data;
  const step = Math.max(3, Math.round(size / 90));
  const pts: { x: number; y: number }[] = [];
  for (let y = 0; y < H; y += step) for (let xx = 0; xx < W; xx += step) if (data[(y * W + xx) * 4 + 3] > 128) pts.push({ x: xx, y });
  for (let i = pts.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pts[i], pts[j]] = [pts[j], pts[i]]; }
  return pts.slice(0, count);
}

/**
 * Loading intro, "fitting the model": dots gather into the initials VL, burst apart,
 * and the hero's 72 noise points fly to their exact positions in the hero chart.
 */
export function Intro() {
  const [play] = useState(shouldPlay);
  const [gone, setGone] = useState(!play);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!play || !canvasRef.current) { markReady(); return; }
    document.documentElement.classList.add('intro-lock');
    window.scrollTo(0, 0);

    const canvas = canvasRef.current!, ctx = canvas.getContext('2d')!;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = window.innerWidth, H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let raf = 0, start = 0, skipAt = 0, done = false;
    let parts: P[] = [];

    const finish = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      markReady();
      setGone(true);
    };
    const skip = () => { if (!skipAt) skipAt = performance.now(); };

    const setup = () => {
      const plot = document.querySelector<HTMLCanvasElement>('.plot-canvas');
      const hero = plot ? noiseScreenPoints(plot) : [];
      const letters = letterPoints(W, H, Math.max(260, Math.min(620, Math.round((W * H) / 1900))));
      const cx = W / 2, cy = H / 2;
      parts = letters.map((l, i) => {
        const a = Math.random() * Math.PI * 2, r = Math.max(W, H) * (0.18 + Math.random() * 0.42);
        const ba = Math.atan2(l.y - cy, l.x - cx) + (Math.random() - 0.5) * 1.2, br = 80 + Math.random() * 220;
        const h = hero[i];
        return {
          sx: cx + Math.cos(a) * r, sy: cy + Math.sin(a) * r,
          lx: l.x, ly: l.y,
          bx: l.x + Math.cos(ba) * br, by: l.y + Math.sin(ba) * br,
          hx: h ? h.x : l.x, hy: h ? h.y : l.y,
          hero: Boolean(h), d: Math.random() * 300,
        };
      });
      raf = requestAnimationFrame(frame);
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!start) start = now;
      let t = (now - start) * SPEED;
      if (skipAt) t = Math.max(t, T_LAND + (now - skipAt) * 1.6);
      if (t >= T_END) { finish(); return; }

      const ink = cssVar('--ink'), noise = cssVar('--noise'), accent = cssVar('--accent');
      // fade the backdrop (and our dots, so the chart's own points take over) once they've landed
      const fade = clamp01((t - T_LAND + 250) / (T_END - T_LAND + 250));
      ctx.clearRect(0, 0, W, H);
      for (const p of parts) {
        let x: number, y: number, r = 2.2, alpha = 1, color = ink;
        if (t < T_GATHER) {
          const k = easeOut(clamp01((t - p.d) / (T_GATHER - 300)));
          x = mix(p.sx, p.lx, k); y = mix(p.sy, p.ly, k);
          alpha = 0.2 + 0.8 * k;
          if (k > 0.98 && Math.random() < 0.02) color = accent;
        } else if (t < T_HOLD) {
          x = p.lx + Math.sin(now / 180 + p.d) * 0.6; y = p.ly;
          color = (p.d | 0) % 7 === 0 ? accent : ink;
        } else if (t < T_BURST) {
          const k = easeOut(clamp01((t - T_HOLD) / (T_BURST - T_HOLD)));
          x = mix(p.lx, p.bx, k); y = mix(p.ly, p.by, k);
        } else {
          const k = easeInOut(clamp01((t - T_BURST - p.d * 0.5) / (T_LAND - T_BURST - 150)));
          if (p.hero) {
            x = mix(p.bx, p.hx, k); y = mix(p.by, p.hy, k);
            r = mix(2.6, 3.2, k); color = k > 0.85 ? noise : ink;
            alpha = mix(1, 0.45, k);
          } else {
            x = p.bx + (p.bx - W / 2) * k * 0.3; y = p.by + (p.by - H / 2) * k * 0.3;
            alpha = 1 - k; r = 2.6 * (1 - k * 0.6);
          }
        }
        alpha *= 1 - fade;
        if (alpha <= 0.01) continue;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;

      const pct = Math.min(100, Math.round((t / T_LAND) * 100));
      if (pctRef.current) pctRef.current.textContent = String(pct).padStart(3, '0');
      if (rootRef.current) rootRef.current.style.setProperty('--fade', String(1 - fade));
    };

    const fontsReady = Promise.race([
      (document as Document & { fonts?: FontFaceSet }).fonts?.ready ?? Promise.resolve(),
      new Promise((r) => setTimeout(r, 700)),
    ]);
    fontsReady.then(() => requestAnimationFrame(setup));

    window.addEventListener('pointerdown', skip);
    window.addEventListener('keydown', skip);
    window.addEventListener('wheel', skip, { passive: true });
    window.addEventListener('touchstart', skip, { passive: true });
    const safety = window.setTimeout(finish, 5000 / SPEED);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(safety);
      window.removeEventListener('pointerdown', skip);
      window.removeEventListener('keydown', skip);
      window.removeEventListener('wheel', skip);
      window.removeEventListener('touchstart', skip);
      document.documentElement.classList.remove('intro-lock');
    };
  }, [play]);

  if (gone) return null;
  return (
    <div className="intro" ref={rootRef} aria-hidden="true">
      <div className="intro-bg" />
      <canvas ref={canvasRef} className="intro-canvas" />
      <div className="intro-meta mono">
        <span>fitting model</span>
        <span><span ref={pctRef}>000</span>%</span>
      </div>
    </div>
  );
}
