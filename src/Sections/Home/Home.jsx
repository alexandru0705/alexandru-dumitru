import Banner from '../../Components/Banner/Banner';
import { useLanguage } from '../../Context/LanguageContext.jsx';
import './Home.scss';

/**
 * Home — top-level landing section wrapper.
 *
 * LAYOUT MECHANICS
 *  - Pairs with Home.scss to structure the hero viewport: delegates header
 *    presentation directly to <Banner />, followed by introductory bio copy
 *    and quick-action navigation CTAs.
 *
 * LANGUAGE CONSUMPTION
 *  - All intro copy (heading, the three bio paragraphs) and the action
 *    button labels are resolved through `t()` from the LanguageContext,
 *    so the second viewport re-renders in sync with the FR / EN switch.
 *    No hardcoded display copy remains in this component.
 *  - The CV PDF is referenced through `import.meta.env.BASE_URL` so the
 *    link stays valid when the site is served from a GitHub Pages subpath
 *    (root-relative "/AlexD_CV.pdf" would 404 in production).
 *
 * DEFENSIVE SCROLLING
 *  - Implements smooth in-page routing via scrollIntoView, shielded by a
 *    null guard and try/catch error fallback to ensure target navigation
 *    never crashes if an anchor ID is conditionally unmounted or missing.
 */
function Home() {
  const { t } = useLanguage();

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
    } catch {
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
            {t('home.introHeading')}
          </h2>
          <p className="home-intro-text">{t('home.bioOne')}</p>
          <p className="home-intro-text">{t('home.bioTwo')}</p>
          <p className="home-intro-text">{t('home.bioThree')}</p>
        </div>

        <div className="home-actions">
          <a
            className="home-action home-action--primary"
            href="#projects"
            onClick={(event) => scrollToSection(event, 'projects')}
          >
            {t('actions.viewProjects')}
          </a>
          <a
            className="home-action home-action--secondary"
            href="#contact"
            onClick={(event) => scrollToSection(event, 'contact')}
          >
            {t('actions.getInTouch')}
          </a>
          <a
            className="home-action home-action--tertiary"
            href={`${import.meta.env.BASE_URL}AlexD_CV.pdf`}
            target="_blank"
            rel="noreferrer"
          >
            {t('actions.cv')}
          </a>
        </div>
      </div>
    </div>
  );
}

export default Home;