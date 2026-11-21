const W = 560, H = 290;
const LABEL_W = 132, BAR_X = 140, BAR_W = W - BAR_X - 50;

// Illustrative normalised components (0–1) for five fictional repos; score = 0.5s + 0.3f + 0.2i.
const ROWS = [
  { name: 'llm-toolkit', s: 0.96, f: 0.62, i: 0.88 },
  { name: 'vision-zoo', s: 0.71, f: 0.84, i: 0.52 },
  { name: 'mlops-kit', s: 0.48, f: 0.95, i: 0.41 },
  { name: 'tiny-transformer', s: 0.55, f: 0.38, i: 0.66 },
  { name: 'data-flow', s: 0.31, f: 0.57, i: 0.24 },
]
  .map((r) => ({ ...r, parts: [0.5 * r.s, 0.3 * r.f, 0.2 * r.i] }))
  .map((r) => ({ ...r, score: r.parts[0] + r.parts[1] + r.parts[2] }))
  .sort((a, b) => b.score - a.score);

const COLORS = ['var(--accent)', 'color-mix(in srgb, var(--accent) 55%, var(--card))', 'color-mix(in srgb, var(--accent) 25%, var(--card))'];

export function ImpactChart({ active }: { active: boolean }) {
  const rowH = 40, top = 44;
  return (
    <div className={`chart-frame ${active ? 'on' : ''}`}>
      <div className="chart-frame-head mono">
        <span><b>Impact leaderboard</b> · daily snapshot</span>
        <span className="chart-live" aria-hidden="true"><i /> live</span>
      </div>
      <svg className={`chart ${active ? 'on' : ''}`} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Illustrative impact score breakdown for five repositories: star velocity, fork score and issue score stacked into a composite score">
      <g className="chart-legend">
        {['star velocity ×0.5', 'fork score ×0.3', 'issue score ×0.2'].map((t, i) => (
          <g key={t} transform={`translate(${BAR_X + i * 128} 14)`}>
            <rect width="10" height="10" rx="2" fill={COLORS[i]} />
            <text x="16" y="9" className="chart-label">{t}</text>
          </g>
        ))}
      </g>
      {ROWS.map((r, ri) => {
        let x = BAR_X;
        return (
          <g key={r.name} transform={`translate(0 ${top + ri * rowH})`}>
            <text x={LABEL_W} y="17" textAnchor="end" className="chart-label strong">{r.name}</text>
            <rect x={BAR_X} y="4" width={BAR_W} height="18" rx="4" fill="var(--line)" opacity="0.5" />
            {r.parts.map((p, pi) => {
              const w = p * BAR_W;
              const el = (
                <rect
                  key={pi}
                  x={x} y="4" width={w} height="18" rx={pi === 0 ? 4 : 0}
                  fill={COLORS[pi]}
                  className="chart-bar"
                  style={{ transitionDelay: `${ri * 90 + pi * 140}ms` }}
                />
              );
              x += w;
              return el;
            })}
            <text x={BAR_X + r.score * BAR_W + 8} y="17" className="chart-label chart-fade" style={{ transitionDelay: `${ri * 90 + 500}ms` }}>
              {r.score.toFixed(2)}
            </text>
          </g>
        );
      })}
      </svg>
      <dl className="chart-facts mono">
        <div><dt>Topics</dt><dd>8</dd></div>
        <div><dt>Refresh</dt><dd>06:00 IST</dd></div>
        <div><dt>Warehouse</dt><dd>PostgreSQL</dd></div>
        <div><dt>Runs on</dt><dd>Actions</dd></div>
      </dl>
    </div>
  );
}
