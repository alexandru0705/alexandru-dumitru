import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import translations from '../Data/translations.js';

/**
 * LanguageContext — lightweight FR/EN language state provider.
 *
 * ARCHITECTURE NOTE
 *  - Owns the active language ('fr' | 'en'), defaults to 'fr' (the site's
 *    primary language), and exposes a `t(keyPath)` resolver so components
 *    can pull copy from src/Data/translations.js without importing the
 *    dictionary directly.
 *  - Persistence is intentionally defensive: localStorage access is guarded
 *    with `typeof window !== 'undefined'` (SSR/headless safety) and wrapped
 *    in try/catch (private-browsing modes and storage-quota failures throw
 *    in some engines). Any failure silently degrades to the in-memory
 *    default — the app must never crash because a preference could not be
 *    read or written.
 *  - The stored value is validated against the SUPPORTED_LANGUAGES allowlist
 *    on read, so a corrupted or hand-edited localStorage entry can never
 *    produce an unknown language state.
 */

const SUPPORTED_LANGUAGES = ['fr', 'en'];
const DEFAULT_LANGUAGE = 'fr';
const STORAGE_KEY = 'preferred-language';

/**
 * isSupportedLanguage — allowlist guard for language values.
 *
 * @param {string} value - Candidate language code.
 * @returns {boolean} True only for codes present in SUPPORTED_LANGUAGES.
 */
function isSupportedLanguage(value) {
  return SUPPORTED_LANGUAGES.includes(value);
}

/**
 * readStoredLanguage — safely retrieve the persisted preference.
 *
 * Defensive layers (per the resilience checklist):
 *  1. `typeof window !== 'undefined'` — no `window`/`localStorage` reference
 *     in SSR or headless runtimes (prevents ReferenceError).
 *  2. try/catch — `localStorage.getItem` throws in some private-browsing
 *     configurations; we fall back to DEFAULT_LANGUAGE instead.
 *  3. Allowlist validation — a corrupted stored value is discarded.
 *
 * @returns {string} A supported language code, or DEFAULT_LANGUAGE.
 */
function readStoredLanguage() {
  if (typeof window !== 'undefined') {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (isSupportedLanguage(stored)) {
        return stored;
      }
    } catch (error) {
      // Storage unavailable (private mode, quota, disabled cookies):
      // degrade silently to the default language.
      console.warn('[LanguageContext] Unable to read stored language:', error);
    }
  }
  return DEFAULT_LANGUAGE;
}

/**
 * writeStoredLanguage — safely persist the preference.
 *
 * Same defensive layers as readStoredLanguage: window guard + try/catch.
 * Persistence failure is non-fatal; the in-memory state remains authoritative
 * for the current session.
 *
 * @param {string} language - A supported language code to persist.
 */
function writeStoredLanguage(language) {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, language);
    } catch (error) {
      // Non-fatal: preference simply will not survive a reload.
      console.warn('[LanguageContext] Unable to persist language:', error);
    }
  }
}

/**
 * resolveTranslation — walk a dot-path (e.g. 'nav.home') through the
 * translations dictionary for the active language.
 *
 * Defensive fallback chain (prevents `undefined` render crashes):
 *  1. Active language value at the path.
 *  2. Default language ('fr') value at the same path — covers a missing
 *     key in one language tree (FR/EN drift).
 *  3. The key path itself — last-resort visible string so a typo in a key
 *     is debuggable in the UI instead of rendering blank.
 *
 * @param {string} language - Active language code.
 * @param {string} keyPath - Dot-separated path into the dictionary.
 * @returns {string} Resolved copy string (never undefined).
 */
function resolveTranslation(language, keyPath) {
  const lookup = (lang) => {
    const tree = translations[lang];
    if (!tree || typeof tree !== 'object') {
      return undefined;
    }
    const segments = keyPath.split('.');
    let node = tree;
    for (let i = 0; i < segments.length; i += 1) {
      if (node === null || typeof node !== 'object') {
        return undefined;
      }
      node = node[segments[i]];
    }
    return typeof node === 'string' ? node : undefined;
  };

  return lookup(language) || lookup(DEFAULT_LANGUAGE) || keyPath;
}

const LanguageContext = createContext(null);

/**
 * LanguageProvider — wraps the app tree and supplies language state.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - App tree to wrap.
 */
function LanguageProvider({ children }) {
  // Lazy initializer: readStoredLanguage runs once per mount, keeping the
  // localStorage read out of the render body (idempotent + cheap).
  const [language, setLanguageState] = useState(readStoredLanguage);

  /**
   * setLanguage — validated state setter.
   *
   * Rejects unsupported codes (defensive against future call sites passing
   * browser locales like 'fr-FR') and persists valid changes.
   *
   * @param {string} nextLanguage - Candidate language code.
   */
  const setLanguage = useCallback((nextLanguage) => {
    if (!isSupportedLanguage(nextLanguage)) {
      console.warn(
        `[LanguageContext] Ignoring unsupported language: ${String(nextLanguage)}`
      );
      return;
    }
    setLanguageState(nextLanguage);
    writeStoredLanguage(nextLanguage);
  }, []);

  /**
   * toggleLanguage — flip between the two supported languages.
   *
   * @returns {void}
   */
  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'fr' ? 'en' : 'fr');
  }, [language, setLanguage]);

  /**
   * t — translation resolver bound to the active language.
   *
   * @param {string} keyPath - Dot-separated key path (e.g. 'nav.home').
   * @returns {string} Resolved copy string (never undefined).
   */
  const t = useCallback(
    (keyPath) => resolveTranslation(language, keyPath),
    [language]
  );

  // Keep the document element's `lang` attribute in sync for accessibility
  // (screen readers announce the correct language). Guarded: `document`
  // does not exist in headless runtimes, and attribute writes are wrapped
  // in try/catch per the defensive DOM-mutation rule.
  useEffect(() => {
    if (typeof document !== 'undefined') {
      try {
        document.documentElement.setAttribute('lang', language);
      } catch (error) {
        // Non-fatal: cosmetic a11y attribute only.
        console.warn('[LanguageContext] Unable to set document lang:', error);
      }
    }
  }, [language]);

  const contextValue = useMemo(
    () => ({ language, setLanguage, toggleLanguage, t }),
    [language, setLanguage, toggleLanguage, t]
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * useLanguage — consume the language context from any component.
 *
 * Throws a descriptive error when used outside <LanguageProvider> so a
 * missing provider fails loudly at the call site instead of surfacing as
 * a cryptic "cannot read properties of null" crash deeper in the tree.
 *
 * @returns {{
 *   language: string,
 *   setLanguage: (nextLanguage: string) => void,
 *   toggleLanguage: () => void,
 *   t: (keyPath: string) => string
 * }}
 */
function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === null) {
    throw new Error(
      'useLanguage must be used within a <LanguageProvider>. ' +
        'Wrap your app tree (see src/main.jsx) to enable language switching.'
    );
  }
  return context;
}

export { LanguageProvider, useLanguage }; // eslint-disable-line react-refresh/only-export-components
