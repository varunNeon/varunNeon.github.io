# Portfolio rebuild — "From noise to signal"

**Date:** 2026-11-21 · **Site:** https://varunneon.github.io/ · **Repo:** varunNeon/varunNeon.github.io

## Why

The current site is a green-on-black "hacker terminal" theme (VL.exe, matrix characters, all-monospace). Varun is targeting **Data Analyst / Junior Data Scientist** roles. The people reading the site are recruiters and hiring managers, and the theme reads "sysadmin," not "analyst." The site also has no charts at all, text-only project cards with no results, padded stats ("10K+ rows", "1 Research Pipelines"), and scroll fades so dark that headings are unreadable mid-scroll.

The original React source is lost. Only the built bundle exists (`gh-pages` branch, mirrored in local `dist/`). `main` holds just a README. So this is a full rebuild, and this time the source must live on `main`.

**Success:** a recruiter skimming for 30 seconds comes away with "this person does real data work and thinks like an analyst," and the interactive hero is memorable enough to mention.

## Goals

- An editorial, premium look built around one idea: the site is itself a data story, "from noise to signal" (Varun's own line about messy data clicking).
- Show data skills visually: an interactive statistical hero and a chart in every case study.
- A signature custom cursor (living dot grid) that feels data-native and doesn't fight the content.
- Real projects presented as short case studies, with the strongest work first.
- Fast, readable and fully usable on phones.
- Source saved to `main`, with a repeatable deploy.

## Non-goals

- No blog, CMS, backend or contact form (a mailto link and a copy-email button are enough).
- No multi-page routing or separate case-study pages in v1.
- No keeping or porting anything from the terminal theme.

## Anti-goals (a failure even if it works)

- Animation that makes text hard to read, or content that is invisible until an animation finishes.
- A heavy, slow site: target **≤ 150 KB of gzipped JS** and a Lighthouse performance score of 90+ on mobile.
- Motion that ignores `prefers-reduced-motion`, or a cursor effect that runs on touch devices.
- Made-up numbers presented as real results.

## Approaches considered

1. **Vite + React + TypeScript, hand-written CSS with design tokens, canvas for the hero and the cursor grid, small inline SVGs for case-study charts.** Matches the old site's stack and the `gh-pages` deploy already in use. The prototype ports almost directly. *Chosen.*
2. **Plain HTML/CSS/JS, no framework.** The smallest output and simplest deploy, but it gets harder to maintain as sections and case-study overlays grow, and it gives up the React skills recruiters may look for in the repo.
3. **Next.js static export with Tailwind and D3.** Overkill for a one-page site. D3 alone would eat most of the JS budget, and static export on GitHub Pages adds friction for no gain.

## Design

### Visual system

- **Colours** as CSS tokens on `:root`, with a dark set under `[data-theme="dark"]`. Light: background `#f6f4ef`, ink `#16161a`, muted `#6f6d68`, lines `#dedad1`, accent `#2f5bff`. Dark: background `#0e0f11`, ink `#ecebe7`, accent `#7d9bff`. Exact values are in `prototype/index.html`.
- **Theme:** follow the system setting on first visit, provide a ◐ toggle, and remember the choice in `localStorage` (wrapped in try/catch).
- **Type:** Instrument Serif for display headings, Inter for body text, JetBrains Mono for small labels and chart text only.
- **Shape:** 20px radius cards, 1px hairline borders, soft long shadows, pill buttons.

### Page structure (single page)

1. **Nav:** "Varun Lal" wordmark, links to Work / About / Contact, theme toggle, Résumé link. Sticky with a translucent blurred background. The active-section indicator slides between links.
2. **Hero, "From noise to signal"** (ported from `prototype/index.html`):
   - Left column: eyebrow "Data Analyst · MSc Data Science", name, italic tagline "I find the *signal* in messy data.", one-line intro, buttons "See my work" and "Résumé", and a scroll progress hint.
   - Right column: the plot card. ~72 grey points start as random noise; as you scroll through a ~250vh pinned section, they settle into a scatter plot, then an OLS regression line and a 95% band draw in.
   - Inside the plot: crosshair cursor, value tags on the axes, snapping to the nearest point with a tooltip (x, y, residual ε), and a residual line to the fit.
   - Click adds a point; the line refits live, and the equation, R² and n update. A "reset" button clears added points.
   - With reduced motion, the hero shows the finished signal state immediately.
3. **Work:** two case studies, each a full-width card (chart on one side, text on the other, alternating sides).
   - **GitPulse:** an automated daily ETL tracking AI/ML repos across 8 topics, a PostgreSQL star schema, an impact score (0.5 star velocity + 0.3 fork score + 0.2 issue score), and anomaly detection on GitHub Actions. Chart: a horizontal bar breakdown of the impact score's three weighted parts. Links: live demo and GitHub.
   - **IndiaFin:** a market desk for 8 NSE stocks with MA7/MA30 crossovers, rolling volatility and a returns correlation matrix. Chart: a price line with MA7 and MA30, and a marked crossover point. Links: live demo and GitHub.
   - **Each card has:** title, one-line problem, 2–3 "what I built" bullets, a "what it shows" line, stack chips, and links. Charts draw themselves when scrolled into view.
   - **Mini chart data:** illustrative shapes, labelled "illustrative" in small text, never presented as real output.
   - The card component must make adding a third project later a data-only change (DemandIQ is planned once it has a public demo).
4. **About:** a short paragraph adapted from the current site, then a timeline (Statistics degree → MSc Data Science & Analytics, Jain University → now building forecasting and pipeline projects / open to roles). The profile photo is recovered from `dist/varun-profile.jpeg`. Tools are grouped: **Analysis** (Python, pandas, SQL, Jupyter), **Data** (PostgreSQL, Supabase, yfinance, REST APIs), **Visualisation** (Power BI, Streamlit, Plotly, Excel), **Workflow** (GitHub, GitHub Actions, VS Code).
5. **Contact:** "Currently open to Data Analyst and Junior Data Scientist roles." Buttons for copy email (with a "Copied" confirmation), LinkedIn (linkedin.com/in/varunnlal), GitHub (github.com/varunNeon) and Résumé (`Varun-Lal-Resume.pdf`, recovered from `dist/`).
6. **Footer:** name, year, and "Built with React, by me."

### Custom cursor: living dot grid (from `prototype/cursors.html`, style 4)

- A full-viewport canvas behind the content draws a faint dot grid (28px spacing).
- Dots within ~170px of the cursor swell, light up in the accent colour and push away gently. Click sends out a ripple ring through the grid.
- On top, a small cursor dot with an eased follow ring:
  - over links and buttons, the ring grows with a soft accent fill;
  - over project cards, it becomes a filled accent "View →" bubble.
- Inside the hero plot, the cursor becomes the crosshair (the ring hides).
- Buttons are magnetic: they pull slightly toward the cursor.
- **Performance:** draw only the visible viewport, pause when the tab is hidden, skip redraws while the mouse is idle and no ripple is running, and cap the device pixel ratio at 2.
- **Fallbacks:**
  - Touch devices (`pointer: coarse`): no custom cursor and no grid interaction; the static faint grid stays as texture.
  - Reduced motion: the grid lights up without push or ripples, and the ring follows instantly.

### Motion elsewhere

- Sections fade in with a short rise (≤ 400ms, starting at 0.0–0.2 opacity, never invisible for long). Text is always readable within a few hundred milliseconds.
- Headings reveal word by word on first view.
- Smooth anchor scrolling.

### Tech and repo

- **Stack:** Vite + React 18 + TypeScript. Plain CSS (one tokens file plus per-component CSS). Framer Motion only for reveals, if it fits the JS budget; otherwise IntersectionObserver with CSS. No D3 or UI kit.
- **Source on `main`**, with `.gitignore` covering `node_modules/` and `dist/`.
- **Deploy:** `npm run deploy` builds and publishes `dist/` to the `gh-pages` branch using the `gh-pages` package, keeping `.nojekyll`. GitHub Pages already serves from `gh-pages`.
- **Assets:** favicons from `public/favicon_io/`; resume and photo copied out of `dist/` into `public/` before `dist/` is regenerated.
- **Head:** title, description, Open Graph and Twitter tags, plus an `og:image` (a 1200×630 PNG of the hero in light mode).
- `prototype/` stays as a reference during the build and is deleted at the end.

## Left to the builder

- Exact component breakdown and file layout.
- Final copy wording within the content above (keep it plain and specific; no buzzwords).
- Illustrative data shapes for the mini charts.
- How the og:image is produced (a screenshot of the built hero is fine).

## Decided by Varun

- Rebuild with a new identity, dropping the terminal theme.
- The "noise to signal" interactive regression hero, exactly as in the prototype.
- The living dot grid cursor (style 4).
- Use the GitPulse and IndiaFin projects (details taken from their READMEs).

- Projects: GitPulse and IndiaFin only. Malayalam script recognition removed. DemandIQ deferred until it has a public demo.
- GitPulse live dashboard confirmed working; link it.

## Calls I made (Varun to check)

- Drop the stats row entirely.
- Light-first look, following the system theme with a toggle.
- Result numbers: none are invented. If Varun supplies real figures (repos tracked, days of history), they go in the "what it shows" lines.
- Tools list drops TensorFlow/OpenCV/LightGBM (no project on the page uses them now).
