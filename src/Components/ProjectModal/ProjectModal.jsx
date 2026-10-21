import { useCallback, useEffect, useRef, useState } from 'react';
import './ProjectModal.scss';

/**
 * CSS selector list of every element that can receive focus inside the modal.
 *
 * Why a shared constant: the focus trap must (a) move focus INTO the modal on
 * open, (b) cycle Tab/Shift+Tab between its boundaries, and (c) do so even
 * when new controls appear. One source of truth keeps all three paths
 * consistent — adding a new focusable element type only requires editing here.
 */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(', ');

/**
 * ProjectModal — accessible, self-contained detail dialog with an image
 * carousel.
 *
 * ARCHITECTURE
 *  - Rendered by the Projects section when a card is selected; receives the
 *    full project entity plus onClose. It is the ONLY place that knows how
 *    a project is presented in detail.
 *  - The dialog manages its own carousel index and image-error state, and it
 *    owns the document-level side effects (keyboard, scroll lock, focus)
 *    via effects that always clean up after themselves.
 *
 * ARIA DIALOG CONTRACT
 *  - role="dialog" + aria-modal="true": tells assistive tech that everything
 *    outside the dialog is temporarily inert.
 *  - aria-labelledby points at the title element so screen readers announce
 *    the project name when the dialog gains focus.
 *  - The overlay is role="presentation" — it is decorative chrome, and its
 *    click-to-close behaviour is a convenience, not an announced control.
 */
