import { useEffect, useRef, useState } from 'react';
import { createPlot, type PlotHandle } from './plotRenderer';
import { progressFrom, type FitResult } from '../../lib/stats';
import { prefersReducedMotion } from '../../lib/env';
import { site } from '../../content/site';
import './hero.css';

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const barRef = useRef<HTMLElement>(null);
  const plotRef = useRef<PlotHandle | null>(null);
  const [stats, setStats] = useState<FitResult | null>(null);
  const [flash, setFlash] = useState(0);
  const [formed, setFormed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current!, section = sectionRef.current!;
    const reduced = prefersReducedMotion();
    let first = true;
    const plot = createPlot(canvas, {
      reduced,
      onStats: (s) => { setStats(s); if (!first) setFlash((f) => f + 1); first = false; },
      onPointerInPlot: (inside) => document.body.classList.toggle('is-chart', inside),
    });
    plotRef.current = plot;

    const onScroll = () => {
      const r = section.getBoundingClientRect();
      const p = reduced ? 1 : progressFrom(r.top, r.height, window.innerHeight);
      plot.setProgress(p);
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      setFormed(p > 0.97);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    const io = new IntersectionObserver(([e]) => plot.setActive(e.isIntersecting));
    io.observe(section);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      io.disconnect();
      plot.destroy();
      document.body.classList.remove('is-chart');
    };
  }, []);

  const sign = stats && stats.b < 0 ? '−' : '+';

  return (
    <section className="hero" id="top" ref={sectionRef} aria-label="Introduction">
      <div className="hero-sticky">
        <div className="hero-glow" aria-hidden="true"><i /><i /></div>
        <div className="hero-copy">
          <p className="eyebrow enter" style={{ ['--d' as string]: '0ms' }}>{site.role}</p>
          <h1 className="hero-name" aria-label={site.name}>
            {[...site.name].map((ch, i) => (
              <span key={i} className="ch" aria-hidden="true" style={{ ['--i' as string]: i }}>
                {ch === ' ' ? ' ' : ch}
              </span>
            ))}
          </h1>
          <p className="hero-tagline enter" style={{ ['--d' as string]: '520ms' }}>
            I find the{' '}
            <span className="sig">
              <em>signal</em>
              <svg viewBox="0 0 120 14" preserveAspectRatio="none" aria-hidden="true">
                <path d="M3 9 C 30 3, 62 12, 90 6 S 114 5, 117 8" pathLength={1} />
              </svg>
            </span>
            <br />
            in messy data.
          </p>
          <p className="hero-intro enter" style={{ ['--d' as string]: '640ms' }}>{site.intro}</p>
          <div className="hero-ctas enter" style={{ ['--d' as string]: '760ms' }}>
            <a className="btn primary" href="#work" data-cursor="link" data-magnetic>See my work ↓</a>
            <a className="btn" href={site.resume} target="_blank" rel="noopener" data-cursor="link" data-magnetic>Résumé</a>
          </div>
          <div className="hero-hint mono enter" style={{ ['--d' as string]: '880ms' }} aria-hidden="true">
            <span className="hero-hint-bar"><i ref={barRef} /></span>
            <span>{formed ? 'Now click the chart to add a point' : 'Scroll to find the signal'}</span>
          </div>
        </div>

        <figure className="plot plot-enter">
          <figcaption className="plot-head mono">
            <span><b>fig. 1</b> — from noise to signal</span>
            <span key={`n${flash}`} className={flash ? 'flash' : ''}>n = {stats?.n ?? '—'}</span>
          </figcaption>
          <canvas
            ref={canvasRef}
            className="plot-canvas"
            role="img"
            aria-label="Scatter plot where random noise settles into a linear trend with a fitted regression line. Click to add points and refit."
          />
          <div className="plot-foot mono">
            <div className="plot-stats" key={`s${flash}`}>
              <span className={`eq ${flash ? 'flash' : ''}`}>
                ŷ = <b>{stats ? `${stats.a.toFixed(2)} ${sign} ${Math.abs(stats.b).toFixed(2)}x` : '—'}</b>
              </span>
              <span className={flash ? 'flash' : ''}>R² <b>{stats ? stats.r2.toFixed(3) : '—'}</b></span>
            </div>
            <button className="plot-reset" type="button" data-cursor="link" onClick={() => plotRef.current?.reset()}>
              reset
            </button>
          </div>
        </figure>
      </div>
    </section>
  );
}
