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
    <div className="banner">
      <div className="banner-content">
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
    </div>
  );
}

export default Banner;