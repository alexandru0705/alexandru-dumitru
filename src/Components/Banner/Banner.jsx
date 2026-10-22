import { useState } from 'react';
import './Banner.scss';

const DEFAULT_BADGES = [
  { label: 'Full-Stack Web Developer', variant: 'role' },
  { label: 'Available for projects', variant: 'status' }
];

function Banner({
  title = 'Alexandru Dumitru',
  subtitle = 'Full-Stack Web Developer',
  badges = DEFAULT_BADGES
}) {
  const [imageError, setImageError] = useState(false);

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

  // Lines 24-27 in Banner.jsx
  const bannerBgPath = `${import.meta.env.BASE_URL}images/banner-bg.webp`;

  return (
    <div
      className="banner"
      style={{ '--banner-bg': `url("${bannerBgPath}")` }}
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

          <h1 className="banner-title">{title}</h1>
          <p className="banner-subtitle">{subtitle}</p>
        </div>

        {!imageError && (
          <div className="banner-visual">
            <img
              src={`${import.meta.env.BASE_URL}images/banner-bg-2.webp`}
              alt="Web development visual"
              className="banner-image"
              onError={() => setImageError(true)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Banner;