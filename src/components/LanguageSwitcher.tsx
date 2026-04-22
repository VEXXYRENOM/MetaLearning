import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

const LANGS = [
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
];

interface LanguageSwitcherProps {
  /** 'dark' for light text on dark backgrounds, 'light' for dark text on light backgrounds */
  theme?: "dark" | "light";
}

export function LanguageSwitcher({ theme = "dark" }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const current = i18n.language || "ar";

  const textColor = theme === "dark" ? "rgba(255,255,255,0.85)" : "#1e293b";
  const bgHover  = theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
  const activeBg = theme === "dark" ? "rgba(124,58,237,0.35)" : "rgba(61,156,240,0.15)";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        background: theme === "dark" ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.7)",
        borderRadius: "999px",
        padding: "4px 8px",
        backdropFilter: "blur(8px)",
        border: `1px solid ${theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
      }}
    >
      <Globe size={14} style={{ color: textColor, opacity: 0.7, flexShrink: 0 }} />

      {LANGS.map((lang) => {
        const isActive = current.startsWith(lang.code);
        return (
          <button
            key={lang.code}
            onClick={() => i18n.changeLanguage(lang.code)}
            title={lang.label}
            style={{
              background: isActive ? activeBg : "transparent",
              border: isActive
                ? `1px solid ${theme === "dark" ? "rgba(167,139,250,0.6)" : "rgba(61,156,240,0.5)"}`
                : "1px solid transparent",
              borderRadius: "999px",
              padding: "3px 9px",
              fontSize: "0.75rem",
              fontWeight: isActive ? 700 : 400,
              color: isActive
                ? theme === "dark" ? "#c4b5fd" : "#2563a8"
                : textColor,
              cursor: "pointer",
              transition: "all 0.2s ease",
              whiteSpace: "nowrap",
            }}
            onMouseOver={(e) => {
              if (!isActive) e.currentTarget.style.background = bgHover;
            }}
            onMouseOut={(e) => {
              if (!isActive) e.currentTarget.style.background = "transparent";
            }}
          >
            {lang.flag} {lang.label}
          </button>
        );
      })}
    </div>
  );
}
