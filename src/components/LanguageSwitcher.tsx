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

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        background: theme === "dark" ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.7)",
        borderRadius: "999px",
        padding: "6px 12px",
        backdropFilter: "blur(8px)",
        border: `1px solid ${theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
      }}
    >
      <Globe size={16} style={{ color: textColor, opacity: 0.7, flexShrink: 0 }} />
      
      <select
        value={current.substring(0, 2)}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
        style={{
          background: "transparent",
          border: "none",
          color: textColor,
          fontSize: "0.85rem",
          fontWeight: 600,
          outline: "none",
          cursor: "pointer",
          paddingRight: "4px",
          fontFamily: "inherit",
          // Removed appearance: "none" so users can see it's a select menu
        }}
      >
        {LANGS.map((lang) => (
          <option key={lang.code} value={lang.code} style={{ color: "#1e293b", background: "white" }}>
            {lang.flag} {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}
