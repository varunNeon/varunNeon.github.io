const mq = (q: string) => typeof window !== 'undefined' && window.matchMedia(q).matches;

export const prefersReducedMotion = () => mq('(prefers-reduced-motion: reduce)');
export const isFinePointer = () => mq('(pointer: fine)');

/** Read a CSS custom property from :root (canvas renderers call this each frame so theme switches apply instantly). */
export const cssVar = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();
