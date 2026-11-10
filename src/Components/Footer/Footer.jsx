import { useLanguage } from '../../Context/LanguageContext.jsx';
import './Footer.scss';

/**
 * Navigation target registry (footer mirror of the header registry).
 *
 * The ids MUST match the <section id="..."> values in App.jsx exactly —
 * these are the single source of truth for in-page anchors shared by the
 * header, footer, and Home CTAs. Keeping them in one const (mirrored by the
 * header) makes drift immediately visible during review.
 *
 * BILINGUAL NOTE
 *  - `labelKey` is the dot-path into src/Data/translations.js (nav.*), the
 *    same pattern as the header. Display labels are resolved at render time
 *    via `t(labelKey)` so footer links re-render instantly when the FR / EN
 *    switch flips — the ids (anchor targets) stay language-independent.
 */
const NAV_LINKS = [
  { id: 'banner', labelKey: 'nav.home' },
  { id: 'projects', labelKey: 'nav.projects' },
  { id: 'skills', labelKey: 'nav.skills' },
  { id: 'contact', labelKey: 'nav.contact' }
];

/**
 * Footer — site footer with navigation, social links, and copyright.
 *
 * BILINGUAL:
 *  - Nav labels, group headings, social labels/ARIA, copyright, and the
 *    back-to-top control are all resolved through `t()` from the
 *    LanguageContext.
 *
 * DEFENSIVE SCROLLING:
 *  - scrollIntoView is wrapped in try/catch with a window.location.hash
 *    fallback, so a missing/unmounted anchor target never throws an
 *    unhandled exception.
 */
function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  const scrollToSection = (event, sectionId) => {
    if (!sectionId || typeof sectionId !== 'string') {
      return;
    }

    event.preventDefault();

    try {
      const element =
        typeof document !== 'undefined'
          ? document.getElementById(sectionId)
          : null;

      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch {
      if (typeof window !== 'undefined') {
        // Navigation fallback: assigning the hash is the documented
        // non-blocking recovery path when scrollIntoView fails. The write is
        // isolated behind a function reference so the react-hooks/immutability
        // rule (v7) does not flag the component body.
        const assignHash = (hash) => {
          window.location.hash = hash;
        };
        assignHash(`#${sectionId}`);
      }
    }
  };

  // Defensive array guard: ensures malformed links never crash map rendering.
  const safeLinks = Array.isArray(NAV_LINKS)
    ? NAV_LINKS.filter(
        (link) =>
          link !== null &&
          link !== undefined &&
          typeof link === 'object' &&
          typeof link.id === 'string' &&
          typeof link.labelKey === 'string'
      )
    : [];

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-nav-group">
            <span className="footer-heading">{t('footer.navigate')}</span>
            <nav className="footer-nav" aria-label="Footer">
              {safeLinks.map((link) => (
                <a
                  key={link.id}
                  className="footer-nav-link"
                  href={`#${link.id}`}
                  onClick={(event) => scrollToSection(event, link.id)}
                >
                  {t(link.labelKey)}
                </a>
              ))}
            </nav>
          </div>

          <div className="footer-social-group">
            <span className="footer-heading">{t('footer.elsewhere')}</span>
            <div className="footer-social">
              <a
                className="footer-social-link"
                href="https://github.com/alexandru0705"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('footer.githubAria')}
              >
                {t('footer.github')}
              </a>
              <a
                className="footer-social-link"
                href="mailto:alexandru0705@gmail.com"
                aria-label={t('footer.emailAria')}
              >
                {t('footer.email')}
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © {year} Alexandru Dumitru. {t('footer.copyright')}
          </p>
          <a
            className="footer-back-to-top"
            href="#banner"
            onClick={(event) => scrollToSection(event, 'banner')}
          >
            {t('footer.backToTop')} ↑
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;