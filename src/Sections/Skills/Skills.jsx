import './Skills.scss';
import { competencesData } from '../../Data/competencesData';

function safeText(value, fallback = '') {
  return typeof value === 'string' && value.trim() !== '' ? value : fallback;
}

function isUsableCompetence(competence, index) {
  if (competence === null || competence === undefined || typeof competence !== 'object') {
    return false;
  }

  return true;
}

function getCompetenceKey(competence, index) {
  const category = safeText(competence && competence.category);
  return category ? category : `competence-${index}`;
}

function Skills() {
  const hasData =
    Array.isArray(competencesData) && competencesData.length > 0;

  const usableCompetences = hasData
    ? competencesData
        .map((competence, index) => (
          isUsableCompetence(competence, index) ? competence : null
        ))
        .filter((competence) => competence !== null)
    : [];

  if (!hasData) {
    return (
      <div className="skills-section">
        <div className="skills-empty" role="alert">
          <h2 className="skills-empty-title">Skills Unavailable</h2>
          <p className="skills-empty-message">
            We could not load the competences data. Please refresh the page to
            try again.
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
            Refresh
          </button>
        </div>
      </div>
    );
  }

  if (usableCompetences.length === 0) {
    return (
      <div className="skills-section">
        <div className="skills-empty">
          <h2 className="skills-empty-title">No Skills Listed</h2>
          <p className="skills-empty-message">
            There are no competences to display right now. Check back soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="skills-section">
      <div className="skills-header">
        <h2 className="skills-title">Technical Competencies</h2>
        <p className="skills-subtitle">
          A snapshot of the tools, frameworks, and standards I rely on to
          design, build, and ship reliable web applications end to end.
        </p>
      </div>

      <div className="skills-grid">
        {usableCompetences.map((competence, index) => {
          const category = safeText(competence.category, 'General');
          const description = safeText(
            competence.description,
            'No description available for this domain.'
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
                      ? safeText(skill.name, `Skill ${skillIndex + 1}`)
                      : safeText(skill, `Skill ${skillIndex + 1}`);
                    const level = isSkillObject
                      ? safeText(skill.level, 'Proficient')
                      : 'Proficient';

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
                  No individual skills listed for this domain.
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
