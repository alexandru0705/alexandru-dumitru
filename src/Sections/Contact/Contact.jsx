import { useState } from 'react';
import './Contact.scss';

/**
 * EMAIL VALIDATION PATTERN
 * A deliberately pragmatic regex: "something@something.something".
 * It is intentionally NOT a full RFC 5322 implementation — client-side email
 * checks exist to catch typos early, not to be an authority on deliverability.
 * The server (or mail provider) remains the source of truth.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * INITIAL_FORM
 * A frozen-at-module-load shape for the form. Every reset path (post-success,
 * manual reset) spreads this constant, so "what a clean form looks like" has
 * exactly one definition — no risk of a reset accidentally forgetting a field.
 */
const INITIAL_FORM = {
  name: '',
  email: '',
  subject: '',
  message: ''
};

/**
 * validateForm — pure function, no side effects.
 *
 * Returns an object whose keys are the INVALID field names and whose values
 * are human-readable error messages. An empty object === a valid form.
 *
 * Why pure? It is trivially testable, re-runnable on every submit without
 * caching concerns, and keeps ALL validation rules in one visible place.
 *
 * Every check trims first: "   " is not a name, and " a@b.co " has valid
 * content but padded edges.
 */
function validateForm(values) {
  const errors = {};

  if (!values.name || values.name.trim() === '') {
    errors.name = 'Please enter your name.';
  }

  if (!values.email || values.email.trim() === '') {
    errors.email = 'Please enter your email address.';
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!values.subject || values.subject.trim() === '') {
    errors.subject = 'Please enter a subject.';
  }

  if (!values.message || values.message.trim() === '') {
    errors.message = 'Please enter a message.';
  } else if (values.message.trim().length < 10) {
    // Minimum length catches accidental one-word messages without being
    // annoyingly strict.
    errors.message = 'Your message should be at least 10 characters long.';
  }

  return errors;
}

/**
 * Contact — section combining a direct-contact card and a validated message
 * form.
 *
 * FORM STATE MACHINE
 *   idle ──submit(valid)──► submitting ──timeout──► success
 *      │                                                    │
 *      └──submit(invalid)──► error ◄────────────────────────┘ (reset)
 *
 *  - idle:      no status banner, form editable.
 *  - submitting: submit button disabled + label change ("Sending…").
 *                (Prevents double-submits; here the "request" is simulated
 *                with a timeout — swap for a real fetch without touching the
 *                state machine.)
 *  - success:   confirmation banner (role="status" = polite announcement) +
 *                "Send Another" reset; form is already cleared.
 *  - error:     alert banner (role="alert" = urgent announcement) + per-field
 *                messages; form values are PRESERVED so the user only re-enters
 *                what was wrong.
 */
