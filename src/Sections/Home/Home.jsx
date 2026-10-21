import Banner from '../../Components/Banner/Banner';
import './Home.scss';

function Home() {
  const scrollToSection = (event, sectionId) => {
    event.preventDefault();
    const element =
      typeof document !== 'undefined'
        ? document.getElementById(sectionId)
        : null;

    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
            I design and build responsive, accessible web applications across
            the full stack. On the front end, I work in React and React Router
            with strict separation of concerns and clean SASS architecture; on
            the back end, I model data and expose secure REST APIs with
            Node.js, Express, and MongoDB.
          </p>
          <p className="home-intro-text">
            Accessibility and performance are non-negotiable: every project is
            measured with Lighthouse, audited for WCAG fundamentals, and
            tuned to load fast on any device.
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