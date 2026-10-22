import Banner from '../../Components/Banner/Banner';
import './Home.scss';

/**
 * Home — top-level landing section wrapper.
 *
 * LAYOUT MECHANICS
 *  - Pairs with Home.scss to structure the hero viewport: delegates header
 *    presentation directly to <Banner />, followed by introductory bio copy
 *    and quick-action navigation CTAs.
 *
 * DEFENSIVE SCROLLING
 *  - Implements smooth in-page routing via scrollIntoView, shielded by a
 *    null guard and try/catch error fallback to ensure target navigation
 *    never crashes if an anchor ID is conditionally unmounted or missing.
 */
function Home() {
  const scrollToSection = (event, sectionId) => {
    if (!sectionId || typeof sectionId !== 'string') {
      return;
    }

    try {
      const element =
        typeof document !== 'undefined'
          ? document.getElementById(sectionId)
          : null;

      if (element) {
        event.preventDefault();
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (err) {
      if (typeof window !== 'undefined') {
        window.location.hash = `#${sectionId}`;
      }
    }
  };

  return (
    <div className="home-section">
      <Banner />

      <div className="home-intro">
        <div className="home-intro-copy">
          <h2 className="home-intro-heading">
            End-to-end web engineering, from first pixel to production
          </h2>
          <p className="home-intro-text">
            I'm Alex, a 50-year-old web developer based in Paris.
            I build responsive, accessible web applications across
            the full stack—combining clean component architecture
            in React and SASS with secure REST APIs in Node.js, Express, and MongoDB.
          </p>
          <p className="home-intro-text">
            Accessibility and performance are non-negotiable: every project is
            measured with Lighthouse, audited for WCAG fundamentals, and tuned to
            load fast on any device.
          </p>
          <p className="home-intro-text">
            Driven by clean, maintainable architecture and modular workflows,
            I approach development with a craftsman's discipline—prioritizing
            robust design patterns, scalable data modeling, and code that is built to last.
          </p>
        </div>

        <div className="home-actions">
          <a
            className="home-action home-action--primary"
            href="#projects"
            onClick={(event) => scrollToSection(event, 'projects')}
          >
            View Projects
          </a>
          <a
            className="home-action home-action--secondary"
            href="#contact"
            onClick={(event) => scrollToSection(event, 'contact')}
          >
            Get in Touch
          </a>
        </div>
      </div>
    </div>
  );
}

export default Home;