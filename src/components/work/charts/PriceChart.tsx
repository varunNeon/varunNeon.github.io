import { useMemo } from 'react';
import { gauss, makeRng } from '../../../lib/stats';

const N = 120, W = 560, H = 400, PAD = { l: 8, r: 8, t: 44, b: 32 };

function movingAverage(xs: number[], w: number) {
  return xs.map((_, i) => {
    const s = xs.slice(Math.max(0, i - w + 1), i + 1);
    return s.reduce((a, b) => a + b, 0) / s.length;
  });
}

/** Illustrative price series with real MA7 / MA30 maths and the first bullish crossover marked. */
export function PriceChart({ active }: { active: boolean }) {
  const { price, ma7, ma30, cross, toX, toY } = useMemo(() => {
    const rng = makeRng(42);
    const price: number[] = [];
    let v = 100;
    for (let i = 0; i < N; i++) {
      const drift = i < 45 ? -0.28 : 0.42;
      v = Math.max(60, v + drift + gauss(rng) * 1.6);
      price.push(v);
    }
    const ma7 = movingAverage(price, 7), ma30 = movingAverage(price, 30);
    let cross = -1;
    for (let i = 31; i < N; i++) if (ma7[i - 1] <= ma30[i - 1] && ma7[i] > ma30[i]) { cross = i; break; }
    const lo = Math.min(...price) - 4, hi = Math.max(...price) + 4;
    const toX = (i: number) => PAD.l + (i / (N - 1)) * (W - PAD.l - PAD.r);
    const toY = (y: number) => PAD.t + (1 - (y - lo) / (hi - lo)) * (H - PAD.t - PAD.b);
    return { price, ma7, ma30, cross, toX, toY };
  }, []);

  const path = (ys: number[]) => ys.map((y, i) => `${i ? 'L' : 'M'}${toX(i).toFixed(1)} ${toY(y).toFixed(1)}`).join('');
  const area = `${path(price)}L${toX(N - 1)} ${H - PAD.b}L${toX(0)} ${H - PAD.b}Z`;

  const last = N - 1;
  const rets = price.slice(-8).map((v, i, a) => (i ? (v / a[i - 1] - 1) * 100 : 0)).slice(1);
  const mean = rets.reduce((a, b) => a + b, 0) / rets.length;
  const vol = Math.sqrt(rets.reduce((a, b) => a + (b - mean) ** 2, 0) / (rets.length - 1));
  const facts = [
    { k: 'Close', v: `₹${price[last].toFixed(1)}` },
    { k: 'MA7', v: ma7[last].toFixed(1) },
    { k: 'MA30', v: ma30[last].toFixed(1) },
    { k: '7d vol', v: `${vol.toFixed(2)}%` },
  ];

  return (
    <div className={`chart-frame ${active ? 'on' : ''}`}>
      <div className="chart-frame-head mono">
        <span><b>NSE watchlist</b> · momentum</span>
        <span className="chart-pills" aria-hidden="true"><i>1M</i><i>3M</i><i className="on">6M</i></span>
      </div>
      {svg()}
      <dl className="chart-facts mono">
        {facts.map((f) => <div key={f.k}><dt>{f.k}</dt><dd>{f.v}</dd></div>)}
        <div><dt>Signal</dt><dd className="up">Bullish ↑</dd></div>
      </dl>
    </div>
  );

  function svg() {
  return (
    <svg className={`chart ${active ? 'on' : ''}`} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Illustrative stock price with 7-day and 30-day moving averages and a bullish crossover marked">
      <defs>
        <linearGradient id="pc-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--accent)" stopOpacity="0.18" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1={PAD.l} x2={W - PAD.r} y1={PAD.t + f * (H - PAD.t - PAD.b)} y2={PAD.t + f * (H - PAD.t - PAD.b)} stroke="var(--line)" />
      ))}
      <path d={area} fill="url(#pc-fill)" className="chart-fade" />
      <path d={path(price)} fill="none" stroke="var(--ink)" strokeOpacity="0.35" strokeWidth="1.2" pathLength={1} className="chart-draw" />
      <path d={path(ma30)} fill="none" stroke="var(--muted)" strokeWidth="2" strokeDasharray="5 5" className="chart-fade" />
      <path d={path(ma7)} fill="none" stroke="var(--accent)" strokeWidth="2.5" pathLength={1} className="chart-draw d2" />
      {cross > 0 && (
        <g className="chart-pop" transform={`translate(${toX(cross)} ${toY(ma7[cross])})`}>
          <circle r="11" fill="var(--accent-soft)" />
          <circle r="5" fill="var(--accent)" />
          <line y1="-12" y2="-40" stroke="var(--accent)" strokeDasharray="2 3" />
          <text x="0" y="-46" textAnchor="middle" className="chart-label strong halo">MA7 crosses above MA30</text>
        </g>
      )}
      <g className="chart-legend">
        <text x={PAD.l} y={H - 8} className="chart-label">— price</text>
        <text x={PAD.l + 70} y={H - 8} className="chart-label accent">— MA7</text>
        <text x={PAD.l + 130} y={H - 8} className="chart-label">- - MA30</text>
      </g>
    </svg>
  );
  }
}
