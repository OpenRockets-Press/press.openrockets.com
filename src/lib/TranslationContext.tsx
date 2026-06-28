import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TranslationContextType {
  language: string;
  setLanguage: (lang: string) => void;
  isTranslating: boolean;
  setIsTranslating: (val: boolean) => void;
  isContentLoading: boolean;
  setIsContentLoading: (val: boolean) => void;
  translatedLanguage: string | null;
  setTranslatedLanguage: (val: string | null) => void;
  successMessage: string | null;
  setSuccessMessage: (msg: string | null) => void;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('openrockets_lang') || 'en';
  });
  const [isTranslating, setIsTranslating] = useState(false);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [translatedLanguage, setTranslatedLanguage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('openrockets_lang', language);
  }, [language]);

  return (
    <TranslationContext.Provider value={{ 
      language, setLanguage, 
      isTranslating, setIsTranslating, 
      isContentLoading, setIsContentLoading,
      translatedLanguage, setTranslatedLanguage,
      successMessage, setSuccessMessage
    }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslationContext() {
  const context = useContext(TranslationContext);
  if (!context) throw new Error('useTranslationContext must be used within TranslationProvider');
  return context;
}
