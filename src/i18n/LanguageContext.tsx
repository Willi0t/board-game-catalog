import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  getTranslations,
  isLanguage,
  swedish,
  type Language,
} from './translations';

const storageKey = 'spelhyllan-language';

type LanguageContextValue = ReturnType<typeof getTranslations> & {
  language: Language;
  setLanguage: (language: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue>({
  language: 'sv',
  setLanguage: () => {},
  ...swedish,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (isLanguage(stored)) return stored;
    } catch {
      // The selector still works when storage is unavailable.
    }
    return 'sv';
  });

  useEffect(() => {
    document.documentElement.lang = language;
    try {
      localStorage.setItem(storageKey, language);
    } catch {
      // The current language remains active for this visit.
    }
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      ...getTranslations(language),
    }),
    [language],
  );
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
