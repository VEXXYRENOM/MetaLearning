import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// ── Import translation files directly (no HTTP backend needed) ──────────────
import ar from "../public/locales/ar.json";
import en from "../public/locales/en.json";
import fr from "../public/locales/fr.json";
import es from "../public/locales/es.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ar: { translation: ar },
      en: { translation: en },
      fr: { translation: fr },
      es: { translation: es },
    },
    supportedLngs: ["ar", "en", "fr", "es"],
    fallbackLng: "ar",

    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "metalearning_lang",
    },

    interpolation: {
      escapeValue: false,
    },
  });

// ── Apply RTL / LTR to <html> whenever language changes ──────────────────────
function applyDirection(lng: string) {
  const isRtl = lng === "ar";
  document.documentElement.setAttribute("dir", isRtl ? "rtl" : "ltr");
  document.documentElement.setAttribute("lang", lng);
}

i18n.on("languageChanged", applyDirection);
applyDirection(i18n.language || "ar");

export default i18n;
