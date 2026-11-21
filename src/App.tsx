import { Cursor } from './components/cursor/Cursor';
import { Intro } from './components/intro/Intro';
import { Nav } from './components/Nav';
import { Hero } from './components/hero/Hero';
import { Work } from './components/work/Work';
import { About } from './components/About';
import { Contact, Footer } from './components/Contact';

export function App() {
  return (
    <>
      <Cursor />
      <Nav />
      <main>
        <Hero />
        <Work />
        <About />
        <Contact />
      </main>
      <Footer />
      <div className="grain" aria-hidden="true" />
      <Intro />
    </>
  );
}
