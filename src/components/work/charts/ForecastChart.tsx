import { useMemo } from 'react';
import { gauss, makeRng } from '../../../lib/stats';

const HIST = 40, AHEAD = 14, N = HIST + AHEAD;
const W = 560, H = 360, PAD = { l: 8, r: 8, t: 36, b: 30 };

/**
 * Illustrative daily demand with weekly seasonality, then a 14-day forecast with
 * widening 80% and 95% prediction bands (the shape DemandIQ produces).
 * The stats row underneath is DemandIQ's real benchmark result.
 */
export function ForecastChart({ active }: { active: boolean }) {
  const { obs, fc, lo80, hi80, lo95, hi95, toX, toY } = useMemo(() => {
    const rng = makeRng(7);
    const weekly = [0.82, 0.9, 0.95, 1.0, 1.12, 1.32, 1.18];
    const level = (i: number) => 150 + i * 0.55;
    const obs: number[] = [];
    for (let i = 0; i < HIST; i++) obs.push(Math.max(20, level(i) * weekly[i % 7] + gauss(rng) * 22));
    const fc: number[] = [], lo80: number[] = [], hi80: number[] = [], lo95: number[] = [], hi95: number[] = [];
    for (let k = 0; k <= AHEAD; k++) {
      const i = HIST - 1 + k;
      const m = k === 0 ? obs[HIST - 1] : level(i) * weekly[i % 7];
      const s = k === 0 ? 0 : 16 + k * 2.4;
      fc.push(m); lo80.push(m - 1.28 * s); hi80.push(m + 1.28 * s); lo95.push(m - 1.96 * s); hi95.push(m + 1.96 * s);
    }
    const all = [...obs, ...lo95, ...hi95];
    const lo = Math.min(...all) - 10, hi = Math.max(...all) + 10;
    const toX = (i: number) => PAD.l + (i / (N - 1)) * (W - PAD.l - PAD.r);
    const toY = (y: number) => PAD.t + (1 - (y - lo) / (hi - lo)) * (H - PAD.t - PAD.b);
    return { obs, fc, lo80, hi80, lo95, hi95, toX, toY };
  }, []);

  const line = (ys: number[], start: number) => ys.map((y, k) => `${k ? 'L' : 'M'}${toX(start + k).toFixed(1)} ${toY(y).toFixed(1)}`).join('');
  const band = (los: number[], his: number[]) => {
    const top = his.map((y, k) => `${k ? 'L' : 'M'}${toX(HIST - 1 + k).toFixed(1)} ${toY(y).toFixed(1)}`).join('');
    const bottom = los.map((_, k) => los.length - 1 - k).map((k) => `L${toX(HIST - 1 + k).toFixed(1)} ${toY(los[k]).toFixed(1)}`).join('');
    return `${top}${bottom}Z`;
  };
  const originX = toX(HIST - 1);

  return (
    <div className={`chart-frame ${active ? 'on' : ''}`}>
      <div className="chart-frame-head mono">
        <span><b>Demand forecast</b> · 14 days ahead</span>
        <span className="chart-pills" aria-hidden="true"><i>Naive</i><i>ETS</i><i className="on">LightGBM</i></span>
      </div>
      <svg className={`chart ${active ? 'on' : ''}`} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Illustrative daily demand followed by a 14-day forecast with 80% and 95% prediction intervals that widen further ahead">
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={PAD.l} x2={W - PAD.r} y1={PAD.t + f * (H - PAD.t - PAD.b)} y2={PAD.t + f * (H - PAD.t - PAD.b)} stroke="var(--line)" />
        ))}
        <path d={line(obs, 0)} fill="none" stroke="var(--ink)" strokeOpacity="0.55" strokeWidth="1.5" pathLength={1} className="chart-draw" />
        <line x1={originX} x2={originX} y1={PAD.t - 8} y2={H - PAD.b} stroke="var(--muted)" strokeDasharray="3 4" className="chart-fade" />
        <text x={originX - 6} y={PAD.t - 14} textAnchor="end" className="chart-label chart-fade">forecast origin</text>
        <g className="chart-band">
          <path d={band(lo95, hi95)} fill="var(--accent)" fillOpacity="0.12" />
          <path d={band(lo80, hi80)} fill="var(--accent)" fillOpacity="0.22" />
        </g>
        <path d={line(fc, HIST - 1)} fill="none" stroke="var(--accent)" strokeWidth="2.5" pathLength={1} className="chart-draw d3" />
        <g className="chart-legend">
          <text x={PAD.l} y={H - 8} className="chart-label">— observed</text>
          <text x={PAD.l + 92} y={H - 8} className="chart-label accent">— forecast</text>
          <text x={PAD.l + 184} y={H - 8} className="chart-label">▮ 80% / 95% interval</text>
        </g>
      </svg>
      <dl className="chart-facts mono">
        <div><dt>WAPE</dt><dd>23.3%</dd></div>
        <div><dt>vs naive</dt><dd className="up">−39%</dd></div>
        <div><dt>Best on</dt><dd>97/100</dd></div>
        <div><dt>Backtest</dt><dd>12 windows</dd></div>
      </dl>
    </div>
  );
}
