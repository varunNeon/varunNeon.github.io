import { projects, type Project } from '../../content/projects';
import { useInView } from '../Reveal';
import { ImpactChart } from './charts/ImpactChart';
import { PriceChart } from './charts/PriceChart';
import './work.css';

const CHARTS = { impact: ImpactChart, price: PriceChart } as const;

function CaseStudy({ project, flip }: { project: Project; flip: boolean }) {
  const [ref, inView] = useInView<HTMLElement>();
  const Chart = CHARTS[project.chart];
  const primary = project.links[0];

  return (
    <article ref={ref} className={`case reveal ${inView ? 'in' : ''} ${flip ? 'flip' : ''}`}>
      <a className="case-visual" href={primary.href} target="_blank" rel="noopener" data-cursor="case" aria-label={`${project.title}: ${primary.label}`}>
        <Chart active={inView} />
        <div className="case-shot" aria-hidden="true">
          <div className="case-shot-bar mono">
            <i /><i /><i />
            <span>{primary.href.replace('https://', '').replace(/\/$/, '')}</span>
          </div>
          <img src={project.shot} alt="" loading="lazy" width="800" height="500" />
        </div>
        <span className="case-illustrative mono">
          <span className="lbl-chart">illustrative data · hover for the real thing</span>
          <span className="lbl-shot">live dashboard ↗</span>
        </span>
      </a>
      <div className="case-body">
        <p className="eyebrow">{project.index} · {project.kicker}</p>
        <h3 className="case-title">{project.title}</h3>
        <p className="case-problem">{project.problem}</p>
        <ul className="case-built">
          {project.built.map((b) => <li key={b}>{b}</li>)}
        </ul>
        <p className="case-shows"><span className="mono">→</span> {project.shows}</p>
        <div className="case-stack">{project.stack.map((s) => <span key={s} className="chip">{s}</span>)}</div>
        <div className="case-links">
          {project.links.map((l, i) => (
            <a key={l.href} className={`btn ${i === 0 ? 'primary' : ''}`} href={l.href} target="_blank" rel="noopener" data-cursor="link" data-magnetic>
              {l.label} ↗
            </a>
          ))}
        </div>
      </div>
    </article>
  );
}

export function Work() {
  return (
    <section className="section" id="work" aria-labelledby="work-title">
      <p className="eyebrow">Selected work</p>
      <h2 className="section-title" id="work-title">Two pipelines, <em>live</em> and running.</h2>
      <div className="cases">
        {projects.map((p, i) => <CaseStudy key={p.id} project={p} flip={i % 2 === 1} />)}
      </div>
    </section>
  );
}
