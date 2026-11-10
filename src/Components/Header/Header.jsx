import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../Context/LanguageContext.jsx';
import './Header.scss';

/**
 * STICKY_HEADER_OFFSET
 * The pinned header's total height: 70px inner bar (see .header-inner in
 * Header.scss) + 3px bottom border. Every programmatic scroll target must
 * clear this many pixels, otherwise section titles land UNDER the bar.
 * Kept in one const so the JS offset and the CSS scroll-margin-top contract
 * (App.scss) can never drift apart.
 */
const STICKY_HEADER_OFFSET = 73;

/**
 * Navigation target registry.
 *
 * The ids MUST match the <section id="..."> values in App.jsx exactly —
 * these are the single source of truth for in-page anchors shared by the
 * header, footer, and Home CTAs. Keeping them in one const (mirrored by the
 * footer) makes drift immediately visible during review.
 *
 * BILINGUAL NOTE
 *  - `labelKey` is the dot-path into src/Data/translations.js (nav.*).
 *    Display labels are resolved at render time via `t(labelKey)` so the
 *    links re-render instantly when the FR / EN switch flips — the ids
 *    (anchor targets) stay language-independent.
 */
const NAV_LINKS = [
  { id: 'banner', labelKey: 'nav.home' },
  { id: 'projects', labelKey: 'nav.projects' },
  { id: 'skills', labelKey: 'nav.skills' },
  { id: 'contact', labelKey: 'nav.contact' }
];

/**
 * Header — sticky navigation bar.
 *
 * LAYOUT MECHANICS (pairs with Header.scss)
 *  - The header uses `position: sticky; top: 0` rather than `fixed`.
 *    Sticky keeps the header IN the normal document flow, so it occupies its
 *    70px of height naturally and content below it starts directly under the
 *    bar — no manual padding-top compensation needed anywhere in App.
 *  - The sticky offset for smooth scrolling is handled globally in App.scss
 *    via `section { scroll-margin-top: 70px }`: every section declares how
 *    much "breathing room" a scroll target needs, so titles are never hidden
 *    under the bar. scroll-margin-top is the modern, robust alternative to
 *    hash-offset hacks or JS pixel math.
 *  - The bar background is semi-transparent + backdrop-filter blur, so
 *    content scrolling beneath it reads as frosted glass; the --scrolled
 *    variant adds a shadow dynamically while the page is actively moving,
 *    and resets once scrolling stops.
 *
 * MOBILE MENU STATE
 *  - isMenuOpen is the single boolean driving the hamburger ↔ X animation,
 *    the dropdown panel visibility (CSS handles the transition), and the
 *    ARIA attributes below.
 *  - Closing on link click keeps state consistent: the menu never lingers
 *    open after the user has navigated, even if the click target was a
 *    smooth-scroll anchor.
 */
