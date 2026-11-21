# Portfolio Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild varunneon.github.io as the "From noise to signal" single-page portfolio, with source on `main` and deploy to `gh-pages`.

**Architecture:** Vite + React + TypeScript SPA. Pure logic (stats, theme, project data) lives in `src/lib` and `src/content` with unit tests. Two canvas renderers (hero plot, dot-grid cursor) are plain TS modules driven by a React wrapper that owns the lifecycle. Styling is plain CSS with tokens.

**Tech Stack:** Vite 5, React 18.3.1, TypeScript 5, Vitest, gh-pages. No UI kit, no D3, no Framer Motion (IntersectionObserver + CSS for reveals).

**Spec:** `docs/superpowers/specs/2026-11-21-portfolio-rebuild-design.md`. Visual reference: `prototype/index.html` (hero) and `prototype/cursors.html` (style 4 = grid).

## Global Constraints

- Tokens: light `--bg #f6f4ef`, `--ink #16161a`, `--muted #6f6d68`, `--line #dedad1`, `--accent #2f5bff`; dark `--bg #0e0f11`, `--ink #ecebe7`, `--accent #7d9bff` (rest as in prototype).
- Fonts: Instrument Serif (display), Inter (body), JetBrains Mono (labels/chart text only).
- JS budget ≤ 150 KB gzipped.
- Every animation respects `prefers-reduced-motion`; custom cursor only when `(pointer: fine)`.
- No invented result numbers; mini charts carry a small "illustrative" label.
- `localStorage` access always in try/catch.
- Projects: GitPulse, IndiaFin only.
- Links: email `varunlal3099@gmail.com`, LinkedIn `https://www.linkedin.com/in/varunnlal/`, GitHub `https://github.com/varunNeon`, GitPulse demo `https://gitpulse-64rqmapppv4wwlu8qpghuam.streamlit.app/`, IndiaFin demo `https://indiafin-mf9orp8gbadok3wzmxppj7.streamlit.app/`, repos `/GitPulse`, `/IndiaFin`.

## Review Focus

- Hero canvas measured before layout (0 height) → progress must never become NaN (bug seen in prototype). Test: `progressFrom` returns 0 when span ≤ 0.
- Fit with < 2 points or all-equal x (user clicks a vertical stack) → no NaN/Infinity in equation. Test in `stats.test.ts`.
- `localStorage` throws (private mode) → theme still works. Test in `theme.test.ts`.
- Touch device → no custom cursor, native cursor not hidden. Verified in browser at mobile preset.
- Window resize / theme switch mid-animation → canvases redraw at the new size and colours. Verified in browser.

---

### Task 1: Scaffold project and recover assets

**Files:** Create `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `.gitignore`, `src/main.tsx`, `src/App.tsx`, `src/styles/tokens.css`, `src/styles/base.css`; move `dist/Varun-Lal-Resume.pdf`, `dist/varun-profile.jpeg` → `public/`.

- [ ] Copy resume and photo from `dist/` into `public/` **before** anything regenerates `dist/`.
- [ ] `package.json` scripts: `dev`, `build` (`tsc -b && vite build`), `preview`, `test` (`vitest run`), `deploy` (`npm run build && gh-pages -d dist --dotfiles`). Add `public/.nojekyll`.
- [ ] `.gitignore`: `node_modules/`, `dist/`.
- [ ] `index.html`: title "Varun Lal — Data Analyst", description, OG + Twitter tags (`og:image` → `/og-image.png`), favicons from `/favicon_io/`, Google Fonts link.
- [ ] Run `npm install`, `npm run build`. Expected: build succeeds.

### Task 2: Stats and theme logic (TDD)

**Files:** Create `src/lib/stats.ts`, `src/lib/stats.test.ts`, `src/lib/theme.ts`, `src/lib/theme.test.ts`, `src/lib/env.ts`.

**Produces:**
- `type Pt = { x: number; y: number }`
- `fit(pts: Pt[]): { a: number; b: number; r2: number; sd: number; n: number }`
- `makeRng(seed: number): () => number`, `gauss(rng): number`
- `makeDataset(seed = 11, n = 72): DataPoint[]` where `DataPoint = Pt & { nx; ny; d; ph }` (x∈[0.4,9.6], y = 1.3 + 0.78x + N(0,0.9) clamped to [0.3,11.7]; nx∈[0,10], ny∈[0,12]; d∈[0,0.3])
- `progressFrom(top: number, height: number, viewport: number): number` → `clamp(-top/(height-viewport)*1.25)`, 0 when span ≤ 0
- `type Theme = 'light'|'dark'`; `getInitialTheme(storage: Storage|null, prefersDark: boolean): Theme`; `saveTheme(storage: Storage|null, t: Theme): void`
- `env.ts`: `prefersReducedMotion(): boolean`, `isFinePointer(): boolean`

- [ ] Tests: `fit([{0,1},{1,3},{2,5}])` → a=1, b=2, r2=1; `fit` of 1 point and of 3 points with equal x → finite a, b=0, r2=0; `makeDataset()` is deterministic (two calls equal) and has 72 points in range; `progressFrom(-500, 1000, 1000)` = 0, `progressFrom(-400, 1800, 800)` = 0.5, never NaN; `getInitialTheme` uses stored value, falls back to prefersDark, and survives a storage whose `getItem` throws; `saveTheme` swallows a throwing `setItem`.
- [ ] Run `npm test` → fail; implement; run → pass.

### Task 3: Content data

**Files:** Create `src/content/projects.ts`, `src/content/projects.test.ts`, `src/content/site.ts`.

**Produces:** `type Project = { id: 'gitpulse'|'indiafin'; title; problem; built: string[]; shows; stack: string[]; links: { label: string; href: string }[]; chart: 'impact'|'price' }`, `projects: Project[]`; `site` = `{ name, role, tagline, intro, email, linkedin, github, resume: '/Varun-Lal-Resume.pdf' }`.

- [ ] Test: exactly 2 projects, ids unique, every href starts with `https://`, each has ≥2 `built` bullets.
- [ ] Copy written from the GitPulse / IndiaFin READMEs (spec §Work).

