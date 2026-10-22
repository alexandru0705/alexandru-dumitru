const baseUrl = import.meta.env.BASE_URL;

const projectsData = [
    {
        id: "booki",
        title: "Booki",
        category: "HTML & CSS / Responsive Design",
        description: "Responsive HTML/CSS prototype for a travel agency startup, focusing on pixel-perfect UI execution and fluid layout adaptation across devices.",
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
        category: "JavaScript & DOM Manipulation",
        description: "Dynamic frontend application integrating an Express backend API with user authentication, media upload modals, and real-time DOM filtering.",
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
        category: "Performance Auditing & Accessibility",
        description: "Complete performance, SEO, and accessibility overhaul for a photographer's portfolio, driving Lighthouse metrics to optimal levels.",
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
        category: "React & Component Architecture",
        description: "Modern single-page application built with React, React Router, and modular SASS, featuring dynamic data loading and custom collapsible components.",
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
        category: "Node.js & MongoDB Backend API",
        description: "Full-stack book rating and review application featuring a secure RESTful API built with Node.js, Express, and MongoDB, complete with JWT authentication and image processing.",
        images: [
            `${baseUrl}images/mon-vieux-grimoire-thumb.webp`,
            `${baseUrl}images/mon-vieux-grimoire-home.webp`,
            `${baseUrl}images/mon-vieux-grimoire-signup.webp`,
            `${baseUrl}images/mon-vieux-grimoire-logo.webp`,
            `${baseUrl}images/mon-vieux-grimoire-1.webp`
        ],
        tags: ["Node.js", "Express", "MongoDB", "Mongoose", "JWT", "REST API"],
        githubUrl: "https://github.com/OpenClassrooms-Student-Center/P7-Dev-Web-livres.git"
    }
];

export { projectsData };