import React from "react";
import { X, Download, Printer } from "lucide-react";
import { BeakerSubstance, getElementById } from "../../lib/labElements";

export interface ReactionLogItem {
  id: string;
  time: Date;
  type: "pour" | "reaction" | "heat" | "boil";
  message: string;
  details?: string;
}

interface LabReportOverlayProps {
  logs: ReactionLogItem[];
  finalSubstances: BeakerSubstance[];
  onClose: () => void;
}

export function LabReportOverlay({ logs, finalSubstances, onClose }: LabReportOverlayProps) {
  // Generate conclusion
  let conclusion = "Experiment completed. ";
  const hasReactions = logs.some(l => l.type === "reaction");
  const hasBoil = logs.some(l => l.type === "boil");
  
  if (hasReactions) {
    conclusion += "Chemical reactions were successfully triggered and observed. ";
  } else {
    conclusion += "No chemical reactions occurred; elements were simply mixed. ";
  }
  
  if (hasBoil) {
    conclusion += "The thermodynamic phase change (boiling) of water was observed at 100°C. ";
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(2,6,23,0.8)", backdropFilter: "blur(8px)",
      zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div 
        id="lab-report-content"
        style={{
        background: "#ffffff", color: "#0f172a", width: "90%", maxWidth: "800px",
        maxHeight: "90vh", borderRadius: "12px", display: "flex", flexDirection: "column",
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", overflow: "hidden"
      }}>
        {/* Header */}
        <div style={{ 
          padding: "20px 24px", borderBottom: "1px solid #e2e8f0", 
          display: "flex", justifyContent: "space-between", alignItems: "center",
          background: "#f8fafc" 
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "#1e293b" }}>
              Official Laboratory Report
            </h2>
            <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "0.85rem" }}>
              MetaLearning Interactive Chemistry Engine
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button onClick={handlePrint} style={{
              background: "#e2e8f0", border: "none", padding: "8px 12px", borderRadius: "8px",
              display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontWeight: 600, color: "#334155"
            }}>
              <Printer size={16} /> Print
            </button>
            <button onClick={onClose} style={{
              background: "#fee2e2", border: "none", padding: "8px", borderRadius: "8px",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#ef4444"
            }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px", fontSize: "0.9rem" }}>
            <div><strong>Date:</strong> {new Date().toLocaleString()}</div>
            <div><strong>Student ID:</strong> Unknown</div>
          </div>

          <h3 style={{ borderBottom: "2px solid #e2e8f0", paddingBottom: "8px", color: "#334155" }}>1. Procedure Log</h3>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px 0" }}>
            {logs.length === 0 && <li style={{ color: "#94a3b8" }}>No actions recorded.</li>}
            {logs.map(log => (
              <li key={log.id} style={{ 
                marginBottom: "12px", padding: "12px", borderRadius: "8px",
                background: log.type === "reaction" ? "#f0fdf4" : log.type === "boil" ? "#fef2f2" : "#f8fafc",
                borderLeft: `4px solid ${log.type === "reaction" ? "#22c55e" : log.type === "pour" ? "#3b82f6" : "#ef4444"}`
              }}>
                <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "4px" }}>
                  {log.time.toLocaleTimeString()}
                </div>
                <div style={{ fontWeight: 600, color: "#1e293b" }}>{log.message}</div>
                {log.details && <div style={{ fontSize: "0.85rem", color: "#475569", marginTop: "4px", fontFamily: "monospace" }}>{log.details}</div>}
              </li>
            ))}
          </ul>

          <h3 style={{ borderBottom: "2px solid #e2e8f0", paddingBottom: "8px", color: "#334155" }}>2. Final Beaker Composition</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "24px" }}>
            <thead>
              <tr style={{ background: "#f1f5f9", textAlign: "left" }}>
                <th style={{ padding: "12px", borderBottom: "1px solid #cbd5e1" }}>Substance</th>
                <th style={{ padding: "12px", borderBottom: "1px solid #cbd5e1" }}>State</th>
                <th style={{ padding: "12px", borderBottom: "1px solid #cbd5e1" }}>Moles</th>
                <th style={{ padding: "12px", borderBottom: "1px solid #cbd5e1" }}>Mass (g)</th>
              </tr>
            </thead>
            <tbody>
              {finalSubstances.length === 0 && (
                <tr><td colSpan={4} style={{ padding: "12px", textAlign: "center", color: "#94a3b8" }}>Beaker is empty.</td></tr>
              )}
              {finalSubstances.map((sub, i) => {
                const el = getElementById(sub.elementId);
                return (
                  <tr key={i} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "12px", fontWeight: 600 }}>{el?.name || sub.elementId}</td>
                    <td style={{ padding: "12px", color: "#64748b" }}>{el?.state || "?"}</td>
                    <td style={{ padding: "12px", fontFamily: "monospace" }}>{sub.moles.toFixed(3)} mol</td>
                    <td style={{ padding: "12px", fontFamily: "monospace" }}>{sub.mass.toFixed(2)} g</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <h3 style={{ borderBottom: "2px solid #e2e8f0", paddingBottom: "8px", color: "#334155" }}>3. Conclusion</h3>
          <p style={{ color: "#475569", lineHeight: 1.6, background: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            {conclusion}
          </p>
          
        </div>
      </div>
    </div>
  );
}
