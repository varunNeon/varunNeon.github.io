import { describe, expect, it } from 'vitest';
import { fit, makeDataset, progressFrom } from './stats';

describe('fit', () => {
  it('recovers an exact line', () => {
    const r = fit([{ x: 0, y: 1 }, { x: 1, y: 3 }, { x: 2, y: 5 }]);
    expect(r.a).toBeCloseTo(1);
    expect(r.b).toBeCloseTo(2);
    expect(r.r2).toBeCloseTo(1);
    expect(r.n).toBe(3);
  });

  it('stays finite with a single point', () => {
    const r = fit([{ x: 3, y: 4 }]);
    expect(Number.isFinite(r.a)).toBe(true);
    expect(r.b).toBe(0);
    expect(r.r2).toBe(0);
  });

  it('stays finite when every x is equal', () => {
    const r = fit([{ x: 2, y: 1 }, { x: 2, y: 5 }, { x: 2, y: 9 }]);
    expect(r.a).toBeCloseTo(5);
    expect(r.b).toBe(0);
    expect(r.r2).toBe(0);
    expect(Number.isFinite(r.sd)).toBe(true);
  });
});

describe('makeDataset', () => {
  it('is deterministic and in range', () => {
    const a = makeDataset();
    expect(a).toEqual(makeDataset());
    expect(a).toHaveLength(72);
    for (const p of a) {
      expect(p.x).toBeGreaterThanOrEqual(0.4);
      expect(p.x).toBeLessThanOrEqual(9.6);
      expect(p.y).toBeGreaterThanOrEqual(0.3);
      expect(p.y).toBeLessThanOrEqual(11.7);
      expect(p.nx).toBeGreaterThanOrEqual(0);
      expect(p.nx).toBeLessThanOrEqual(10);
      expect(p.ny).toBeGreaterThanOrEqual(0);
      expect(p.ny).toBeLessThanOrEqual(12);
    }
  });
});

describe('progressFrom', () => {
  it('returns 0 when there is no scroll span (never NaN)', () => {
    expect(progressFrom(-500, 1000, 1000)).toBe(0);
    expect(progressFrom(0, 0, 0)).toBe(0);
  });
  it('maps scroll position with the 1.25 lead and clamps', () => {
    expect(progressFrom(-400, 1800, 800)).toBeCloseTo(0.5);
    expect(progressFrom(200, 1800, 800)).toBe(0);
    expect(progressFrom(-5000, 1800, 800)).toBe(1);
  });
});
