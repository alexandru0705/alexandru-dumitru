import './Footer.scss';

const NAV_LINKS = [
  { id: 'banner', label: 'Home' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'contact', label: 'Contact' }
];

function Footer() {
  const year = new Date().getFullYear();

  const scrollToSection = (event, sectionId) => {
    event.preventDefault();
    const element =
      typeof document !== 'undefined'
        ? document.getElementById(sectionId)
        : null;

    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-nav-group">
            <span className="footer-heading">Navigate</span>
            <nav className="footer-nav" aria-label="Footer">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.id}
                  className="footer-nav-link"
                  href={`#${link.id}`}
                  onClick={(event) => scrollToSection(event, link.id)}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="footer-social-group">
            <span className="footer-heading">Elsewhere</span>
            <div className="footer-social">
              <a
                className="footer-social-link"
                href="https://github.com/alexandru0705"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub profile (opens in a new tab)"
              >
                GitHub
              </a>
              <a
                className="footer-social-link"
                href="mailto:alexandru0705@gmail.com"
                aria-label="Send an email"
              >
                Email
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            &copy; {year} Alexandru Dumitru. All rights reserved.
          </p>
          <a
            className="footer-back-to-top"
            href="#banner"
            onClick={(event) => scrollToSection(event, 'banner')}
          >
            Back to top &uarr;
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;