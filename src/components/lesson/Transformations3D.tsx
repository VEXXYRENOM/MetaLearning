import React, { useRef, useState, useEffect } from "react";
import { Mesh } from "three";
import { Box, TransformControls, Html, Grid } from "@react-three/drei";

export const Transformations3D: React.FC = () => {
    const meshRef = useRef<Mesh>(null);
    const [mode, setMode] = useState<"translate" | "rotate" | "scale">("translate");
    
    // UI state to display in dashboard
    const [pos, setPos] = useState({ x: 0, y: 0, z: 0 });
    const [rot, setRot] = useState({ x: 0, y: 0, z: 0 });
    const [scl, setScl] = useState({ x: 1, y: 1, z: 1 });

    const updateDashboard = () => {
        if (meshRef.current) {
            setPos({
                x: Number(meshRef.current.position.x.toFixed(2)),
                y: Number(meshRef.current.position.y.toFixed(2)),
                z: Number(meshRef.current.position.z.toFixed(2)),
            });
            // Convert radians to degrees
            setRot({
                x: Number((meshRef.current.rotation.x * (180 / Math.PI)).toFixed(2)),
                y: Number((meshRef.current.rotation.y * (180 / Math.PI)).toFixed(2)),
                z: Number((meshRef.current.rotation.z * (180 / Math.PI)).toFixed(2)),
            });
            setScl({
                x: Number(meshRef.current.scale.x.toFixed(2)),
                y: Number(meshRef.current.scale.y.toFixed(2)),
                z: Number(meshRef.current.scale.z.toFixed(2)),
            });
        }
    };

    // Apply dashboard changes back to mesh
    const handleInputChange = (type: "pos" | "rot" | "scl", axis: "x" | "y" | "z", value: number) => {
        if (!meshRef.current) return;
        if (type === "pos") meshRef.current.position[axis] = value;
        if (type === "scl") meshRef.current.scale[axis] = value;
        if (type === "rot") meshRef.current.rotation[axis] = value * (Math.PI / 180); // Back to radians
        updateDashboard();
    };

    useEffect(() => {
        updateDashboard();
    }, []);

    // Dark vibrant CSS for UI
    const panelStyle: React.CSSProperties = {
        background: "rgba(15, 23, 42, 0.9)",
        padding: "1rem",
        borderRadius: "12px",
        color: "white",
        width: "300px",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.1)",
        fontFamily: "system-ui, sans-serif",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)"
    };

    const flexStyle: React.CSSProperties = { display: "flex", gap: "0.5rem" };

    return (
        <group>
            {/* Environment setup */}
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 10, 5]} intensity={1.5} />
            
            <Grid infiniteGrid sectionColor="#4a5568" cellColor="#2d3748" fadeDistance={30} position={[0, -0.01, 0]} />
            
            {/* The Axes Helper displays X (red), Y (green), Z (blue) axes */}
            <axesHelper args={[5]} />
            
            <TransformControls 
                mode={mode} 
                onObjectChange={updateDashboard}
            >
                <Box ref={meshRef} args={[1, 1, 1]} castShadow receiveShadow>
                     {/* Modern wireframe / transparent material mix */}
                     <meshStandardMaterial color="#6366f1" transparent opacity={0.9} roughness={0.1} metalness={0.2} />
                </Box>
            </TransformControls>

            {/* Dashboard UI overlapping the canvas using Html */}
            {/* Using absolute positioning negative relative to center to place it top/right */}
            <Html center transform={false} zIndexRange={[100, 0]}>
                <div style={{ ...panelStyle, position: "absolute", top: "-35vh", right: "5vw" }} dir="rtl">
                    <h3 style={{ margin: "0 0 1rem 0", borderBottom: "1px solid #334155", paddingBottom: "0.5rem", fontSize: "1.1rem" }}>
                        مختبر التحويلات الهندسية
                    </h3>
                    
                    {/* Control Mode Toggles */}
                    <div style={{ ...flexStyle, marginBottom: "1.2rem" }}>
                        <button 
                             onClick={() => setMode("translate")}
                             style={{ flex: 1, padding: "0.5rem", background: mode === "translate" ? "#3b82f6" : "#334155", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
                        >إزاحة</button>
                        <button 
                             onClick={() => setMode("rotate")}
                             style={{ flex: 1, padding: "0.5rem", background: mode === "rotate" ? "#10b981" : "#334155", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
                        >دوران</button>
                        <button 
                             onClick={() => setMode("scale")}
                             style={{ flex: 1, padding: "0.5rem", background: mode === "scale" ? "#f59e0b" : "#334155", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
                        >تكبير</button>
                    </div>

                    {/* Coordinates Values */}
                    {[
                        { label: "الموقع (Position)", state: pos, type: "pos" },
                        { label: "الدوران (Rotation°)", state: rot, type: "rot" },
                        { label: "الحجم (Scale)", state: scl, type: "scl" }
                    ].map((group) => (
                        <div key={group.type} style={{ marginBottom: "1rem" }}>
                            <div style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "0.3rem" }}>{group.label}</div>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                {(["x", "y", "z"] as const).map(axis => (
                                    <div key={axis} style={{ display: "flex", alignItems: "center", background: "#1e293b", padding: "0.2rem 0.4rem", borderRadius: "4px", flex: 1, border: "1px solid #334155" }}>
                                        <span style={{ color: axis === "x" ? "#ef4444" : axis === "y" ? "#22c55e" : "#3b82f6", marginRight: "0.2rem", fontWeight: "bold", fontSize: "0.8rem" }}>
                                            {axis.toUpperCase()}
                                        </span>
                                        <input 
                                            type="number" 
                                            value={(group.state as Record<string, number>)[axis]} 
                                            onChange={(e) => handleInputChange(group.type as any, axis, parseFloat(e.target.value) || 0)}
                                            style={{ width: "100%", background: "transparent", border: "none", color: "white", outline: "none", textAlign: "left", fontSize: "0.9rem" }} 
                                            step={group.type === "rot" ? 15 : 0.1}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    
                    <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "1rem", textAlign: "center" }}>
                        اسحب المجسم بالماوس أو غير الأرقام.
                        <br/>
                        (يُفضل إيقاف <b>"التدوير التلقائي"</b> من القائمة الجانبية)
                    </div>
                </div>
            </Html>
        </group>
    );
};

export default Transformations3D;