### Task 4: Hero — noise to signal

**Files:** Create `src/components/hero/plotRenderer.ts`, `src/components/hero/Hero.tsx`, `src/components/hero/hero.css`.

**Consumes:** `fit`, `makeDataset`, `progressFrom`, `prefersReducedMotion`.
**Produces:** `createPlot(canvas: HTMLCanvasElement, opts: { reduced: boolean; onStats(s: FitResult): void }): { setProgress(p: number): void; reset(): void; destroy(): void }`; `<Hero />`.

- [ ] Port prototype rendering (grid, ticks, axis labels, band, line draw at drawFrac = ease((p−0.55)/0.4), point morph, crosshair with snap ≤16px, axis tags, tooltip x/y/ε, residual line, click-to-add with pop + ripple, line tween 0.1/frame). Colours read from CSS vars each frame. ResizeObserver; DPR cap 2; rAF stops on destroy and pauses when `document.hidden`.
- [ ] Hero toggles `body.is-chart` while the pointer is inside the plot area (cursor hides its ring).
- [ ] Verify in browser: noise at top, signal after scroll, click adds point and equation updates, reset works.

### Task 5: Dot-grid cursor

**Files:** Create `src/components/cursor/gridRenderer.ts`, `src/components/cursor/Cursor.tsx`, `src/components/cursor/cursor.css`.

**Produces:** `createGrid(back: HTMLCanvasElement, front: HTMLCanvasElement, opts: { interactive: boolean; reduced: boolean }): { destroy(): void }`; `<Cursor />` mounted once in `App`.

- [ ] Port prototype style 4: gap 28, radius 170, f², push 14px, click ripple 600px/s lifetime 1.1s; head dot + eased ring (k 0.2); `[data-cursor="link"]` → ring 24px larger, accent fill; `[data-cursor="case"]` → filled accent bubble with "View →"; `body.is-chart` → ring hidden.
- [ ] Skip redraw when mouse idle and no ripple active; pause on `document.hidden`.
- [ ] Non-fine pointer: static faint grid drawn once (and on resize), no head, native cursor visible. Reduced: no push, no ripple, ring k=1.
- [ ] `[data-magnetic]` buttons translate (dx·0.25, dy·0.35), reset on leave (fine pointer only).

### Task 6: Layout sections

**Files:** Create `src/components/Nav.tsx`, `ThemeToggle.tsx`, `Reveal.tsx`, `work/Work.tsx`, `work/CaseStudy.tsx`, `work/charts/ImpactChart.tsx`, `work/charts/PriceChart.tsx`, `About.tsx`, `Contact.tsx`, `Footer.tsx`, matching CSS files.

- [ ] Nav: sticky blurred, active-section indicator via IntersectionObserver, Résumé link.
- [ ] ThemeToggle uses `getInitialTheme`/`saveTheme`, sets `document.documentElement.dataset.theme`; an inline script in `index.html` sets the theme before paint.
- [ ] Reveal: opacity 0.15→1 + 16px rise, ≤400ms, once; reduced → no transform.
- [ ] CaseStudy: alternating chart/text sides; card has `data-cursor="case"`, links have `data-cursor="link"`. Charts are inline SVG drawn via `stroke-dashoffset` on reveal; "illustrative" label.
- [ ] About: paragraph, timeline (3 steps), grouped tools (spec §About), photo `/varun-profile.jpeg`.
- [ ] Contact: copy-email button (Clipboard API, falls back to `mailto:`; "Copied" state for 2s), LinkedIn, GitHub, Résumé.
- [ ] Mobile ≤860px: single column, hero `200vh`, canvas height 300px.

### Task 7: Verify, OG image, deploy setup

- [ ] `npm test`, `npm run build` pass; gzipped JS ≤150 KB (check build output).
- [ ] Browser check at desktop and mobile presets, both themes: no console errors, hero, cursor, links, copy email.
- [ ] Screenshot built hero (light, 1200×630) → `public/og-image.png`; rebuild.
- [ ] Delete `prototype/`. Commit and `npm run deploy` only with Varun's go-ahead.
