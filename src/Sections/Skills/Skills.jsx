import './Skills.scss';
import { competencesData } from '../../Data/competencesData';
import { pickLocalized } from '../../Data/translations.js';
import { useLanguage } from '../../Context/LanguageContext.jsx';

/**
 * safeText — defensive string coercion with a fallback.
 *
 * @param {unknown} value - Candidate string.
 * @param {string} [fallback=''] - Value returned when the candidate is not
 *   a non-empty string.
 * @returns {string}
 */
function safeText(value, fallback = '') {
  return typeof value === 'string' && value.trim() !== '' ? value : fallback;
}

/**
 * isUsableCompetence — defensive entity guard.
 *
 * @param {unknown} competence - Candidate item.
 * @returns {boolean} True if the entity is a non-null object.
 */
function isUsableCompetence(competence) {
  if (competence === null || competence === undefined || typeof competence !== 'object') {
    return false;
  }

  return true;
}

/**
 * getCompetenceKey — stable React key for a competence card.
 *
 * The category is now a `{ fr, en }` object in the data layer, so the key
 * is derived from the French leaf (stable across language switches — a key
 * that changed on every toggle would remount the whole card subtree).
 *
 * @param {Object} competence - Competence entity.
 * @param {number} index - Positional fallback index.
 * @returns {string}
 */
function getCompetenceKey(competence, index) {
  const category = pickLocalized(competence && competence.category, 'fr');
  return category ? category : `competence-${index}`;
}

/**
 * Skills — technical competencies section.
 *
 * BILINGUAL:
 *  - Section copy (title, subtitle, error/empty states, fallback strings)
 *    is resolved through `t()` from the LanguageContext.
 *  - Data-level fields (`category`, `description`, `skills[].level`) are
 *    `{ fr, en }` objects resolved per active language via `pickLocalized`
 *    (active language → 'fr' fallback), so a missing translation in one
 *    language degrades gracefully instead of rendering an object.
 *  - `skills[].name` are language-neutral tool names (plain strings).
 */
function Skills() {
  const { language, t } = useLanguage();

  const hasData =
    Array.isArray(competencesData) && competencesData.length > 0;

  const usableCompetences = hasData
    ? competencesData
        .map((competence) => (
          isUsableCompetence(competence) ? competence : null
        ))
        .filter((competence) => competence !== null)
    : [];

  if (!hasData) {
    return (
      <div className="skills-section">
        <div className="skills-empty" role="alert">
          <h2 className="skills-empty-title">{t('skills.errorTitle')}</h2>
          <p className="skills-empty-message">
            {t('skills.errorMessage')}
          </p>
          <button
            type="button"
            className="skills-empty-retry"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.reload();
              }
            }}
          >
            {t('skills.refresh')}
          </button>
        </div>
      </div>
    );
  }

  if (usableCompetences.length === 0) {
    return (
      <div className="skills-section">
        <div className="skills-empty">
          <h2 className="skills-empty-title">{t('skills.emptyTitle')}</h2>
          <p className="skills-empty-message">
            {t('skills.emptyMessage')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="skills-section">
      <div className="skills-header">
        <h2 className="skills-title">{t('skills.title')}</h2>
        <p className="skills-subtitle">
          {t('skills.subtitle')}
        </p>
      </div>

      <div className="skills-grid">
        {usableCompetences.map((competence, index) => {
          const category = pickLocalized(
            competence.category,
            language,
            t('skills.general')
          );
          const description = pickLocalized(
            competence.description,
            language,
            t('skills.noDescription')
          );
          const skills = Array.isArray(competence.skills)
            ? competence.skills
            : [];

          return (
            <article
              key={getCompetenceKey(competence, index)}
              className="skills-card"
            >
              <h3 className="skills-card-title">{category}</h3>
              <p className="skills-card-description">{description}</p>

              {skills.length > 0 ? (
                <ul className="skills-card-list">
                  {skills.map((skill, skillIndex) => {
                    const isSkillObject =
                      skill !== null &&
                      skill !== undefined &&
                      typeof skill === 'object';

                    const name = isSkillObject
                      ? safeText(skill.name, `${t('skills.skill')} ${skillIndex + 1}`)
                      : safeText(skill, `${t('skills.skill')} ${skillIndex + 1}`);
                    const level = isSkillObject
                      ? pickLocalized(skill.level, language, t('skills.proficient'))
                      : t('skills.proficient');

                    return (
                      <li
                        key={`${name}-${skillIndex}`}
                        className="skills-card-item"
                      >
                        <span className="skills-card-item-name">{name}</span>
                        <span className="skills-card-item-level">
                          {level}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="skills-card-empty">
                  {t('skills.noSkills')}
                </p>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default Skills;