import { cssVar } from '../../lib/env';

export type GridOptions = { interactive: boolean; reduced: boolean };
export type GridHandle = { destroy(): void };

const GAP = 28;
const RADIUS = 170;
const PUSH = 14;
const RIPPLE_SPEED = 600; // px per second
const RIPPLE_LIFE = 1100; // ms
const RING_EASE = 0.2;

type Mode = '' | 'link' | 'case';

/**
 * "Living dot grid": a faint dot field behind the page that swells, lights up and parts
 * around the cursor, plus a small dot + eased ring head drawn on the front canvas.
 */
export function createGrid(back: HTMLCanvasElement, front: HTMLCanvasElement, opts: GridOptions): GridHandle {
  const bx = back.getContext('2d')!;
  const fx = front.getContext('2d')!;
  let W = 0, H = 0;
  let mx = -9999, my = -9999, sx = mx, sy = my;
  let seen = false, down = false, mode: Mode = '', hoverT = 0, chart = false;
  let lastMove = 0, raf = 0, dirty = true;
  const ripples: { x: number; y: number; t: number }[] = [];

  function resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight;
    for (const [c, x] of [[back, bx], [front, fx]] as const) {
      c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
      c.style.width = `${W}px`; c.style.height = `${H}px`;
      x.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    dirty = true;
  }

  function drawGrid(now: number) {
    const gridC = cssVar('--grid'), accent = cssVar('--accent');
    bx.clearRect(0, 0, W, H);
    const live = opts.interactive && seen;
    for (let gy = GAP / 2; gy < H; gy += GAP) {
      for (let gx = GAP / 2; gx < W; gx += GAP) {
        let lit = 0, push = 0, dx = 0, dy = 0, d = 0;
        if (live) {
          dx = gx - sx; dy = gy - sy; d = Math.hypot(dx, dy);
          if (d < RADIUS) { const f = 1 - d / RADIUS; lit = f * f; }
          for (const r of ripples) {
            const age = now - r.t;
            const dd = Math.abs(Math.hypot(gx - r.x, gy - r.y) - (age / 1000) * RIPPLE_SPEED);
            if (dd < 30) lit = Math.max(lit, (1 - dd / 30) * Math.max(0, 1 - age / RIPPLE_LIFE));
          }
          push = opts.reduced ? 0 : lit * PUSH;
        }
        const x = d ? gx + (dx / d) * push : gx;
        const y = d ? gy + (dy / d) * push : gy;
        bx.fillStyle = lit > 0.05 ? accent : gridC;
        bx.globalAlpha = 0.55 + lit * 0.45;
        bx.beginPath(); bx.arc(x, y, 1.2 + lit * 2.6, 0, Math.PI * 2); bx.fill();
      }
    }
    bx.globalAlpha = 1;
  }

  function drawHead() {
    fx.clearRect(0, 0, W, H);
    if (!seen) return;
    const ink = cssVar('--ink'), accent = cssVar('--accent');
    hoverT += ((mode ? 1 : 0) - hoverT) * (opts.reduced ? 1 : 0.18);
    if (mode === 'case') {
      const r = 6 + hoverT * 50;
      fx.globalAlpha = hoverT; fx.fillStyle = accent;
      fx.beginPath(); fx.arc(sx, sy, r, 0, Math.PI * 2); fx.fill();
      fx.fillStyle = cssVar('--accent-ink');
      fx.font = '600 13px Inter, system-ui, sans-serif'; fx.textAlign = 'center';
      fx.fillText('View →', sx, sy + 5);
      fx.globalAlpha = 1;
      return;
    }
    const ringR = (down ? 11 : 16) + (mode === 'link' ? hoverT * 16 : 0);
    if (!chart) {
      if (mode === 'link') { fx.fillStyle = cssVar('--accent-soft'); fx.beginPath(); fx.arc(sx, sy, ringR, 0, Math.PI * 2); fx.fill(); }
      fx.strokeStyle = mode === 'link' ? accent : ink; fx.lineWidth = 1.5; fx.globalAlpha = 0.9;
      fx.beginPath(); fx.arc(sx, sy, ringR, 0, Math.PI * 2); fx.stroke(); fx.globalAlpha = 1;
    }
    fx.fillStyle = mode === 'link' || chart ? accent : ink;
    fx.beginPath(); fx.arc(mx, my, 3, 0, Math.PI * 2); fx.fill();
  }

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    if (document.hidden) return;
    while (ripples.length && now - ripples[0].t > RIPPLE_LIFE) ripples.shift();
    const k = opts.reduced ? 1 : RING_EASE;
    const nsx = sx + (mx - sx) * k, nsy = sy + (my - sy) * k;
    const settling = Math.abs(nsx - sx) > 0.05 || Math.abs(nsy - sy) > 0.05 || Math.abs((mode ? 1 : 0) - hoverT) > 0.01;
    sx = nsx; sy = nsy;
    const busy = dirty || settling || ripples.length > 0 || now - lastMove < 120;
    if (!busy) return;
    dirty = false;
    drawGrid(now);
    if (opts.interactive) drawHead();
  }

  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    mx = e.clientX; my = e.clientY; lastMove = performance.now();
    if (!seen) { seen = true; sx = mx; sy = my; }
  };
  const onOver = (e: Event) => {
    const el = (e.target as Element).closest?.('[data-cursor]');
    const m = (el?.getAttribute('data-cursor') ?? '') as Mode;
    mode = m === 'link' || m === 'case' ? m : '';
    dirty = true;
  };
  const onDown = () => {
    down = true; dirty = true;
    if (!opts.reduced && !chart) ripples.push({ x: mx, y: my, t: performance.now() });
  };
  const onUp = () => { down = false; dirty = true; };
  const onLeaveWin = () => { seen = false; dirty = true; };
  const classWatch = new MutationObserver(() => { chart = document.body.classList.contains('is-chart'); dirty = true; });
  const themeWatch = new MutationObserver(() => { dirty = true; });

  resize();
  window.addEventListener('resize', resize);
  themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  if (opts.interactive) {
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    document.documentElement.addEventListener('mouseleave', onLeaveWin);
    classWatch.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }
  raf = requestAnimationFrame(frame);

  return {
    destroy() {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.documentElement.removeEventListener('mouseleave', onLeaveWin);
      classWatch.disconnect();
      themeWatch.disconnect();
    },
  };
}
