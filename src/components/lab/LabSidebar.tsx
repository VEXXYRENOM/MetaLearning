import { useState } from "react";
import { LAB_ELEMENTS, ELEMENTS_ONLY, EQUIPMENT_ONLY, LabElement } from "../../lib/labElements";

interface LabSidebarProps {
  onDragStart: (element: LabElement) => void;
}

const C = {
  bg:      "rgba(255,255,255,0.6)",
  card:    "rgba(255,255,255,0.8)",
  border:  "rgba(37,99,235,0.1)",
  text:    "#0f1f3d",
  muted:   "#6b7280",
};

export function LabSidebar({ onDragStart }: LabSidebarProps) {
  const [tab, setTab] = useState<"elements" | "equipment">("elements");
  const items = tab === "elements" ? ELEMENTS_ONLY : EQUIPMENT_ONLY;

  return (
    <aside style={{
      width: "240px", flexShrink: 0,
      background: C.bg,
      borderInlineEnd: `1px solid ${C.border}`,
      display: "flex", flexDirection: "column",
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: `1px solid ${C.border}` }}>
        {(["elements", "equipment"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: "12px 0",
            background: "none", border: "none",
            color: tab === t ? "#a5b4fc" : C.muted,
            fontWeight: tab === t ? 700 : 400,
            fontSize: "0.8rem", cursor: "pointer",
            borderBottom: tab === t ? "2px solid #6366f1" : "2px solid transparent",
            textTransform: "capitalize", transition: "all 0.15s",
          }}>
            {t === "elements" ? "⚗️ Elements" : "🔬 Lab Equipment"}
          </button>
        ))}
      </div>

      <p style={{ margin: "10px 12px 6px", color: C.muted, fontSize: "0.72rem", lineHeight: 1.4 }}>
        Drag bottles into the scene to pour liquids
      </p>

      {/* Element cards */}
      <div style={{ flex: 1, overflowY: "auto", padding: "6px 8px", display: "flex", flexDirection: "column", gap: "6px" }}>
        {items.map((el: LabElement) => (
          <div
            key={el.id}
            draggable
            onDragStart={() => onDragStart(el)}
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: "12px",
              padding: "10px 12px",
              cursor: "grab",
              display: "flex", alignItems: "center", gap: "10px",
              transition: "border-color 0.15s, transform 0.1s",
              userSelect: "none",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = el.color + "66";
              (e.currentTarget as HTMLDivElement).style.transform = "translateX(2px)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = C.border;
              (e.currentTarget as HTMLDivElement).style.transform = "translateX(0)";
            }}
          >
            {/* Color dot */}
            <div style={{
              width: "32px", height: "32px", borderRadius: "10px", flexShrink: 0,
              background: `radial-gradient(circle at 35% 35%, ${el.color}, ${el.emissive})`,
              boxShadow: `0 0 8px ${el.color}55`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.9rem",
            }}>
              {el.emoji}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ color: C.text, fontWeight: 600, fontSize: "0.82rem", whiteSpace: "nowrap" }}>
                {el.id !== el.name ? <><span style={{ color: el.color, fontWeight: 800 }}>{el.id}</span> — </> : null}
                {el.name}
              </div>
              <div style={{ color: C.muted, fontSize: "0.72rem", marginTop: "2px",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {el.description}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reaction hint */}
      <div style={{ padding: "12px", borderTop: `1px solid ${C.border}`,
        background: "rgba(99,102,241,0.08)", fontSize: "0.72rem", color: C.muted, lineHeight: 1.5 }}>
        💡 <strong style={{ color: "#a5b4fc" }}>Tip:</strong> Try dropping Sodium near Water for a dramatic reaction!
      </div>
    </aside>
  );
}