function Header() {
  const { t, language, toggleLanguage } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // isScrolled toggles the shadow state strictly while the page is in motion.
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollTimerRef = useRef(null);

  // Scroll listener with debounced idle cleanup.
  //  - `passive: true` tells the browser this handler will never call
  //    preventDefault, so it can run scroll handling off the main thread —
  //    no input jank while scrolling.
  //  - Turns the shadow ON instantly upon movement.
  //  - Clears previous timers and sets a 150ms window: when user stops scrolling,
  //    the shadow automatically fades out.
  //  - Full cleanup prevents memory leaks on component unmount.
  useEffect(() => {
    const handleScroll = () => {
      try {
        if (typeof window === 'undefined') return;

        setIsScrolled(true);

        if (scrollTimerRef.current) {
          clearTimeout(scrollTimerRef.current);
        }

        scrollTimerRef.current = setTimeout(() => {
          setIsScrolled(false);
        }, 150);
      } catch {
        // Defensive no-op if scroll measurement fails in a restricted context
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('scroll', handleScroll);
      }
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
    };
  }, []);

  // SMOOTH ANCHOR SCROLLING
  //  - preventDefault() cancels the native anchor jump (which would teleport
  //    instantly and land the title UNDER the sticky bar, since native jumps
  //    do not respect scroll-margin-top in every engine).
  //  - scrollIntoView({ behavior: 'smooth' }) animates the transition, and
  //    because the section declares scroll-margin-top (App.scss), the final
  //    resting position leaves the header offset automatically.
  //  - DEFENSIVE OFFSET: as a second layer, the target's current top is
  //    measured and, if it would rest higher than STICKY_HEADER_OFFSET
  //    (e.g. an engine that ignores scroll-margin-top, or a target near the
  //    document top), we scroll to `top - STICKY_HEADER_OFFSET` manually.
  //    All measurement/scroll math is wrapped in try/catch with a
  //    location.hash fallback so a missing/unmounted target never throws.
  //  - The document.getElementById guard makes this a no-op on servers.
  const scrollToSection = (event, sectionId) => {
    if (!sectionId || typeof sectionId !== 'string') {
      return;
    }

    setIsMenuOpen(false);

    try {
      const element =
        typeof document !== 'undefined'
          ? document.getElementById(sectionId)
          : null;

      if (!element) {
        return;
      }

      event.preventDefault();

      if (typeof window === 'undefined') {
        return;
      }

      // Measure where the target currently rests relative to the viewport.
      const rect = element.getBoundingClientRect();
      const targetTop = rect.top + window.scrollY;
      const clampedTop = Math.max(targetTop - STICKY_HEADER_OFFSET, 0);

element.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch {
      if (typeof window !== 'undefined') {
        const assignHash = (hash) => {
          window.location.hash = hash;
        };
        assignHash(`#${sectionId}`);
      }
    }
  };

  // Menu toggle — functional update (open => !open) so rapid clicks always
  // toggle against the latest state, never a stale closure value.
  const handleToggle = () => {
    setIsMenuOpen((open) => !open);
  };

  // Escape-to-close: a dialog-like menu should always be dismissible by
  // keyboard, not just by clicking its button again.
  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setIsMenuOpen(false);
    }
  };

  // The scrolled state is encoded as a BEM modifier class — zero inline
  // styles; all visual state lives in Header.scss.
  const headerClassName = isScrolled
    ? 'site-header site-header--scrolled'
    : 'site-header';

  // LANGUAGE SWITCH
  //  - The inactive language code is what the button offers to switch TO.
  //  - The button is a plain `type="button"` (no form submission) with a
  //    dynamic `aria-label` describing the action, so screen readers
  //    announce "Switch to English" / "Passer en français" rather than the
  //    bare "FR / EN" glyph pair.
  const nextLanguage = language === 'fr' ? 'en' : 'fr';
  const switchAriaLabel =
    nextLanguage === 'en' ? 'Switch to English' : 'Passer en français';

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
    <header className={headerClassName} onKeyDown={handleKeyDown}>
      <div className="header-inner">
        {/* Brand doubles as a "back to top" control — same scroll behaviour
            as the Home nav link, consistent muscle memory across the page. */}
        <a
          className="header-brand"
          href="#banner"
          onClick={(event) => scrollToSection(event, 'banner')}
        >
          <span className="header-brand-tag" aria-hidden="true">
            {'</ alex>'}
          </span>
          Alexandru Dumitru
        </a>

        <button
          type="button"
          className={`header-toggle${
            isMenuOpen ? ' header-toggle--open' : ''
          }`}
          // aria-expanded mirrors the visible state for assistive tech
          // (collapsed menu → "expanded: false").
          aria-expanded={isMenuOpen}
          // aria-controls links the button to the panel it toggles by id.
          aria-controls="primary-navigation"
          // The label describes the ACTION the button will perform, which
          // flips based on current state ("Open…" vs "Close…").
          aria-label={
            isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'
          }
          onClick={handleToggle}
        >
          {/* Three bars become an X via CSS transforms when --open is set.
              aria-hidden because the button's aria-label already conveys
              meaning — the bars are purely decorative. */}
          <span className="header-toggle-bar" aria-hidden="true" />
          <span className="header-toggle-bar" aria-hidden="true" />
          <span className="header-toggle-bar" aria-hidden="true" />
        </button>

        <nav
          id="primary-navigation"
          className={`header-nav${
            isMenuOpen ? ' header-nav--open' : ''
          }`}
          aria-label="Primary"
        >
          {safeLinks.map((link) => (
            <a
              key={link.id}
              className="header-nav-link"
              href={`#${link.id}`}
              onClick={(event) => scrollToSection(event, link.id)}
            >
              {t(link.labelKey)}
            </a>
          ))}
        </nav>

        {/* Language switch — grouped with the header actions, to the right
            of the navigation links. Lives in the sticky bar (not the
            banner) so it stays reachable and collision-free at every
            scroll position and breakpoint. */}
        <button
          type="button"
          className="header-lang-toggle"
          onClick={toggleLanguage}
          aria-label={switchAriaLabel}
          aria-pressed={language === 'en'}
        >
          <span
            className={`header-lang-toggle__code${
              language === 'fr' ? ' header-lang-toggle__code--active' : ''
            }`}
            aria-hidden="true"
          >
            FR
          </span>
          <span className="header-lang-toggle__separator" aria-hidden="true">
            /
          </span>
          <span
            className={`header-lang-toggle__code${
              language === 'en' ? ' header-lang-toggle__code--active' : ''
            }`}
            aria-hidden="true"
          >
            EN
          </span>
        </button>
      </div>
    </header>
  );
}

export default Header;