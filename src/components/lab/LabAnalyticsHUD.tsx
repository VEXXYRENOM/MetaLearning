import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, TooltipProps } from "recharts";
import { BeakerSubstance, getElementById } from "../../lib/labElements";

interface LabAnalyticsHUDProps {
  tempHistory: { time: number; temp: number }[];
  substances: BeakerSubstance[];
}

export function LabAnalyticsHUD({ tempHistory, substances }: LabAnalyticsHUDProps) {
  // Process substances for Pie Chart
  const pieData = substances.map(sub => {
    const el = getElementById(sub.elementId);
    return {
      name: el ? el.id : sub.elementId,
      value: sub.mass, // We use mass for pie chart percentage
      color: el ? el.color : "#ffffff",
      moles: sub.moles
    };
  });

  return (
    <div style={{
      position: "absolute", top: "20px", right: "20px", width: "300px",
      display: "flex", flexDirection: "column", gap: "16px", zIndex: 40,
      pointerEvents: "none" // so it doesn't block 3D clicks unless we want it to
    }}>
      
      {/* Thermodynamics Graph */}
      <div style={{
        background: "rgba(15,23,42,0.85)", backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px",
        padding: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
      }}>
        <h3 style={{ margin: "0 0 12px", fontSize: "0.85rem", color: "#f8fafc", display: "flex", justifyContent: "space-between" }}>
          <span>♨️ Temperature ($T = f(t)$)</span>
          <span style={{ color: "#ef4444" }}>{tempHistory.length > 0 ? tempHistory[tempHistory.length - 1].temp.toFixed(1) : 25.0}°C</span>
        </h3>
        <div style={{ width: "100%", height: "120px" }}>
          <LineChart width={260} height={120} data={tempHistory}>
              <XAxis dataKey="time" hide />
              <YAxis domain={[20, 120]} hide />
              <Tooltip 
                contentStyle={{ background: "#0f172a", border: "none", borderRadius: "8px", fontSize: "0.75rem", color: "white" }} 
                itemStyle={{ color: "#f8fafc" }}
                labelStyle={{ display: "none" }}
                formatter={(value: any) => [`${Number(value).toFixed(1)}°C`, "Temp"]}
              />
              <Line type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
        </div>
      </div>

      {/* Composition Pie Chart */}
      {substances.length > 0 && (
        <div style={{
          background: "rgba(15,23,42,0.85)", backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px",
          padding: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
        }}>
          <h3 style={{ margin: "0 0 12px", fontSize: "0.85rem", color: "#f8fafc" }}>
            📊 Composition (Mass)
          </h3>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: "100px", height: "100px" }}>
              <PieChart width={100} height={100}>
                  <Pie
                    data={pieData}
                    innerRadius={30}
                    outerRadius={45}
                    paddingAngle={2}
                    dataKey="value"
                    isAnimationActive={false}
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: "#0f172a", border: "none", borderRadius: "8px", fontSize: "0.75rem", color: "white" }} 
                    formatter={(value: any) => [`${Number(value).toFixed(1)}g`, "Mass"]}
                  />
              </PieChart>
            </div>
            
            <div style={{ flex: 1, paddingLeft: "16px", display: "flex", flexDirection: "column", gap: "6px" }}>
              {pieData.map(d => (
                <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.7rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: d.color }}></div>
                    <span style={{ color: "#cbd5e1", fontWeight: 600 }}>{d.name}</span>
                  </div>
                  <span style={{ color: "#94a3b8", fontFamily: "monospace" }}>{d.moles.toFixed(3)} mol</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
