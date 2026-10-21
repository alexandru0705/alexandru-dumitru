import { useState } from 'react';
import './ProjectCard.scss';

/**
 * Derives a short monogram (up to two uppercase initials) from a project title.
 *
 * Why this exists: when the thumbnail image is missing from data or fails to
 * load, the media area falls back to a placeholder that still looks intentional.
 * The initials give each placeholder an identity that matches its project.
 *
 * Defensive behaviour:
 *  - Non-strings, empty strings, and whitespace-only strings collapse to "?".
 *  - Only the first two words are considered, so long titles stay compact.
 *  - Words missing a first character (e.g. a leading punctuation split)
 *    contribute nothing instead of crashing `toUpperCase()`.
 */
function getInitials(title) {
  if (typeof title !== 'string' || title.trim() === '') {
    return '?';
  }

  const words = title.trim().split(/\s+/).slice(0, 2);
  const initials = words
    .map((word) => (word[0] ? word[0].toUpperCase() : ''))
    .join('');

  return initials || '?';
}

/**
 * ProjectCard — a single clickable portfolio tile.
 *
 * ARCHITECTURE
 *  - Purely presentational: receives one `project` entity plus an `onSelect`
 *    callback and renders it. All state lifting (which project is open) lives
 *    in the parent Projects section.
 *  - The whole card acts as a button (opens the ProjectModal), while the
 *    embedded GitHub / Live Demo links behave as real anchors that stop
 *    propagation so they never accidentally open the modal.
 *
 * PROPS
 *  - project:  { id, title, category, description, images, tags, githubUrl, liveUrl }
 *               Every field is treated as optional at runtime — real data from
 *               CMS/import pipelines is not guaranteed to be complete.
 *  - onSelect: (id) => void, invoked with the project id so the parent can
 *               resolve the full entity (single source of truth for data).
 */
function ProjectCard({ project, onSelect }) {
  // imageError: boolean state that flips when the browser fires `onError`
  // on the <img>. Keeping it in state (rather than unmounting the card) lets
  // us swap in the initials placeholder while preserving layout and position
  // in the grid — no reflow, no flicker.
  const [imageError, setImageError] = useState(false);

  // ROOT VALIDATION (guard #1)
  // The card can be rendered with undefined/null if the parent data source is
  // malformed. Returning null here keeps the React tree intact — one broken
  // entry must never take down the whole grid.
  if (project === null || project === undefined || typeof project !== 'object') {
    return null;
  }

  // DESTRUCTIVE FALLBACKS (guard #2)
  // Destructuring with defaults means every downstream render path can assume
  // these values exist. `title`/`category` get human-readable strings,
  // `description` an empty string (replaced by a placeholder line below),
  // arrays get safe empties, and URLs get '' so the conditional link
  // rendering is a simple truthiness check.
  const {
    id,
    title = 'Untitled Project',
    category = 'General',
    description = '',
    images = [],
    tags = [],
    githubUrl = '',
    liveUrl = ''
  } = project;

  // CENTRALISED CLICK HANDLER
  // Both mouse clicks and keyboard activation funnel through this one
  // function so the selection behaviour (and any future side effects, e.g.
  // analytics) has a single point of change. The `typeof onSelect ===
  // 'function'` check protects against parents passing undefined.
  const handleCardClick = () => {
    if (typeof onSelect === 'function') {
      onSelect(id);
    }
  };

  // KEYBOARD ACCESSIBILITY (a11y)
  // The card is an <article> with role="button", so it receives focus
  // (tabIndex={0}) but is NOT natively activated by Enter/Space like a real
  // <button>. This handler closes that gap:
  //  - Enter fires "click" automatically, Space does not — we handle both.
  //  - preventDefault() on Space stops the page from scrolling down when the
  //    card is activated, which would otherwise feel broken.
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCardClick();
    }
  };

  // EVENT BUBBLING GUARD
  // The card's onClick would fire when a link inside it is clicked, because
  // the click bubbles up the DOM. stopPropagation() confines the link click
  // to the link itself — "GitHub" opens GitHub, it does NOT also open the
  // project modal.
  const handleLinkClick = (event) => {
    event.stopPropagation();
  };

  // IMAGE RESOLUTION
  // hasImages: the images array may be missing, wrong-typed, or empty.
  // showImage: combines the data check with the runtime imageError flag.
  // thumbnail: the resolved src — only read when both checks pass, so we
  //            never index into a non-array.
  const hasImages = Array.isArray(images) && images.length > 0;
  const showImage = hasImages && !imageError;
  const thumbnail = showImage ? images[0] : null;

  // SAFE ITERATION GUARD for tags
  // `Array.isArray && length > 0` before .map() means a missing or
  // non-array `tags` simply hides the pill list instead of throwing.
  const hasTags = Array.isArray(tags) && tags.length > 0;

  // Description gets a readable placeholder when the data is absent or
  // whitespace-only, so the card never renders an empty text gap.
  const safeDescription =
    typeof description === 'string' && description.trim() !== ''
      ? description
      : 'No description available.';

  return (
    <article
      className="project-card"
      // role="button" + tabIndex={0}: announces the tile as an interactive
      // control to screen readers AND makes it reachable by Tab.
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      aria-label={`Open details for ${title}`}
    >
      <div className="project-card-media">
        {showImage && thumbnail ? (
          <img
            className="project-card-thumb"
            src={thumbnail}
            alt={`${title} preview`}
            // loading="lazy" defers offscreen thumbnails until the card
            // approaches the viewport — cheaper initial paint on long pages.
            loading="lazy"
            // Runtime image fallback: if the file 404s or is corrupt, swap
            // to the initials placeholder instead of showing a broken glyph.
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="project-card-placeholder" aria-hidden="true">
            <span className="project-card-placeholder-initials">
              {getInitials(typeof title === 'string' ? title : '')}
            </span>
          </div>
        )}
        <span className="project-card-badge">{category}</span>
      </div>

      <div className="project-card-body">
        <h3 className="project-card-title">{title}</h3>
        <p className="project-card-description">{safeDescription}</p>

        {hasTags && (
          <ul className="project-card-tags">
            {tags.map((tag, index) => (
              <li
                // Key strategy: prefer the tag text itself (stable across
                // re-renders); fall back to a positional key if a tag is not a
                // string (defensive — real data may contain odd entries).
                key={typeof tag === 'string' ? tag : `tag-${index}`}
                className="project-card-tag"
              >
                {typeof tag === 'string' ? tag : `Tag ${index + 1}`}
              </li>
            ))}
          </ul>
        )}

        <div className="project-card-links">
          {/* Conditional links: each anchor only renders when its URL is a
              non-empty string. `handleLinkClick` stops the card from treating
              the click as a modal trigger; target/rel keep external navigation
              safe (no reverse-tabnabbing). */}
          {typeof githubUrl === 'string' && githubUrl !== '' ? (
            <a
              className="project-card-link"
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleLinkClick}
            >
              GitHub ↗
            </a>
          ) : null}
          {typeof liveUrl === 'string' && liveUrl !== '' ? (
            <a
              className="project-card-link project-card-link--live"
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleLinkClick}
            >
              Live Demo ↗
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default ProjectCard;