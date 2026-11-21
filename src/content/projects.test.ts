import { describe, expect, it } from 'vitest';
import { projects } from './projects';

describe('projects', () => {
  it('lists exactly GitPulse and IndiaFin with unique ids', () => {
    expect(projects.map((p) => p.id)).toEqual(['gitpulse', 'indiafin']);
  });
  it('has well-formed content', () => {
    for (const p of projects) {
      expect(p.built.length).toBeGreaterThanOrEqual(2);
      expect(p.stack.length).toBeGreaterThan(0);
      for (const l of p.links) expect(l.href.startsWith('https://')).toBe(true);
    }
  });
});
