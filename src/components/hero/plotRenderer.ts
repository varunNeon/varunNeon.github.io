import { clamp, easeInOut, fit, makeDataset, XMAX, YMAX, type DataPoint, type FitResult } from '../../lib/stats';
import { cssVar } from '../../lib/env';

type UserPoint = DataPoint & { born: number };

export type PlotOptions = {
  reduced: boolean;
  onStats: (s: FitResult) => void;
  onPointerInPlot: (inside: boolean) => void;
};

export type PlotHandle = {
  setProgress(p: number): void;
  setActive(active: boolean): void;
  reset(): void;
  destroy(): void;
};

const M = { l: 44, r: 14, t: 12, b: 34 };
const SNAP_PX = 16;

export function createPlot(canvas: HTMLCanvasElement, opts: PlotOptions): PlotHandle {
  const ctx = canvas.getContext('2d')!;
  const base = makeDataset();
  let user: UserPoint[] = [];
  let target = fit(base);
  const line = { a: target.a, b: target.b, sd: target.sd };
  opts.onStats(target);

  let W = 0, H = 0;
  let p = opts.reduced ? 1 : 0;
  let pS = p;
  let active = true;
  let raf = 0;
  const mouse = { x: 0, y: 0, in: false };

  const pw = () => W - M.l - M.r;
  const ph = () => H - M.t - M.b;
  const sx = (x: number) => M.l + (x / XMAX) * pw();
  const sy = (y: number) => M.t + ph() - (y / YMAX) * ph();
  const ix = (px: number) => ((px - M.l) / pw()) * XMAX;
  const iy = (py: number) => ((M.t + ph() - py) / ph()) * YMAX;

  function resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const r = canvas.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = Math.max(1, Math.round(W * dpr));
    canvas.height = Math.max(1, Math.round(H * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  function refit() {
    target = fit([...base, ...user]);
    opts.onStats(target);
  }

  const onMove = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
    const inside = e.pointerType === 'mouse' && mouse.x > M.l && mouse.x < W - M.r && mouse.y > M.t && mouse.y < H - M.b;
    if (inside !== mouse.in) { mouse.in = inside; opts.onPointerInPlot(inside); }
  };
  const onLeave = () => { if (mouse.in) { mouse.in = false; opts.onPointerInPlot(false); } };
  const onClick = (e: MouseEvent) => {
    const r = canvas.getBoundingClientRect();
    const x = ix(e.clientX - r.left), y = iy(e.clientY - r.top);
    if (x < 0 || x > XMAX || y < 0 || y > YMAX) return;
    user.push({ x, y, nx: x, ny: y, d: 0, ph: 0, born: performance.now() });
    refit();
  };
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerleave', onLeave);
  canvas.addEventListener('click', onClick);

  function tag(txt: string, x: number, y: number, align: 'center' | 'right', bg: string, fg: string) {
    const w = ctx.measureText(txt).width + 12;
    const bx = align === 'center' ? x - w / 2 : x - w;
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.roundRect(bx, y - 10, w, 20, 5);
    ctx.fill();
    ctx.fillStyle = fg;
    ctx.textAlign = 'center';
    ctx.fillText(txt, bx + w / 2, y + 4);
  }

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    if (!active || document.hidden || W === 0) return;

    pS += (p - pS) * (opts.reduced ? 1 : 0.08);
    if (!Number.isFinite(pS)) pS = p;
    const k = opts.reduced ? 1 : 0.1;
    line.a += (target.a - line.a) * k;
    line.b += (target.b - line.b) * k;
    line.sd += (target.sd - line.sd) * k;
    const drawFrac = easeInOut(clamp((pS - 0.55) / 0.4));

    const ink = cssVar('--ink'), muted = cssVar('--muted'), lineC = cssVar('--line'), accent = cssVar('--accent');
    const soft = cssVar('--accent-soft'), noise = cssVar('--noise'), card = cssVar('--card'), accentInk = cssVar('--accent-ink');

    ctx.clearRect(0, 0, W, H);
    ctx.font = '11px "JetBrains Mono", ui-monospace, monospace';
    ctx.lineWidth = 1;

    // grid + ticks
    for (let gx = 0; gx <= XMAX; gx += 2) {
      ctx.strokeStyle = lineC;
      ctx.beginPath(); ctx.moveTo(sx(gx), M.t); ctx.lineTo(sx(gx), M.t + ph()); ctx.stroke();
      ctx.fillStyle = muted; ctx.textAlign = 'center';
      ctx.fillText(String(gx), sx(gx), H - M.b + 16);
    }
    for (let gy = 0; gy <= YMAX; gy += 2) {
      ctx.strokeStyle = lineC;
      ctx.beginPath(); ctx.moveTo(M.l, sy(gy)); ctx.lineTo(M.l + pw(), sy(gy)); ctx.stroke();
      ctx.fillStyle = muted; ctx.textAlign = 'right';
      ctx.fillText(String(gy), M.l - 8, sy(gy) + 4);
    }
    ctx.textAlign = 'right';
    ctx.fillText('messy data →', M.l + pw(), H - 4);
    ctx.save(); ctx.translate(11, M.t); ctx.rotate(-Math.PI / 2); ctx.fillText('clarity →', 0, 0); ctx.restore();

    // band + regression line
    if (drawFrac > 0) {
      const x1 = XMAX * drawFrac, band = 1.96 * line.sd;
      ctx.save();
      ctx.beginPath(); ctx.rect(M.l, M.t, pw(), ph()); ctx.clip();
      ctx.globalAlpha = drawFrac;
      ctx.fillStyle = soft;
      ctx.beginPath();
      ctx.moveTo(sx(0), sy(line.a + band));
      ctx.lineTo(sx(x1), sy(line.a + line.b * x1 + band));
      ctx.lineTo(sx(x1), sy(line.a + line.b * x1 - band));
      ctx.lineTo(sx(0), sy(line.a - band));
      ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = accent; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(sx(0), sy(line.a)); ctx.lineTo(sx(x1), sy(line.a + line.b * x1)); ctx.stroke();
      ctx.restore();
    }

    // points
    const drawn: { X: number; Y: number; x: number; y: number }[] = [];
    for (const pt of base) {
      const t = easeInOut(clamp((pS - pt.d) / 0.6));
      const wob = opts.reduced ? 0 : (1 - t) * 0.25;
      const x = pt.nx + (pt.x - pt.nx) * t + Math.sin(now / 700 + pt.ph) * wob;
      const y = pt.ny + (pt.y - pt.ny) * t + Math.cos(now / 900 + pt.ph) * wob;
      const X = sx(x), Y = sy(y);
      drawn.push({ X, Y, x, y });
      ctx.fillStyle = t > 0.98 ? ink : noise;
      ctx.globalAlpha = 0.45 + 0.45 * t;
      ctx.beginPath(); ctx.arc(X, Y, 3.2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    for (const pt of user) {
      const X = sx(pt.x), Y = sy(pt.y);
      drawn.push({ X, Y, x: pt.x, y: pt.y });
      const age = opts.reduced ? 1 : (now - pt.born) / 1000;
      const s = age < 0.35 ? 1 + Math.sin((age / 0.35) * Math.PI) * 0.8 : 1;
      if (age < 0.8) {
        ctx.strokeStyle = accent; ctx.globalAlpha = 1 - age / 0.8; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(X, Y, 4 + age * 40, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1;
      }
      ctx.fillStyle = accent;
      ctx.beginPath(); ctx.arc(X, Y, 4.5 * s, 0, Math.PI * 2); ctx.fill();
    }

    // crosshair
    if (mouse.in) {
      let snap: (typeof drawn)[number] | null = null;
      let best = SNAP_PX;
      for (const d of drawn) {
        const dist = Math.hypot(d.X - mouse.x, d.Y - mouse.y);
        if (dist < best) { best = dist; snap = d; }
      }
      const cx = snap ? snap.X : mouse.x, cy = snap ? snap.Y : mouse.y;
      const vx = snap ? snap.x : ix(mouse.x), vy = snap ? snap.y : iy(mouse.y);
      const formed = drawFrac > 0.9;

      ctx.setLineDash([4, 4]); ctx.strokeStyle = muted; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, M.t); ctx.lineTo(cx, M.t + ph());
      ctx.moveTo(M.l, cy); ctx.lineTo(M.l + pw(), cy);
      ctx.stroke(); ctx.setLineDash([]);

      if (snap && formed) {
        ctx.strokeStyle = accent; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, sy(line.a + line.b * vx)); ctx.stroke();
      }
      tag(vx.toFixed(2), cx, H - M.b + 12, 'center', accent, accentInk);
      tag(vy.toFixed(2), M.l - 2, cy, 'right', accent, accentInk);

      if (snap) {
        ctx.strokeStyle = accent; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cx, cy, 7, 0, Math.PI * 2); ctx.stroke();
        const rows = [`x  ${vx.toFixed(2)}`, `y  ${vy.toFixed(2)}`];
        if (formed) {
          const res = vy - (line.a + line.b * vx);
          rows.push(`ε  ${res >= 0 ? '+' : '−'}${Math.abs(res).toFixed(2)}`);
        }
        const bw = 104, bh = 14 + rows.length * 16;
        let bx = cx + 14, by = cy - bh - 10;
        if (bx + bw > W - M.r) bx = cx - bw - 14;
        if (by < M.t) by = cy + 14;
        ctx.fillStyle = card; ctx.strokeStyle = lineC; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 8); ctx.fill(); ctx.stroke();
        ctx.fillStyle = ink; ctx.textAlign = 'left';
        rows.forEach((row, i) => ctx.fillText(row, bx + 12, by + 19 + i * 16));
      }
    }
  }
  raf = requestAnimationFrame(frame);

  return {
    setProgress(next) { p = opts.reduced ? 1 : clamp(Number.isFinite(next) ? next : 0); },
    setActive(a) { active = a; },
    reset() { user = []; refit(); },
    destroy() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('click', onClick);
    },
  };
}
