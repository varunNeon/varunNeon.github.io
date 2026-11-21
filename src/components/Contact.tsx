import { useEffect, useRef, useState } from 'react';
import { site } from '../content/site';
import { Reveal, useInView } from './Reveal';

export function Contact() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number>();
  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${site.email}`;
    }
  }

  return (
    <section className="section contact" id="contact" aria-labelledby="contact-title">
      <Reveal>
        <p className="eyebrow">Contact</p>
        <h2 className="contact-title" id="contact-title">
          Have messy data?
          <br />
          <em>Let’s find the signal.</em>
        </h2>
        <p className="contact-sub">Currently open to Data Analyst and Junior Data Scientist roles.</p>
        <div className="contact-actions">
          <button type="button" className="btn primary contact-copy" onClick={copyEmail} data-cursor="link" data-magnetic aria-live="polite">
            {copied ? 'Copied ✓' : site.email}
          </button>
          <a className="btn" href={site.linkedin} target="_blank" rel="noopener" data-cursor="link" data-magnetic>LinkedIn ↗</a>
          <a className="btn" href={site.github} target="_blank" rel="noopener" data-cursor="link" data-magnetic>GitHub ↗</a>
          <a className="btn" href={site.resume} target="_blank" rel="noopener" data-cursor="link" data-magnetic>Résumé ↗</a>
        </div>
      </Reveal>
    </section>
  );
}

export function Footer() {
  const [ref, inView] = useInView<HTMLDivElement>('0px 0px -5% 0px');
  return (
    <footer className="footer-wrap">
      <div className="footer mono">
        <span>© {new Date().getFullYear()} {site.name}</span>
        <a href="#top" data-cursor="link">Back to top ↑</a>
      </div>
      <div ref={ref} className={`wordmark ${inView ? 'in' : ''}`} aria-hidden="true">
        {[...site.name].map((ch, i) => (
          <span key={i} style={{ ['--i' as string]: i }}>{ch === ' ' ? ' ' : ch}</span>
        ))}
      </div>
    </footer>
  );
}
