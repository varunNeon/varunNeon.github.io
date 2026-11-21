import { describe, expect, it } from 'vitest';
import { projects } from './projects';

describe('projects', () => {
  it('lists DemandIQ, GitPulse and IndiaFin in that order', () => {
    expect(projects.map((p) => p.id)).toEqual(['demandiq', 'gitpulse', 'indiafin']);
    expect(projects.map((p) => p.index)).toEqual(['01', '02', '03']);
  });
  it('has well-formed content', () => {
    for (const p of projects) {
      expect(p.built.length).toBeGreaterThanOrEqual(2);
      expect(p.stack.length).toBeGreaterThan(0);
      for (const l of p.links) expect(l.href.startsWith('https://')).toBe(true);
    }
  });
});
