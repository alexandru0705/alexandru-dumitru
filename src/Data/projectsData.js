const baseUrl = import.meta.env.BASE_URL;

/**
 * projectsData — portfolio project entities.
 *
 * BILINGUAL STRUCTURE
 *  - `title` and `category` are proper nouns / product names, so they stay
 *    language-neutral plain strings (identical in FR and EN).
 *  - `description` is a `{ fr, en }` object: localized copy resolved at
 *    render time via `pickLocalized(description, language)` (see
 *    src/Data/translations.js). Consumers MUST use that helper — reading
 *    `project.description` directly would render an object.
 *  - `tags` are technology names (language-neutral) and stay plain strings.
 */
const projectsData = [
    {
        id: "booki",
        title: "Booki",
        category: "HTML & CSS / Responsive Design",
        description: {
            fr: "Prototype HTML/CSS responsive pour une startup d'agence de voyage, axé sur une exécution UI pixel-perfect et une adaptation fluide des mises en page sur tous les appareils.",
            en: "Responsive HTML/CSS prototype for a travel agency startup, focusing on pixel-perfect UI execution and fluid layout adaptation across devices."
        },
        images: [
            `${baseUrl}images/booki-thumb.webp`,
            `${baseUrl}images/booki-logo.webp`,
            `${baseUrl}images/booki-1.webp`,
            `${baseUrl}images/booki-2.webp`,
            `${baseUrl}images/booki-tablet.webp`,
            `${baseUrl}images/booki-mobile.webp`
        ],
        tags: ["HTML5", "CSS3", "Responsive Design", "Git"],
        githubUrl: "https://github.com/OpenClassrooms-Student-Center/Booki_avec_Companion.git"
    },
    {
        id: "sophie-bluel",
        title: "Portfolio Architecte - Sophie Bluel",
        category: "JavaScript & Manipulation du DOM",
        description: {
            fr: "Application front-end dynamique intégrant une API backend Express avec authentification utilisateur, modales de téléchargement de médias et filtrage du DOM en temps réel.",
            en: "Dynamic frontend application integrating an Express backend API with user authentication, media upload modals, and real-time DOM filtering."
        },
        images: [
            `${baseUrl}images/sophie-bluel-thumb.webp`,
            `${baseUrl}images/sophie-bluel-logo.webp`,
            `${baseUrl}images/sophie-bluel-1.webp`,
            `${baseUrl}images/sophie-bluel-login.webp`,
            `${baseUrl}images/sophie-bluel-desktop.webp`,
            `${baseUrl}images/sophie-bluel-modals.webp`
        ],
        tags: ["JavaScript", "DOM", "Node.js", "Express", "REST API"],
        githubUrl: "https://github.com/OpenClassrooms-Student-Center/Portfolio-architecte-sophie-bluel.git"
    },
    {
        id: "nina-carducci",
        title: "Optimisation & SEO - Nina Carducci",
        category: "Audit de Performance & Accessibilité",
        description: {
            fr: "Refonte complète de la performance, du SEO et de l'accessibilité pour le portfolio d'une photographe, portant les métriques Lighthouse à des niveaux optimaux.",
            en: "Complete performance, SEO, and accessibility overhaul for a photographer's portfolio, driving Lighthouse metrics to optimal levels."
        },
        images: [
            `${baseUrl}images/nina-carducci-thumb.webp`,
            `${baseUrl}images/nina-carducci-1.webp`,
            `${baseUrl}images/nina-carducci-3.webp`,
            `${baseUrl}images/nina-carducci-audit-before.webp`,
            `${baseUrl}images/nina-carducci-audit-after.webp`,
            `${baseUrl}images/nina-carducci.webp`
        ],
        tags: ["Lighthouse", "SEO", "Accessibility", "Image Optimization"],
        githubUrl: "https://github.com/OpenClassrooms-Student-Center/Nina-Carducci-Dev.git",
        liveUrl: "https://nina-carducci.github.io/"
    },
    {
        id: "kasa",
        title: "Kasa",
        category: "React & Architecture de Composants",
        description: {
            fr: "Application monopage moderne construite avec React, React Router et un SASS modulaire, avec chargement dynamique des données et composants repliables sur mesure.",
            en: "Modern single-page application built with React, React Router, and modular SASS, featuring dynamic data loading and custom collapsible components."
        },
        images: [
            `${baseUrl}images/kasa-thumb.webp`,
            `${baseUrl}images/kasa-1.webp`,
            `${baseUrl}images/kasa-fiche.webp`,
            `${baseUrl}images/kasa-about.webp`,
            `${baseUrl}images/kasa-404.webp`,
            `${baseUrl}images/kasa-mobile-home.webp`,
            `${baseUrl}images/kasa-mobile-fiche.webp`,
            `${baseUrl}images/kasa-mobile-about.webp`,
            `${baseUrl}images/kasa-mobile-404.webp`,
            `${baseUrl}images/kasa-logo.webp`
        ],
        tags: ["React", "React Router", "SASS", "Responsive Design"],
        githubUrl: "https://github.com/OpenClassrooms-Student-Center/TesteurLogiciel_appli_location_immobiliere_React.git"
    },
    {
        id: "mon-vieux-grimoire",
        title: "Mon Vieux Grimoire",
        category: "API Backend Node.js & MongoDB",
        description: {
            fr: "Application full-stack de notation et d'avis de livres avec une API REST sécurisée construite en Node.js, Express et MongoDB, incluant l'authentification JWT et le traitement d'images.",
            en: "Full-stack book rating and review application featuring a secure RESTful API built with Node.js, Express, and MongoDB, complete with JWT authentication and image processing."
        },
        images: [
            `${baseUrl}images/mon-vieux-grimoire-thumb.webp`,
            `${baseUrl}images/mon-vieux-grimoire-home.webp`,
            `${baseUrl}images/mon-vieux-grimoire-signup.webp`,
            `${baseUrl}images/mon-vieux-grimoire-logo.webp`,
            `${baseUrl}images/mon-vieux-grimoire-1.webp`
        ],
        tags: ["Node.js", "Express", "MongoDB", "Mongoose", "JWT", "REST API"],
        githubUrl: "https://github.com/OpenClassrooms-Student-Center/P7-Dev-Web-livres.git"
    },
    {
        id: "openclassrooms-parcours",
        title: "Formation Développeur Web",
        category: "Cursus Professionnel RNCP Niveau 5",
        description: {
            fr: "Validation de l'ensemble des projets professionnels du parcours certifiant : intégration responsive (Booki), DOM & API (Sophie Bluel), audit SEO/Lighthouse (Nina Carducci), SPAs React modulaires (Kasa), gestion de projet Agile & Kanban (Menu Maker by Qwenta), et architecture d'API REST sécurisées en Node.js/MongoDB (Mon Vieux Grimoire).",
            en: "Completion of all professional deliverables in the RNCP Level 5 developer curriculum: responsive layouts (Booki), dynamic DOM manipulation (Sophie Bluel), Lighthouse audits & accessibility (Nina Carducci), modular React SPAs (Kasa), Agile & Kanban workflow (Qwenta), and secure Node.js/MongoDB REST APIs (Mon Vieux Grimoire)."
        },
        images: [
            `${baseUrl}images/ocr-parcours-thumb.webp`
        ],
        tags: ["HTML5/CSS3", "JavaScript", "React", "Node.js", "Express", "MongoDB", "Lighthouse", "Agile"],
        githubUrl: "https://github.com/alexandru0705"
    }
];

export { projectsData };