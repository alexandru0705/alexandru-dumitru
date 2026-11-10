import { useState } from 'react';
import bannerBgImg from '/images/banner-bg.webp';
import bannerBgVisual from '/images/banner-bg-2.webp';
import { useLanguage } from '../../Context/LanguageContext.jsx';
import './Banner.scss';

/**
 * Banner — first-viewport hero section.
 *
 * LAYOUT MECHANICS (pairs with Banner.scss)
 *  - Fills the full viewport height minus the 70px sticky header.
 *  - Two-column grid (text / visual) on desktop; single column on mobile.
 *
 * LANGUAGE CONSUMPTION
 *  - All hero copy (role badge, status badge, title, subtitle, image alt)
 *    is resolved through `t()` from the LanguageContext, so the entire
 *    first viewport re-renders in sync when the FR / EN switch flips.
 *    No hardcoded copy.
 *  - The FR / EN switch itself lives in the sticky Header (not here):
 *    an absolutely-positioned switch inside the banner rendered partially
 *    underneath the pinned header and clashed with the navigation bar.
 *
 * DEFENSIVE ASSET HANDLING
 *  - The visual image carries an `onError` handler that flips `imageError`,
 *    which swaps the grid to the `--single` modifier so the layout never
 *    collapses around a broken asset.
 */
function Banner() {
  const [imageError, setImageError] = useState(false);
  const { t } = useLanguage();

  // Badge list is built from translation keys so both pills stay in sync
  // with the active language. The defensive filter below guarantees the
  // map never receives a malformed entry (data-shape resilience).
  const badges = [
    { label: t('banner.badge'), variant: 'role' },
    { label: t('banner.status'), variant: 'status' }
  ];

  const safeBadges = Array.isArray(badges)
    ? badges.filter(
      (badge) =>
        badge !== null &&
        badge !== undefined &&
        typeof badge === 'object' &&
        typeof badge.label === 'string' &&
        badge.label.trim() !== ''
    )
    : [];

  return (
    <div
      className="banner"
      style={{ '--banner-bg': `url(${bannerBgImg})` }}
    >
      <div className={`banner-content${imageError ? ' banner-content--single' : ''}`}>
        <div className="banner-text">
          {safeBadges.length > 0 && (
            <div className="banner-badges">
              {safeBadges.map((badge, index) => {
                const variant =
                  badge.variant === 'status' ? 'status' : 'role';
                return (
                  <span
                    key={`${badge.label}-${index}`}
                    className={`banner-badge banner-badge--${variant}`}
                  >
                    {variant === 'status' && (
                      <span
                        className="banner-badge-dot"
                        aria-hidden="true"
                      />
                    )}
                    {badge.label}
                  </span>
                );
              })}
            </div>
          )}

          <h1 className="banner-title">{t('banner.title')}</h1>
          <p className="banner-subtitle">{t('banner.subtitle')}</p>
        </div>

        {!imageError && (
          <div className="banner-visual">
            <img
              src={bannerBgVisual}
              alt={t('banner.alt')}
              className="banner-image"
              width={1024}
              height={1024}
              loading="eager"
              fetchPriority="high"
              onError={() => setImageError(true)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Banner;