function ProjectModal({ project, onClose }) {
  // currentIndex: active slide. It is treated as UNTRUSTED input — every read
  // goes through safeIndex below, which clamps it into the valid range. This
  // means stale state (e.g. the index from a previously open project) can
  // never produce an out-of-bounds image.
  const [currentIndex, setCurrentIndex] = useState(0);
  // imageError: per-slide broken-image flag, mirroring ProjectCard's pattern.
  const [imageError, setImageError] = useState(false);

  // modalRef: the dialog container — anchor for all focus-trap queries.
  const modalRef = useRef(null);
  // previouslyFocusedRef: remembers whatever had focus before the modal
  // opened (e.g. the card link) so focus can be returned on close. Good
  // dialog behaviour: the user "comes back" to where they left off.
  const previouslyFocusedRef = useRef(null);

  // GUARD #1 — root validation.
  // If the parent ever passes a non-object (undefined mid-unmount, bad data),
  // we render nothing. Crucially this must happen AFTER the hooks (rules of
  // hooks), so it lives here rather than at the top of the component body.
  const isValidProject =
    project !== null &&
    project !== undefined &&
    typeof project === 'object';

  // GUARD #2 — defensive images.
  // We filter, not just type-check: `project.images` might contain nulls or
  // empty strings from upstream data. The result is a clean array of real,
  // usable src values that the rest of the component can trust.
  const rawImages =
    isValidProject && Array.isArray(project.images)
      ? project.images.filter(
          (image) => typeof image === 'string' && image.trim() !== ''
        )
      : [];

  // GUARD #3 — defensive tags (same rationale as images; only strings that
  // carry content survive to the pill list).
  const rawTags =
    isValidProject && Array.isArray(project.tags)
      ? project.tags.filter(
          (tag) => typeof tag === 'string' && tag.trim() !== ''
        )
      : [];

  const imagesLength = rawImages.length;
  // Nav controls only make sense with 2+ slides — with a single image,
  // prev/next would be dead controls that trap keyboard focus uselessly.
  const hasMultipleImages = imagesLength > 1;

  // SLIDE BOUNDARIES (the core defensive calculation).
  // safeIndex = min(max(currentIndex, 0), length - 1):
  //  - currentIndex < 0  → clamps to 0
  //  - currentIndex >= length (stale state after project swap) → clamps down
  //  - length === 0 → 0, and every render path that uses rawImages[safeIndex]
  //    is itself gated on imagesLength > 0, so we never index an empty array.
  const safeIndex = imagesLength > 0
    ? Math.min(Math.max(currentIndex, 0), imagesLength - 1)
    : 0;

  // useCallback: a stable identity for the close action so the keyboard
  // effect below does not re-subscribe on every render (it depends on `close`
  // in its deps array).
  const close = useCallback(() => {
    if (typeof onClose === 'function') {
      onClose();
    }
  }, [onClose]);

  // EFFECT 1 — per-project state reset.
  // When the parent swaps in a different project (user opens card A, closes,
  // opens card B), the carousel must start at slide 0 with a fresh
  // image-error flag. Keying the effect on `project` (object identity) means
  // it runs exactly when the opened project changes.
  useEffect(() => {
    setCurrentIndex(0);
    setImageError(false);
  }, [project]);

  // EFFECT 2 — global side effects: keyboard, scroll lock, focus management.
  //
  // MOUNT SIDE EFFECTS (run once per open project):
  //  1. Capture the currently focused element (previouslyFocusedRef).
  //  2. Move focus INTO the dialog (first focusable element = the close
  //     button). Without this, keyboard/sr users would be stuck on the card
  //     behind an "inert" modal.
  //  3. Attach a DOCUMENT-level keydown listener. Document level (not the
  //     dialog) guarantees Escape/arrows work even if focus is on <body>.
  //  4. Lock body scroll (overflow: hidden) so the background page cannot
  //     scroll behind the dialog — a classic dialog UX expectation.
  //
  // CLEANUP (runs on unmount AND before every re-subscription):
  //  - removeEventListener: without this, every open/close cycle would stack
  //    another listener → duplicated handlers, memory leak.
  //  - Restore the previous body overflow value (not just 'auto') so nested
  //    or pre-existing scroll states are preserved.
  //  - Return focus to the element that opened the modal (with a
  //    document.contains check — that node may have unmounted in the meantime).
  useEffect(() => {
    if (!isValidProject) {
      return undefined;
    }

    previouslyFocusedRef.current =
      typeof document !== 'undefined' ? document.activeElement : null;

    const modal = modalRef.current;
    if (modal) {
      const firstFocusable = modal.querySelector(FOCUSABLE_SELECTOR);
      if (firstFocusable && typeof firstFocusable.focus === 'function') {
        firstFocusable.focus();
      }
    }

    const handleKeyDown = (event) => {
      // ESCAPE — the universal "close" gesture for dialogs.
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }

      // ARROW KEYS — power-user navigation for the carousel. Gated on
      // hasMultipleImages so a single-image dialog ignores stray arrows.
      if (event.key === 'ArrowRight' && hasMultipleImages) {
        // Modular arithmetic ((prev + 1) % length) makes the carousel wrap:
        // the slide after the last is the first. No boundary branches needed.
        setCurrentIndex((prev) => (prev + 1) % imagesLength);
        setImageError(false);
        return;
      }

      if (event.key === 'ArrowLeft' && hasMultipleImages) {
        // (prev - 1 + length) % length: the +length guarantees a positive
        // operand so JS modulo never wraps a negative to -1.
        setCurrentIndex(
          (prev) => (prev - 1 + imagesLength) % imagesLength
        );
        setImageError(false);
        return;
      }

      // FOCUS TRAP — Tab and Shift+Tab must cycle inside the dialog.
      //
      // Mechanics:
      //  1. Collect every focusable element currently in the dialog.
      //  2. Filter to VISIBLE ones (offsetParent === null for display:none
      //     subtrees) — hidden controls must not participate in the cycle.
      //  3. Shift+Tab on the FIRST element (or focus outside) → jump to last.
      //  4. Tab on the LAST element (or focus outside) → jump to first.
      //  5. preventDefault() only when we actually redirect, so normal Tab
      //     movement inside the dialog is untouched.
      if (event.key === 'Tab' && modalRef.current) {
        const focusableElements = Array.from(
          modalRef.current.querySelectorAll(FOCUSABLE_SELECTOR)
        ).filter(
          (element) =>
            element.offsetParent !== null || element === document.activeElement
        );

        if (focusableElements.length === 0) {
          // Nothing focusable at all (e.g. no links rendered) — swallow the
          // Tab entirely so focus cannot escape to the background page.
          event.preventDefault();
          return;
        }

        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];
        const active = document.activeElement;

        if (event.shiftKey) {
          if (active === first || !modalRef.current.contains(active)) {
            event.preventDefault();
            last.focus();
          }
        } else if (active === last || !modalRef.current.contains(active)) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;

      const previouslyFocused = previouslyFocusedRef.current;
      if (
        previouslyFocused &&
        typeof previouslyFocused.focus === 'function' &&
        typeof document !== 'undefined' &&
        document.contains(previouslyFocused)
      ) {
        previouslyFocused.focus();
      }
    };
  }, [isValidProject, hasMultipleImages, imagesLength, close]);

  // EARLY RETURN — see GUARD #1. Placed after all hooks so hook order is
  // stable across renders, as React requires.
  if (!isValidProject) {
    return null;
  }

  // STRING FIELD GUARDS — each data string is validated before display and
  // given a readable fallback, mirroring the card's conventions.
  const title =
    typeof project.title === 'string' && project.title.trim() !== ''
      ? project.title
      : 'Untitled Project';

  const category =
    typeof project.category === 'string' && project.category.trim() !== ''
      ? project.category
      : null;

  const description =
    typeof project.description === 'string' && project.description.trim() !== ''
      ? project.description
      : 'No description available for this project.';

  const hasGithubUrl =
    typeof project.githubUrl === 'string' && project.githubUrl.trim() !== '';
  const hasLiveUrl =
    typeof project.liveUrl === 'string' && project.liveUrl.trim() !== '';

  const showImage = imagesLength > 0 && !imageError;

  // MOUSE NAV — mirrors the arrow-key handlers. stopPropagation() keeps a
  // button click from bubbling to the overlay (which would close the dialog
  // the instant you try to navigate). setImageError(false) re-arms the img
  // so a new slide's onError can fire afresh.
  const handleNext = (event) => {
    event.stopPropagation();
    if (hasMultipleImages) {
      setCurrentIndex((prev) => (prev + 1) % imagesLength);
      setImageError(false);
    }
  };

  const handlePrev = (event) => {
    event.stopPropagation();
    if (hasMultipleImages) {
      setCurrentIndex((prev) => (prev - 1 + imagesLength) % imagesLength);
      setImageError(false);
    }
  };

  // BACKDROP CLICK — event.target === event.currentTarget is true only when
  // the click landed on the overlay itself, NOT on a child that bubbled up.
  // (The dialog container also calls stopPropagation as a second layer, but
  // the target check makes the overlay independently correct.)
  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      close();
    }
  };

  return (
    <div
      className="project-modal-overlay"
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        ref={modalRef}
        className="project-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Close button is deliberately first in DOM order so the
            "focus first focusable element" logic lands the user somewhere
            meaningful, and Escape/Tab users reach it predictably. */}
        <button
          type="button"
          className="project-modal-close"
          onClick={close}
          aria-label="Close modal"
        >
          ✕
        </button>

        <header className="project-modal-header">
          {category && (
            <span className="project-modal-badge">{category}</span>
          )}
          <h2 id="project-modal-title" className="project-modal-title">
            {title}
          </h2>
        </header>

        <div className="project-modal-carousel">
          {imagesLength > 0 ? (
            <>
              {hasMultipleImages && (
                <button
                  type="button"
                  className="project-modal-nav project-modal-nav--prev"
                  onClick={handlePrev}
                  aria-label="Previous image"
                >
                  ‹
                </button>
              )}

              {showImage ? (
                <img
                  className="project-modal-image"
                  src={rawImages[safeIndex]}
                  alt={`${title} slide ${safeIndex + 1} of ${imagesLength}`}
                  onError={() => setImageError(true)}
                />
              ) : (
                // Broken-image fallback keeps the carousel geometry stable
                // (same aspect-ratio box) instead of collapsing.
                <div
                  className="project-modal-image-fallback"
                  role="img"
                  aria-label={`${title} image unavailable`}
                >
                  Image unavailable
                </div>
              )}

              {hasMultipleImages && (
                <button
                  type="button"
                  className="project-modal-nav project-modal-nav--next"
                  onClick={handleNext}
                  aria-label="Next image"
                >
                  ›
                </button>
              )}

              <span className="project-modal-counter" aria-hidden="true">
                {safeIndex + 1} / {imagesLength}
              </span>
            </>
          ) : (
            <div
              className="project-modal-image-fallback"
              role="img"
              aria-label={`${title} image unavailable`}
            >
              No preview images available
            </div>
          )}
        </div>

        <div className="project-modal-body">
          <p className="project-modal-description">{description}</p>

          {rawTags.length > 0 && (
            <ul className="project-modal-tags">
              {rawTags.map((tag) => (
                <li key={tag} className="project-modal-tag">
                  {tag}
                </li>
              ))}
            </ul>
          )}

          {(hasGithubUrl || hasLiveUrl) && (
            <div className="project-modal-links">
              {hasGithubUrl && (
                <a
                  className="project-modal-btn"
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub Repository ↗
                </a>
              )}
              {hasLiveUrl && (
                <a
                  className="project-modal-btn project-modal-btn--live"
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Live Demo ↗
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProjectModal;