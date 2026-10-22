import { useEffect, useRef, useState } from 'react';
import './Header.scss';

/**
 * Navigation target registry.
 *
 * The ids MUST match the <section id="..."> values in App.jsx exactly —
 * these are the single source of truth for in-page anchors shared by the
 * header, footer, and Home CTAs. Keeping them in one const (mirrored by the
 * footer) makes drift immediately visible during review.
 */
const NAV_LINKS = [
  { id: 'banner', label: 'Home' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'contact', label: 'Contact' }
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
      } catch (err) {
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
  //    because the section declares scroll-margin-top, the final resting
  //    position leaves the 70px offset automatically.
  //  - The document.getElementById guard makes this a no-op on servers or if
  //    a target section is conditionally unmounted.
  //  - try/catch fallback: if scrollIntoView fails or element is missing, falls
  //    back to location hash without throwing unhandled exceptions.
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

  // Defensive array guard: ensures malformed links never crash map rendering.
  const safeLinks = Array.isArray(NAV_LINKS)
    ? NAV_LINKS.filter(
        (link) =>
          link !== null &&
          link !== undefined &&
          typeof link === 'object' &&
          typeof link.id === 'string' &&
          typeof link.label === 'string'
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
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default Header;