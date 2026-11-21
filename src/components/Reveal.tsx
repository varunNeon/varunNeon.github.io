import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react';

type Props = { as?: ElementType; className?: string; delay?: number; children: ReactNode; onReveal?: () => void };

/** Fades content up once when it enters the viewport. Text starts at 15% opacity, never fully hidden. */
export function Reveal({ as: Tag = 'div', className = '', delay = 0, children, onReveal }: Props) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) { setInView(true); onReveal?.(); io.disconnect(); }
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [onReveal]);

  return (
    <Tag ref={ref} className={`reveal ${inView ? 'in' : ''} ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </Tag>
  );
}

export function useInView<T extends Element>(rootMargin = '0px 0px -15% 0px') {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); io.disconnect(); } }, { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);
  return [ref, inView] as const;
}
