import { site, timeline, toolGroups } from '../content/site';
import { Reveal } from './Reveal';

export function About() {
  return (
    <section className="section" id="about" aria-labelledby="about-title">
      <p className="eyebrow">About</p>
      <h2 className="section-title" id="about-title">From statistics to systems <em>people trust</em>.</h2>

      <div className="about-grid">
        <Reveal className="about-intro">
          <img className="about-photo" src={site.photo} alt="Portrait of Varun Lal" width="320" height="320" loading="lazy" />
          <p>
            I started with statistics, got hooked on what data can reveal about the real world, and kept going deeper into the tools that make those
            insights usable. My work sits between analytics, automation and storytelling: shaping noisy data into a dashboard someone can rely on, or
            building a pipeline that keeps it fresh without anyone touching it.
          </p>
        </Reveal>

        <ol className="timeline">
          {timeline.map((t, i) => (
            <Reveal as="li" key={t.title} className="timeline-item" delay={i * 80}>
              <span className="timeline-dot" aria-hidden="true" />
              <p className="eyebrow">{t.when}</p>
              <h3>{t.title}</h3>
              <p className="timeline-text">{t.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>

      <div className="tools">
        {toolGroups.map((g, i) => (
          <Reveal key={g.name} className="tool-group" delay={i * 70}>
            <p className="eyebrow">{g.name}</p>
            <ul>{g.tools.map((t) => <li key={t}>{t}</li>)}</ul>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
