/**
 * translations.js — Centralized bilingual UI copy dictionary.
 *
 * ARCHITECTURE NOTE
 *  - Single source of truth for all user-facing strings in the FR/EN
 *    bilingual switch. Components must never hardcode display copy; they
 *    consume these keys through the `useLanguage()` hook (see
 *    src/Context/LanguageContext.jsx).
 *  - Both language trees MUST stay key-for-key identical. Adding a key to
 *    one language without the other is a review-blocking drift: the
 *    `t()` helper in LanguageContext falls back to the key's French value
 *    (and finally to the key itself) so a missing translation degrades
 *    gracefully instead of rendering `undefined`.
 *  - Keys are grouped by UI region (nav, actions, banner, home, projects,
 *    skills, contact, footer) to keep the dictionary scannable as the copy
 *    surface grows.
 *  - `pickLocalized` (exported below) is the resolver for DATA-LEVEL
 *    localization (projectsData / competencesData entries that carry
 *    `{ fr, en }` objects). It mirrors the t() fallback contract: active
 *    language first, 'fr' second, then a safe default — so a missing
 *    translation in one language never renders `undefined`.
 */

const DEFAULT_LANGUAGE = 'fr';

/**
 * pickLocalized — resolve a localized data value for the active language.
 *
 * Accepts either:
 *  - a plain string (legacy/neutral data) → returned as-is, or
 *  - a `{ fr, en }` object → the active language's string, falling back to
 *    'fr', then to `fallback`.
 *
 * Defensive: non-string leaves are discarded so a malformed data entry can
 * never inject an object into the render tree.
 *
 * @param {string|Object} value - Localized value or plain string.
 * @param {string} language - Active language code ('fr' | 'en').
 * @param {string} [fallback=''] - Last-resort string.
 * @returns {string} Resolved string (never undefined).
 */
function pickLocalized(value, language, fallback = '') {
  if (typeof value === 'string') {
    return value.trim() !== '' ? value : fallback;
  }
  if (value !== null && typeof value === 'object') {
    const active = value[language];
    if (typeof active === 'string' && active.trim() !== '') {
      return active;
    }
    const defaultLang = value[DEFAULT_LANGUAGE];
    if (typeof defaultLang === 'string' && defaultLang.trim() !== '') {
      return defaultLang;
    }
  }
  return fallback;
}

