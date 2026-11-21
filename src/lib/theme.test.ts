import { describe, expect, it } from 'vitest';
import { getInitialTheme, saveTheme } from './theme';

const mem = (init: Record<string, string> = {}) => {
  const data = { ...init };
  return {
    getItem: (k: string) => data[k] ?? null,
    setItem: (k: string, v: string) => { data[k] = v; },
    data,
  } as unknown as Storage & { data: Record<string, string> };
};
const throwing = {
  getItem: () => { throw new Error('blocked'); },
  setItem: () => { throw new Error('blocked'); },
} as unknown as Storage;

describe('theme', () => {
  it('prefers the stored theme', () => {
    expect(getInitialTheme(mem({ theme: 'dark' }), false)).toBe('dark');
    expect(getInitialTheme(mem({ theme: 'light' }), true)).toBe('light');
  });
  it('falls back to the system preference', () => {
    expect(getInitialTheme(mem(), true)).toBe('dark');
    expect(getInitialTheme(mem({ theme: 'nonsense' }), false)).toBe('light');
    expect(getInitialTheme(null, true)).toBe('dark');
  });
  it('survives storage that throws', () => {
    expect(getInitialTheme(throwing, true)).toBe('dark');
    expect(() => saveTheme(throwing, 'light')).not.toThrow();
  });
  it('saves the theme', () => {
    const s = mem();
    saveTheme(s, 'dark');
    expect(s.data.theme).toBe('dark');
  });
});
