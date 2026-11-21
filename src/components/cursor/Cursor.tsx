import { useEffect, useRef } from 'react';
import { createGrid } from './gridRenderer';
import { isFinePointer, prefersReducedMotion } from '../../lib/env';
import './cursor.css';

export function Cursor() {
  const backRef = useRef<HTMLCanvasElement>(null);
  const frontRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const interactive = isFinePointer();
    const reduced = prefersReducedMotion();
    const grid = createGrid(backRef.current!, frontRef.current!, { interactive, reduced });
    if (interactive) document.body.classList.add('has-cursor');

    // magnetic buttons (delegated so elements rendered later are covered too)
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || reduced) return;
      const el = (e.target as Element).closest?.('[data-magnetic]') as HTMLElement | null;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
    };
    const onOut = (e: PointerEvent) => {
      const el = (e.target as Element).closest?.('[data-magnetic]') as HTMLElement | null;
      if (el && !el.contains(e.relatedTarget as Node)) el.style.transform = '';
    };
    if (interactive) {
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerout', onOut);
    }
    return () => {
      grid.destroy();
      document.body.classList.remove('has-cursor');
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerout', onOut);
    };
  }, []);

  return (
    <>
      <canvas ref={backRef} className="cursor-grid" aria-hidden="true" />
      <canvas ref={frontRef} className="cursor-head" aria-hidden="true" />
    </>
  );
}
