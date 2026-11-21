export type Project = {
  id: 'demandiq' | 'gitpulse' | 'indiafin';
  index: string;
  title: string;
  kicker: string;
  problem: string;
  built: string[];
  shows: string;
  stack: string[];
  links: { label: string; href: string }[];
  chart: 'forecast' | 'impact' | 'price';
  shot: string;
  /** What the browser frame around the screenshot shows (defaults to the first link's address). */
  shotLabel?: string;
};

export const projects: Project[] = [
  {
    id: 'demandiq',
    index: '01',
    title: 'DemandIQ',
    kicker: 'Forecasting · Machine learning',
    problem:
      'A forecast is only useful if you know how wrong it might be. How much stock should a store order when tomorrow’s demand is uncertain?',
    built: [
      'Four forecasting models (naive, seasonal naive, Holt-Winters ETS and direct multi-horizon LightGBM) compared in a 12-window rolling-origin backtest, 14 days ahead.',
      'Calibrated 80% and 95% prediction intervals, with how often reality actually landed inside them measured and reported, not assumed.',
      'An inventory planner that turns the forecast band into a reorder point, a projected stock path and a six-month simulation of what each service level costs.',
    ],
    shows:
      'LightGBM cuts forecast error by 39% against the naive baseline (WAPE 23.3% vs 38.0%) and is the most accurate model on 97 of 100 store–product series. Benchmarked on two years of synthetic daily sales.',
    stack: ['Python', 'pandas', 'LightGBM', 'statsmodels', 'scikit-learn', 'FastAPI', 'Next.js', 'Streamlit'],
    links: [{ label: 'Code', href: 'https://github.com/varunNeon/DemandIQ' }],
    chart: 'forecast',
    shot: '/shots/demandiq.jpg',
    shotLabel: 'demandiq · forecast workspace',
  },
  {
    id: 'gitpulse',
    index: '02',
    title: 'GitPulse',
    kicker: 'Data engineering · Analytics',
    problem:
      'The AI/ML open-source world moves too fast to follow by hand. Which repositories are actually gaining momentum?',
    built: [
      'A daily ETL pipeline on GitHub Actions that pulls repositories across 8 AI/ML topics from the GitHub API, then cleans and deduplicates them.',
      'A PostgreSQL star schema (dimension and daily fact tables) that keeps one snapshot per repo per day, so trends build up over time.',
      'A composite impact score (0.5 × star velocity + 0.3 × fork score + 0.2 × issue score) and statistical anomaly flags for unusual growth.',
    ],
    shows:
      'A live Streamlit dashboard with leaderboards, star-growth trends, hidden gems and anomaly alerts, refreshed automatically every morning.',
    stack: ['Python', 'pandas', 'PostgreSQL', 'SQLAlchemy', 'GitHub Actions', 'Streamlit', 'Plotly'],
    links: [
      { label: 'Live dashboard', href: 'https://gitpulse-varun.streamlit.app/' },
      { label: 'Code', href: 'https://github.com/varunNeon/GitPulse' },
    ],
    chart: 'impact',
    shot: '/shots/gitpulse.jpg',
  },
  {
    id: 'indiafin',
    index: '03',
    title: 'IndiaFin',
    kicker: 'Time series · Dashboards',
    problem:
      'Price charts alone hide what matters. How do you read momentum, risk and co-movement across Indian stocks at a glance?',
    built: [
      'A data layer that fetches and normalises NSE price history for 8 companies (Reliance, TCS, Infosys, HDFC Bank and more), with retries.',
      'Time-series features: 7- and 30-day moving averages, daily returns, and rolling 7-day volatility.',
      'MA crossover momentum signals and a returns correlation matrix across the watchlist.',
    ],
    shows:
      'An interactive market desk where you pick a stock and a 1-, 3- or 6-month window, then follow trend, volatility and volume through linked charts.',
    stack: ['Python', 'pandas', 'yfinance', 'Streamlit', 'Plotly'],
    links: [
      { label: 'Live dashboard', href: 'https://indiafin.streamlit.app/' },
      { label: 'Code', href: 'https://github.com/varunNeon/IndiaFin' },
    ],
    chart: 'price',
    shot: '/shots/indiafin.jpg',
  },
];
