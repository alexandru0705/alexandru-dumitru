import './Error.scss';

function Error({
  message = 'Page or resource not found',
  onReset = null
}) {
  const safeMessage =
    typeof message === 'string' && message.trim() !== ''
      ? message
      : 'Page or resource not found';

  const handleReset = (event) => {
    event.preventDefault();

    if (typeof onReset === 'function') {
      onReset();
    }

    const element =
      typeof document !== 'undefined'
        ? document.getElementById('banner')
        : null;

    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="error-section" role="alert">
      <div className="error-card">
        <span className="error-badge">404</span>
        <h1 className="error-title">Something went wrong</h1>
        <p className="error-message">{safeMessage}</p>
        <p className="error-hint">
          The section you are looking for does not exist or may have been
          moved. You can head back to the top of the page to continue
          browsing.
        </p>
        <div className="error-actions">
          <a
            className="error-cta"
            href="#banner"
            onClick={handleReset}
          >
            Back to Home &uarr;
          </a>
        </div>
      </div>
    </div>
  );
}

export default Error;