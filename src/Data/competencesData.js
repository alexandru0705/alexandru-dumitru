/**
 * competencesData — skill domain entities.
 *
 * BILINGUAL STRUCTURE
 *  - `category` and `description` are `{ fr, en }` objects: localized copy
 *    resolved at render time via `pickLocalized(value, language)` (see
 *    src/Data/translations.js). Consumers MUST use that helper — reading
 *    the field directly would render an object.
 *  - `skills[].name` are tool/technology names (language-neutral) and stay
 *    plain strings; `skills[].level` is a `{ fr, en }` object because the
 *    proficiency labels are human-readable copy.
 */
const competencesData = [
  {
    category: {
      fr: "Ingénierie Front-End",
      en: "Front-End Engineering"
    },
    description: {
      fr: "Conception d'interfaces responsives, accessibles et haute performance avec les écosystèmes React modernes et une séparation stricte des responsabilités.",
      en: "Building responsive, accessible, and high-performance interfaces with modern React ecosystems and strict separation of concerns."
    },
    skills: [
      { name: "React & React Router", level: { fr: "Avancé", en: "Advanced" } },
      { name: "JavaScript (ES6+)", level: { fr: "Avancé", en: "Advanced" } },
      { name: "HTML5 / CSS3 / Sass", level: { fr: "Expert", en: "Expert" } },
      { name: "CSS Modules & Architecture", level: { fr: "Expert", en: "Expert" } },
      { name: "Responsive Web Design & Mobile-First", level: { fr: "Expert", en: "Expert" } },
      { name: "Lighthouse Performance & Accessibility", level: { fr: "Avancé", en: "Advanced" } }
    ]
  },
  {
    category: {
      fr: "Back-End & Bases de Données",
      en: "Back-End & Databases"
    },
    description: {
      fr: "Conception de logique serveur robuste, d'API REST sécurisées et de modèles de bases de données documentaires efficaces.",
      en: "Designing robust server-side logic, secure REST APIs, and efficient document-based database models."
    },
    skills: [
      { name: "Node.js & Express.js", level: { fr: "Avancé", en: "Advanced" } },
      { name: "MongoDB & Mongoose", level: { fr: "Avancé", en: "Advanced" } },
      { name: "RESTful API Architecture", level: { fr: "Avancé", en: "Advanced" } },
      { name: "JWT Authentication & Security", level: { fr: "Avancé", en: "Advanced" } },
      { name: "Image Processing (Multer & Sharp)", level: { fr: "Avancé", en: "Advanced" } }
    ]
  },
  {
    category: {
      fr: "Outils, Flux de Travail & Normes",
      en: "Tools, Workflow & Standards"
    },
    description: {
      fr: "Maintien d'un flux de travail de développement propre et minimaliste, axé sur le contrôle de version, l'optimisation et les bonnes pratiques d'ingénierie logicielle.",
      en: "Maintaining a clean, minimal developer workflow focused on version control, optimization, and software engineering best practices."
    },
    skills: [
      { name: "Git & GitHub Version Control", level: { fr: "Avancé", en: "Advanced" } },
      { name: "Vite & Modern Build Tools", level: { fr: "Avancé", en: "Advanced" } },
      { name: "Agile Kanban & Technical Documentation", level: { fr: "Avancé", en: "Advanced" } },
      { name: "Zero Inline CSS / Separation of Concerns", level: { fr: "Expert", en: "Expert" } },
      { name: "macOS Terminal Minimalist Workflow", level: { fr: "Avancé", en: "Advanced" } }
    ]
  }
];

export { competencesData };