function Contact() {
  // Controlled inputs: the form object is the single source of truth for
  // field values. React re-renders the inputs from state on every keystroke
  // (via handleChange below), which makes validation, reset, and success-
  // clearing all trivial — no DOM scraping, no uncontrolled desync.
  const [form, setForm] = useState(INITIAL_FORM);
  // ERROR STATE ISOLATION
  // Field errors live in their OWN state object, separate from the status
  // banner and the form values. This separation means:
  //  - clearing an error never touches the value the user typed,
  //  - a status banner ("please correct fields") and per-field hints can
  //    render independently,
  //  - resetting one concern (e.g. errors) cannot corrupt the others.
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');

  // CONTROLLED INPUT HANDLER
  //  - Spreads a fresh object (never mutates `form`), so React's change
  //    detection works and siblings stay pure.
  //  - name is read from the input itself (name attribute), keeping this one
  //    handler generic for all four fields — no per-field duplication.
  //  - Inline error clearing: if a field currently has an error and the user
  //    starts typing again, that field's error disappears immediately (live
  //    feedback). We delete ONLY that key so sibling errors stay visible.
  //  - `if (errors[name])` guards against creating a fresh empty object on
  //    every keystroke for already-valid fields (avoiding needless re-renders).
  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Guard against double-fire while a (simulated) request is in flight.
    if (status === 'submitting') {
      return;
    }

    const validationErrors = validateForm(form);

    if (Object.keys(validationErrors).length > 0) {
      // Invalid: record all field errors at once (not just the first) and
      // raise the error status. Form values stay intact.
      setErrors(validationErrors);
      setStatus('error');
      return;
    }

    // Valid: clear any stale errors, enter submitting…
    setErrors({});
    setStatus('submitting');

    // Simulated network round-trip. In production this would be an
    // async request; the state transitions around it would be identical.
    fetch('https://formspree.io/f/mzednyno', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.message,
      }),
    })
      .then((response) => {
        if (response.ok) {
          setStatus('success');
          setForm(INITIAL_FORM);
        } else {
          setStatus('error');
        }
      })
      .catch(() => {
        setStatus('error');
      });
  };

  // handleReset — the graceful reset action shown after a success:
  // clears values, clears errors, and drops the status banner back to idle.
  // One function, three concerns, all restored from the same initial shapes.
  const handleReset = () => {
    setForm(INITIAL_FORM);
    setErrors({});
    setStatus('idle');
  };

  // Banner copy derived from status — keeping the strings adjacent to the
  // state machine makes copy changes obvious in review.
  const statusMessage =
    status === 'success'
      ? 'Thanks for reaching out! Your message has been recorded and I will get back to you shortly.'
      : status === 'error'
        ? 'Please correct the highlighted fields and try again.'
        : null;

  return (
    <div className="contact-section">
      <div className="contact-header">
        <h2 className="contact-title">Get In Touch</h2>
        <p className="contact-subtitle">
          Have a project in mind, a role to discuss, or just want to say hello?
          My inbox is always open.
        </p>
      </div>

      <div className="contact-layout">
        {/* Direct contact card — plain anchors, no JS needed. mailto: gives
            a working email action even without a form backend. */}
        <aside className="contact-info">
          <h3 className="contact-info-heading">Direct Contact</h3>
          <p className="contact-info-text">
            The fastest way to reach me is by email. I typically respond
            within one business day.
          </p>

          <ul className="contact-info-list">
            <li className="contact-info-item">
              <span className="contact-info-label">Email</span>
              <a
                className="contact-info-link"
                href="mailto:alexandru0705@gmail.com"
              >
                alexandru0705@gmail.com
              </a>
            </li>
            <li className="contact-info-item">
              <span className="contact-info-label">GitHub</span>
              <a
                className="contact-info-link"
                href="https://github.com/alexandru0705"
                target="_blank"
                rel="noopener noreferrer"
              >
                github.com/alexandru0705
              </a>
            </li>
            <li className="contact-info-item">
              <span className="contact-info-label">Location</span>
              <span className="contact-info-value">Paris, France</span>
            </li>
          </ul>
        </aside>

        {/* noValidate: the browser's built-in validation (red bubbles,
            "please fill out this field") is DISABLED so our custom validation
            and styling own the entire error experience — no competing
            native dialogs. */}
        <form
          className="contact-form"
          onSubmit={handleSubmit}
          noValidate
          aria-describedby={statusMessage ? 'contact-status' : undefined}
        >
          {/* Banner: role flips with severity — "status" (polite, success)
              vs "alert" (assertive, error) controls how screen readers
              interrupt the user. */}
          {statusMessage && (
            <div
              id="contact-status"
              className={`contact-status contact-status--${status}`}
              role={status === 'success' ? 'status' : 'alert'}
            >
              {statusMessage}
            </div>
          )}

          {/* FIELD PATTERN (repeated per field):
              - label htmlFor ↔ input id: click-to-focus + sr announcement.
              - aria-invalid (boolean) marks the field as erroneous.
              - aria-describedby points at the error <p>'s id so the message
                is announced WITH the field, not orphaned.
              - All three attributes are `undefined` (not empty strings) when
                valid, so no bogus ARIA is emitted on clean fields. */}
          <div className="contact-field">
            <label className="contact-label" htmlFor="contact-name">
              Name
            </label>
            <input
              id="contact-name"
              name="name"
              type="text"
              className={`contact-input${errors.name ? ' contact-input--error' : ''
                }`}
              placeholder="Your full name"
              value={form.name}
              onChange={handleChange}
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? 'contact-name-error' : undefined}
              autoComplete="name"
            />
            {errors.name && (
              <p
                id="contact-name-error"
                className="contact-error"
                role="alert"
              >
                {errors.name}
              </p>
            )}
          </div>

          <div className="contact-field">
            <label className="contact-label" htmlFor="contact-email">
              Email
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              className={`contact-input${errors.email ? ' contact-input--error' : ''
                }`}
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={
                errors.email ? 'contact-email-error' : undefined
              }
              autoComplete="email"
            />
            {errors.email && (
              <p
                id="contact-email-error"
                className="contact-error"
                role="alert"
              >
                {errors.email}
              </p>
            )}
          </div>

          <div className="contact-field">
            <label className="contact-label" htmlFor="contact-subject">
              Subject
            </label>
            <input
              id="contact-subject"
              name="subject"
              type="text"
              className={`contact-input${errors.subject ? ' contact-input--error' : ''
                }`}
              placeholder="What is this about?"
              value={form.subject}
              onChange={handleChange}
              aria-invalid={errors.subject ? true : undefined}
              aria-describedby={
                errors.subject ? 'contact-subject-error' : undefined
              }
            />
            {errors.subject && (
              <p
                id="contact-subject-error"
                className="contact-error"
                role="alert"
              >
                {errors.subject}
              </p>
            )}
          </div>

          <div className="contact-field">
            <label className="contact-label" htmlFor="contact-message">
              Message
            </label>
            <textarea
              id="contact-message"
              name="message"
              rows={5}
              className={`contact-input contact-textarea${errors.message ? ' contact-input--error' : ''
                }`}
              placeholder="Tell me a little about your project or question..."
              value={form.message}
              onChange={handleChange}
              aria-invalid={errors.message ? true : undefined}
              aria-describedby={
                errors.message ? 'contact-message-error' : undefined
              }
            />
            {errors.message && (
              <p
                id="contact-message-error"
                className="contact-error"
                role="alert"
              >
                {errors.message}
              </p>
            )}
          </div>

          <div className="contact-actions">
            {/* disabled while submitting — belt and braces with the JS
                guard inside handleSubmit (the attribute also gives the
                pointer/cursor state for free). */}
            <button
              type="submit"
              className="contact-submit"
              disabled={status === 'submitting'}
            >
              {status === 'submitting' ? 'Sending...' : 'Send Message'}
            </button>

            {/* The graceful post-success reset, rendered only when relevant. */}
            {status === 'success' && (
              <button type="button" className="contact-reset" onClick={handleReset}>
                Send Another
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default Contact;