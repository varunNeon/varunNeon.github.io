export type Pt = { x: number; y: number };
export type DataPoint = Pt & { nx: number; ny: number; d: number; ph: number };
export type FitResult = { a: number; b: number; r2: number; sd: number; n: number };

export const XMAX = 10;
export const YMAX = 12;

export const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Ordinary least squares fit of y on x. Degenerate inputs return a flat line, never NaN. */
export function fit(pts: Pt[]): FitResult {
  const n = pts.length;
  if (n === 0) return { a: 0, b: 0, r2: 0, sd: 0, n: 0 };
  const mx = pts.reduce((s, p) => s + p.x, 0) / n;
  const my = pts.reduce((s, p) => s + p.y, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (const p of pts) {
    sxy += (p.x - mx) * (p.y - my);
    sxx += (p.x - mx) ** 2;
    syy += (p.y - my) ** 2;
  }
  const b = sxx > 1e-12 ? sxy / sxx : 0;
  const a = my - b * mx;
  let sse = 0;
  for (const p of pts) sse += (p.y - a - b * p.x) ** 2;
  const r2 = sxx > 1e-12 && syy > 1e-12 ? 1 - sse / syy : 0;
  return { a, b, r2, sd: Math.sqrt(sse / Math.max(1, n - 2)), n };
}

/** Park–Miller PRNG: deterministic so the hero looks the same on every visit. */
export function makeRng(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

export function gauss(rng: () => number): number {
  let u = 0;
  while (!u) u = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rng());
}

export function makeDataset(seed = 11, n = 72): DataPoint[] {
  const rng = makeRng(seed);
  return Array.from({ length: n }, () => {
    const x = 0.4 + rng() * 9.2;
    const y = clamp(1.3 + 0.78 * x + gauss(rng) * 0.9, 0.3, 11.7);
    return { nx: rng() * XMAX, ny: rng() * YMAX, x, y, d: rng() * 0.3, ph: rng() * Math.PI * 2 };
  });
}

/** Scroll progress through a pinned section, reaching 1 a little before the end. */
export function progressFrom(top: number, height: number, viewport: number): number {
  const span = height - viewport;
  if (!(span > 0)) return 0;
  return clamp((-top / span) * 1.25);
}
