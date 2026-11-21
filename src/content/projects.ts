export type Project = {
  id: 'gitpulse' | 'indiafin';
  index: string;
  title: string;
  kicker: string;
  problem: string;
  built: string[];
  shows: string;
  stack: string[];
  links: { label: string; href: string }[];
  chart: 'impact' | 'price';
};

export const projects: Project[] = [
  {
    id: 'gitpulse',
    index: '01',
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
      { label: 'Live dashboard', href: 'https://gitpulse-64rqmapppv4wwlu8qpghuam.streamlit.app/' },
      { label: 'Code', href: 'https://github.com/varunNeon/GitPulse' },
    ],
    chart: 'impact',
  },
  {
    id: 'indiafin',
    index: '02',
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
      { label: 'Live dashboard', href: 'https://indiafin-mf9orp8gbadok3wzmxppj7.streamlit.app/' },
      { label: 'Code', href: 'https://github.com/varunNeon/IndiaFin' },
    ],
    chart: 'price',
  },
];
