import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import trTranslation from "@/locales/tr.json";
import enTranslation from "@/locales/en.json";

// Get stored language or default to Turkish
const getStoredLanguage = (): string => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("language") || "tr";
  }
  return "tr";
};

i18n.use(initReactI18next).init({
  resources: {
    tr: { translation: trTranslation },
    en: { translation: enTranslation },
  },
  lng: getStoredLanguage(),
  fallbackLng: "tr",
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

// Listen for language changes and persist
i18n.on("languageChanged", (lng) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("language", lng);
  }
});

export default i18n;
