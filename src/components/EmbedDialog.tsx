import { useState } from "react";
import { Copy, Code, Check } from "lucide-react";
import { useTranslation } from "react-i18next";

export function EmbedDialog({ lessonUrl, onClose }: { lessonUrl: string, onClose: () => void }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  
  const embedCode = `<iframe src="${lessonUrl}" width="100%" height="600" style="border: none; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);" allow="fullscreen; vr"></iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(15,23,42,0.8)", backdropFilter: "blur(5px)",
      display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
    }}>
      <div style={{
        background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "16px", padding: "2rem", maxWidth: "500px", width: "95%",
        color: "white", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ margin: 0, fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "10px" }}>
            <Code size={20} color="#3b82f6" /> {t("embed.title", "Embed on your website")}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1.5rem" }}>&times;</button>
        </div>

        <div style={{
          background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)",
          padding: "1rem", borderRadius: "8px", fontFamily: "monospace", fontSize: "0.85rem",
          color: "#a7f3d0", wordBreak: "break-all", marginBottom: "1.5rem", lineHeight: "1.5"
        }}>
          {embedCode}
        </div>

        <button onClick={handleCopy} style={{
          width: "100%", padding: "12px", background: copied ? "rgba(16,185,129,0.2)" : "linear-gradient(90deg, #3b82f6, #a855f7)",
          color: copied ? "#10b981" : "white", border: copied ? "1px solid #10b981" : "none",
          borderRadius: "8px", fontWeight: "bold", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px",
          transition: "all 0.2s"
        }}>
          {copied ? <><Check size={18} /> {t("embed.copied", "Copied!")}</> : <><Copy size={18} /> {t("embed.copy", "Copy Embed Code")}</>}
        </button>
      </div>
    </div>
  );
}