const translations = {
  fr: {
    nav: {
      home: 'Accueil',
      projects: 'Projets',
      skills: 'Compétences',
      contact: 'Contact'
    },
    actions: {
      cv: 'Mon CV',
      viewProjects: 'Voir les Projets',
      getInTouch: 'Me Contacter'
    },
    banner: {
      badge: 'Développeur Web Full-Stack',
      status: 'Disponible pour projets',
      title: 'Alexandru Dumitru',
      subtitle: 'Développeur Web Full-Stack',
      alt: 'Illustration de développement web'
    },
    home: {
      introHeading:
        "Ingénierie web de bout en bout, du premier pixel à la production",
      bioOne:
        "Je suis Alex, développeur web de 50 ans basé à Paris. " +
        "Je conçois des applications web responsives et accessibles sur " +
        "toute la stack — combinant une architecture de composants propre " +
        "en React et SASS avec des API REST sécurisées en Node.js, Express et MongoDB.",
      bioTwo:
        "L'accessibilité et la performance ne sont pas négociables : chaque projet " +
        "est mesuré avec Lighthouse, audité sur les fondamentaux WCAG, et optimisé " +
        "pour charger vite sur n'importe quel appareil.",
      bioThree:
        "Animé par une architecture propre et maintenable et des flux de travail modulaires, " +
        "j'aborde le développement avec la discipline d'un artisan — en privilégiant des " +
        "modèles de conception robustes, un modèle de données évolutif, et un code conçu pour durer."
    },
    projects: {
      title: 'Projets Sélectionnés',
      subtitle:
        'Une collection soigneusement choisie de réalisations de bout en bout, ' +
        'des mises en page responsives pixel-perfect aux applications full-stack.',
      errorTitle: 'Projets Indisponibles',
      errorMessage:
        'Impossible de charger les données des projets. La collection est ' +
        'absente ou malformée. Veuillez réessayer dans un instant.',
      retry: 'Réessayer',
      emptyTitle: 'Aucun Projet pour le Moment',
      emptyMessage:
        'Il n\'y a aucun projet à afficher pour le moment. Revenez bientôt, ' +
        'ou actualisez pour réessayer.',
      refresh: 'Actualiser',
      carouselLabel: 'Carrousel des projets en vedette',
      prevProject: 'Projet précédent',
      nextProject: 'Projet suivant',
      slidesLabel: 'Diapositives des projets',
      goToProject: 'Aller au projet',
      untitled: 'Projet',
      noDescription: 'Aucune description disponible.',
      github: 'GitHub',
      liveDemo: 'Démo en Ligne',
      imageUnavailable: 'Image indisponible',
      noPreviewImages: 'Aucune image de prévisualisation disponible',
      close: 'Fermer la fenêtre',
      previousImage: 'Image précédente',
      nextImage: 'Image suivante'
    },
    skills: {
      title: 'Compétences Techniques',
      subtitle:
        'Un aperçu des outils, frameworks et normes sur lesquels je m\'appuie ' +
        'pour concevoir, construire et livrer des applications web fiables de bout en bout.',
      errorTitle: 'Compétences Indisponibles',
      errorMessage:
        'Impossible de charger les données des compétences. Veuillez ' +
        'actualiser la page pour réessayer.',
      refresh: 'Actualiser',
      emptyTitle: 'Aucune Compétence Listée',
      emptyMessage:
        'Il n\'y a aucune compétence à afficher pour le moment. Revenez bientôt.',
      general: 'Général',
      noDescription: 'Aucune description disponible pour ce domaine.',
      noSkills: 'Aucune compétence individuelle listée pour ce domaine.',
      skill: 'Compétence',
      proficient: 'Compétent'
    },
    contact: {
      title: 'Prenez Contact',
      subtitle:
        'Un projet en tête, un poste à discuter, ou simplement envie de dire bonjour ? ' +
        'Ma boîte mail est toujours ouverte.',
      directHeading: 'Contact Direct',
      directText:
        'Le moyen le plus rapide de me joindre est par e-mail. ' +
        'Je réponds généralement sous un jour ouvré.',
      email: 'E-mail',
      github: 'GitHub',
      location: 'Localisation',
      locationValue: 'Paris, France',
      nameLabel: 'Nom',
      namePlaceholder: 'Votre nom complet',
      emailLabel: 'E-mail',
      emailPlaceholder: 'vous@exemple.com',
      subjectLabel: 'Sujet',
      subjectPlaceholder: 'De quoi s\'agit-il ?',
      messageLabel: 'Message',
      messagePlaceholder: 'Parlez-moi un peu de votre projet ou de votre question...',
      send: 'Envoyer le Message',
      sending: 'Envoi en cours...',
      sendAnother: 'Envoyer un Autre',
      successMessage:
        'Merci de m\'avoir contacté ! Votre message a été enregistré et ' +
        'je vous répondrai sous peu.',
      errorMessage:
        'Veuillez corriger les champs signalés et réessayer.',
      errorName: 'Veuillez saisir votre nom.',
      errorEmail: 'Veuillez saisir votre adresse e-mail.',
      errorEmailInvalid: 'Veuillez saisir une adresse e-mail valide.',
      errorSubject: 'Veuillez saisir un sujet.',
      errorMessageField: 'Veuillez saisir un message.',
      errorMessageLength: 'Votre message doit contenir au moins 10 caractères.'
    },
    footer: {
      navigate: 'Naviguer',
      elsewhere: 'Ailleurs',
      github: 'GitHub',
      email: 'E-mail',
      githubAria: 'Profil GitHub (s\'ouvre dans un nouvel onglet)',
      emailAria: 'Envoyer un e-mail',
      copyright: 'Tous droits réservés.',
      backToTop: 'Retour en haut'
    }
  },
  en: {
    nav: {
      home: 'Home',
      projects: 'Projects',
      skills: 'Skills',
      contact: 'Contact'
    },
    actions: {
      cv: 'My CV',
      viewProjects: 'View Projects',
      getInTouch: 'Get in Touch'
    },
    banner: {
      badge: 'Full-Stack Web Developer',
      status: 'Available for projects',
      title: 'Alexandru Dumitru',
      subtitle: 'Full-Stack Web Developer',
      alt: 'Web development visual'
    },
    home: {
      introHeading:
        'End-to-end web engineering, from first pixel to production',
      bioOne:
        "I'm Alex, a 50-year-old web developer based in Paris. " +
        "I build responsive, accessible web applications across " +
        "the full stack—combining clean component architecture " +
        "in React and SASS with secure REST APIs in Node.js, Express, and MongoDB.",
      bioTwo:
        'Accessibility and performance are non-negotiable: every project is ' +
        'measured with Lighthouse, audited for WCAG fundamentals, and tuned to ' +
        'load fast on any device.',
      bioThree:
        "Driven by clean, maintainable architecture and modular workflows, " +
        "I approach development with a craftsman's discipline—prioritizing " +
        'robust design patterns, scalable data modeling, and code that is built to last.'
    },
    projects: {
      title: 'Selected Projects',
      subtitle:
        'A curated collection of end-to-end builds, from pixel-perfect ' +
        'responsive layouts to full-stack applications.',
      errorTitle: 'Projects Unavailable',
      errorMessage:
        'We could not load the project data. The collection is missing or ' +
        'malformed. Please try again in a moment.',
      retry: 'Retry',
      emptyTitle: 'No Projects Yet',
      emptyMessage:
        'There are no projects to display right now. Check back soon, or ' +
        'refresh to retry.',
      refresh: 'Refresh',
      carouselLabel: 'Highlighted Projects Carousel',
      prevProject: 'Previous project',
      nextProject: 'Next project',
      slidesLabel: 'Project slides',
      goToProject: 'Go to project',
      untitled: 'Project',
      noDescription: 'No description available.',
      github: 'GitHub',
      liveDemo: 'Live Demo',
      imageUnavailable: 'Image unavailable',
      noPreviewImages: 'No preview images available',
      close: 'Close modal',
      previousImage: 'Previous image',
      nextImage: 'Next image'
    },
    skills: {
      title: 'Technical Competencies',
      subtitle:
        'A snapshot of the tools, frameworks, and standards I rely on to ' +
        'design, build, and ship reliable web applications end to end.',
      errorTitle: 'Skills Unavailable',
      errorMessage:
        'We could not load the competences data. Please refresh the page to ' +
        'try again.',
      refresh: 'Refresh',
      emptyTitle: 'No Skills Listed',
      emptyMessage:
        'There are no competences to display right now. Check back soon.',
      general: 'General',
      noDescription: 'No description available for this domain.',
      noSkills: 'No individual skills listed for this domain.',
      skill: 'Skill',
      proficient: 'Proficient'
    },
    contact: {
      title: 'Get In Touch',
      subtitle:
        'Have a project in mind, a role to discuss, or just want to say hello? ' +
        'My inbox is always open.',
      directHeading: 'Direct Contact',
      directText:
        'The fastest way to reach me is by email. I typically respond ' +
        'within one business day.',
      email: 'Email',
      github: 'GitHub',
      location: 'Location',
      locationValue: 'Paris, France',
      nameLabel: 'Name',
      namePlaceholder: 'Your full name',
      emailLabel: 'Email',
      emailPlaceholder: 'you@example.com',
      subjectLabel: 'Subject',
      subjectPlaceholder: 'What is this about?',
      messageLabel: 'Message',
      messagePlaceholder: 'Tell me a little about your project or question...',
      send: 'Send Message',
      sending: 'Sending...',
      sendAnother: 'Send Another',
      successMessage:
        'Thanks for reaching out! Your message has been recorded and I will ' +
        'get back to you shortly.',
      errorMessage:
        'Please correct the highlighted fields and try again.',
      errorName: 'Please enter your name.',
      errorEmail: 'Please enter your email address.',
      errorEmailInvalid: 'Please enter a valid email address.',
      errorSubject: 'Please enter a subject.',
      errorMessageField: 'Please enter a message.',
      errorMessageLength: 'Your message should be at least 10 characters long.'
    },
    footer: {
      navigate: 'Navigate',
      elsewhere: 'Elsewhere',
      github: 'GitHub',
      email: 'Email',
      githubAria: 'GitHub profile (opens in a new tab)',
      emailAria: 'Send an email',
      copyright: 'All rights reserved.',
      backToTop: 'Back to top'
    }
  }
};

export { pickLocalized };
export default translations;
