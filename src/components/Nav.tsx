import { useEffect, useState } from 'react';
import { getInitialTheme, safeLocalStorage, saveTheme, type Theme } from '../lib/theme';
import { site } from '../content/site';

const LINKS = [
  { id: 'work', label: 'Work' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
];

function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() =>
    getInitialTheme(safeLocalStorage(), window.matchMedia('(prefers-color-scheme: dark)').matches),
  );
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0e0f11' : '#f6f4ef');
  }, [theme]);
  const next: Theme = theme === 'dark' ? 'light' : 'dark';
  return (
    <button
      type="button"
      className="theme-toggle"
      data-cursor="link"
      aria-label={`Switch to ${next} theme`}
      onClick={() => { setTheme(next); saveTheme(safeLocalStorage(), next); }}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 4a8 8 0 0 1 0 16Z" fill="currentColor" />
      </svg>
    </button>
  );
}

export function Nav() {
  const [active, setActive] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const els = LINKS.map((l) => document.getElementById(l.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    els.forEach((el) => io.observe(el));
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      const first = els[0];
      if (first && first.getBoundingClientRect().top > window.innerHeight * 0.5) setActive('');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { io.disconnect(); window.removeEventListener('scroll', onScroll); };
  }, []);

  return (
    <header className={`nav ${scrolled ? 'scrolled' : ''}`}>
      <a className="nav-brand" href="#top" data-cursor="link">{site.name}</a>
      <nav className="nav-links" aria-label="Sections">
        {LINKS.map((l) => (
          <a key={l.id} href={`#${l.id}`} className={active === l.id ? 'active' : ''} data-cursor="link">
            {l.label}
          </a>
        ))}
        <a className="nav-resume" href={site.resume} target="_blank" rel="noopener" data-cursor="link">Résumé</a>
        <ThemeToggle />
      </nav>
    </header>
  );
}
