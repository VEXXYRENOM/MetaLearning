import React, { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, Text, Html, Sphere, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

// Safe Math Equation Parser
const parseEquation = (eq: string) => {
    try {
        let p = eq.replace(/(sin|cos|tan|abs|sqrt|exp|log|pow|min|max|PI|E)/g, "Math.$1");
        return new Function("x", "y", "t", "f", "a", `try { return ${p}; } catch(e) { return 0; }`) as (x: number, y: number, t: number, f: number, a: number) => number;
    } catch {
        return () => 0; 
    }
};

export const FunctionGraph3D: React.FC = () => {
    // Math Parameters
    const [equation, setEquation] = useState("sin(x * f + t) * cos(y * f + t) * a");
    const [freq, setFreq] = useState(2);
    const [amp, setAmp] = useState(0.8);
    const [wireframe, setWireframe] = useState(false);
    const [showContour, setShowContour] = useState(true);
    
    // AI Gradient Descent
    const [aiActive, setAiActive] = useState(false);
    const aiPos = useRef(new THREE.Vector2(0, 0)); 
    const lr = 0.8;
    
    // Tooltip Tracker
    const [hoverPt, setHoverPt] = useState<THREE.Vector3 | null>(null);

    // Dynamic Evaluator
    const mathFunc = useMemo(() => parseEquation(equation), [equation]);
    
    // Refs
    const groupRef = useRef<THREE.Group>(null);
    const surfaceRef = useRef<THREE.Mesh>(null);
    const contourRef = useRef<THREE.Mesh>(null);
    const aiBallRef = useRef<THREE.Mesh>(null);
    
    // Window State (Draggable, Resizable, Collapsible)
    const [panelPos, setPanelPos] = useState({ x: -100, y: -300 }); // Default position avoiding left sidebar
    const [panelScale, setPanelScale] = useState(1);
    const [isMinimized, setIsMinimized] = useState(false);
    const isDragging = useRef(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const initialPos = useRef({ x: 0, y: 0 });

    const handleDragStart = (e: React.PointerEvent) => {
        isDragging.current = true;
        dragStart.current = { x: e.clientX, y: e.clientY };
        initialPos.current = { ...panelPos };
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handleDragMove = (e: React.PointerEvent) => {
        if (isDragging.current) {
            const dx = e.clientX - dragStart.current.x;
            const dy = e.clientY - dragStart.current.y;
            setPanelPos({ 
                x: initialPos.current.x - dx, // Subtracted because we use "right" CSS property
                y: initialPos.current.y + dy 
            });
        }
    };

    const handleDragEnd = (e: React.PointerEvent) => {
        isDragging.current = false;
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    };

    // Geometry Definition
    const resolution = 70;
    const size = 6;
    
    const { geometry, posArrayBase } = useMemo(() => {
        const geo = new THREE.PlaneGeometry(size, size, resolution, resolution);
        const pos = geo.attributes.position.array as Float32Array;
        const base = new Float32Array(pos.length);
        base.set(pos);
        geo.setAttribute("color", new THREE.BufferAttribute(new Float32Array(pos.length), 3));
        return { geometry: geo, posArrayBase: base };
    }, []);

    const getZ = (x: number, y: number, t: number) => {
        const z = mathFunc(x, y, t, freq, amp);
        return Number.isFinite(z) ? THREE.MathUtils.clamp(z, -5, 5) : 0;
    };

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        
        if (groupRef.current) {
            groupRef.current.rotation.z = t * 0.05; 
        }

        if (surfaceRef.current) {
            const positions = geometry.attributes.position.array as Float32Array;
            const colors = geometry.attributes.color.array as Float32Array;
            let highestZ = -999;
            let highestPt = new THREE.Vector2();

            for (let i = 0; i < positions.length / 3; i++) {
                const x = posArrayBase[i * 3];
                const y = posArrayBase[i * 3 + 1];
                const z = getZ(x, y, t);
                
                positions[i * 3 + 2] = z;
                if (z > highestZ) { highestZ = z; highestPt.set(x, y); }

                const norm = (z + amp) / (amp * 2); 
                colors[i * 3] = norm; 
                colors[i * 3 + 1] = 0.5 - Math.abs(norm - 0.5); 
                colors[i * 3 + 2] = 1 - norm; 
            }

            geometry.attributes.position.needsUpdate = true;
            geometry.attributes.color.needsUpdate = true;
            geometry.computeVertexNormals();

            if (aiActive && aiBallRef.current) {
                const eps = 0.05;
                const currX = aiPos.current.x;
                const currY = aiPos.current.y;
                const currZ = getZ(currX, currY, t);
                const dx = (getZ(currX + eps, currY, t) - getZ(currX - eps, currY, t)) / (2 * eps);
                const dy = (getZ(currX, currY + eps, t) - getZ(currX, currY - eps, t)) / (2 * eps);

                aiPos.current.x -= dx * lr * 0.01;
                aiPos.current.y -= dy * lr * 0.01;
                aiPos.current.x = THREE.MathUtils.clamp(aiPos.current.x, -size/2, size/2);
                aiPos.current.y = THREE.MathUtils.clamp(aiPos.current.y, -size/2, size/2);

                const finalZ = getZ(aiPos.current.x, aiPos.current.y, t);
                aiBallRef.current.position.set(aiPos.current.x, aiPos.current.y, finalZ + 0.1);
            } else if (!aiActive) {
                aiPos.current.copy(highestPt);
            }
        }
    });

    const handlePointerMove = (e: any) => {
        if (e.intersections && e.intersections.length > 0) {
            setHoverPt(e.point);
        }
    };

    const Axis = ({ dir, color, label }: { dir: [number, number, number]; color: string; label: string }) => {
        const len = 3.5;
        const end: [number, number, number] = [dir[0] * len, dir[1] * len, dir[2] * len];
        const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(...end)];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        return (
          <group>
            <primitive object={new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color, linewidth: 3 }))} />
            <Text position={[end[0] * 1.05, end[1] * 1.05, end[2] * 1.05]} fontSize={0.25} color={color}>{label}</Text>
          </group>
        );
    };

    return (
        <group position={[0, -0.5, 0]}>
            <Environment preset="city" />
            <ambientLight intensity={0.6} />
            <directionalLight position={[0, 10, 5]} intensity={1} />

            <group rotation={[-Math.PI / 2, 0, 0]}>
                {groupRef && <group ref={groupRef}>
                    <mesh ref={surfaceRef} geometry={geometry} onPointerMove={handlePointerMove} onPointerOut={() => setHoverPt(null)}>
                        <meshPhysicalMaterial vertexColors side={THREE.DoubleSide} roughness={0.2} metalness={0.1} wireframe={wireframe} transparent opacity={wireframe ? 0.3 : 1} />
                    </mesh>

                    {aiActive && (
                        <Sphere ref={aiBallRef} args={[0.15, 16, 16]}>
                            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.8} />
                            <Html position={[0, 0.3, 0]} center>
                                <div style={{ background: "#ef4444", color: "white", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: "bold" }}>
                                    انحدار للحد الأدنى
                                </div>
                            </Html>
                        </Sphere>
                    )}

                    {showContour && (
                        <group position={[0, 0, -amp - 0.5]} scale={[1, 1, 0.001]}> 
                            <mesh ref={contourRef} geometry={geometry}>
                                <meshBasicMaterial vertexColors wireframe transparent opacity={0.4} side={THREE.DoubleSide} />
                            </mesh>
                            <gridHelper args={[size, 20, "#3b82f6", "#1e293b"]} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} />
                        </group>
                    )}
                </group>}
                
                <Axis dir={[1, 0, 0]} color="#ef4444" label="X" />
                <Axis dir={[0, 1, 0]} color="#22c55e" label="Y" />
                <Axis dir={[0, 0, 1]} color="#3b82f6" label="Z" />
            </group>

            {hoverPt && (
                <Html position={[hoverPt.x, hoverPt.y + 0.2, hoverPt.z]} center style={{ pointerEvents: "none" }}>
                    <div style={{ background: "rgba(0,0,0,0.8)", padding: "4px 8px", borderRadius: "6px", color: "#38bdf8", fontSize: "12px", border: "1px solid #38bdf8", fontFamily: "monospace", pointerEvents: "none" }}>
                        X: {hoverPt.x.toFixed(2)}<br/>
                        Y: {-hoverPt.z.toFixed(2)}<br/>
                        Z: {hoverPt.y.toFixed(2)}
                    </div>
                </Html>
            )}

            {/* Draggable Dashboard */}
            <Html center transform={false} zIndexRange={[200, 0]}>
                <div 
                    style={{ 
                        position: "absolute", 
                        top: panelPos.y, 
                        right: panelPos.x, 
                        background: "rgba(10, 15, 25, 0.85)",
                        borderRadius: "12px",
                        color: "white",
                        width: "360px",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        fontFamily: "system-ui, sans-serif",
                        boxShadow: "0 10px 20px -5px rgba(0, 0, 0, 0.5)",
                        transform: `scale(${panelScale})`,
                        transformOrigin: "top right",
                        pointerEvents: "auto",
                        transition: isDragging.current ? "none" : "transform 0.2s"
                    }} 
                    dir="rtl"
                >
                    {/* Header: Draggable handle & Window Controls */}
                    <div 
                        onPointerDown={handleDragStart}
                        onPointerMove={handleDragMove}
                        onPointerUp={handleDragEnd}
                        onPointerCancel={handleDragEnd}
                        style={{ 
                            padding: "0.8rem 1rem", 
                            background: "rgba(0,0,0,0.3)", 
                            borderTopLeftRadius: "12px", 
                            borderTopRightRadius: "12px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            cursor: isDragging.current ? "grabbing" : "grab",
                            userSelect: "none"
                        }}
                    >
                        <h3 style={{ margin: 0, color: "#60a5fa", fontSize: "1rem", pointerEvents: "none" }}>
                            عنصر تحكم الدالة (اسحبني)
                        </h3>
                        <div style={{ display: "flex", gap: "6px" }}>
                            <button onClick={() => setPanelScale(prev => Math.min(prev + 0.1, 1.5))} style={{ width: "24px", height: "24px", borderRadius: "12px", border: "1px solid #334155", background: "#1e293b", color: "#e2e8f0", cursor: "pointer" }}>+</button>
                            <button onClick={() => setPanelScale(prev => Math.max(prev - 0.1, 0.5))} style={{ width: "24px", height: "24px", borderRadius: "12px", border: "1px solid #334155", background: "#1e293b", color: "#e2e8f0", cursor: "pointer" }}>-</button>
                            <button onClick={() => setIsMinimized(!isMinimized)} style={{ width: "24px", height: "24px", borderRadius: "12px", border: "1px solid #334155", background: "#f59e0b", color: "#000", cursor: "pointer", fontWeight: "bold" }}>{isMinimized ? "☐" : "_"}</button>
                        </div>
                    </div>

                    {/* Window Body */}
                    {!isMinimized && (
                        <div style={{ padding: "1rem" }}>
                            <div style={{ marginBottom: "1rem" }}>
                                <label style={{ fontSize: "0.85rem", color: "#94a3b8", display: "block", marginBottom: "0.5rem" }}>المعادلة الرياضية Z = f(x,y):</label>
                                <input type="text" style={{ width: "100%", padding: "0.6rem", background: "#0f172a", border: "1px solid #334155", borderRadius: "6px", color: "#34d399", fontFamily: "monospace", fontSize: "1rem" }} value={equation} onChange={e => setEquation(e.target.value)} />
                            </div>

                            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: "0.85rem", color: "#94a3b8", display: "block" }}>التردد: {freq.toFixed(1)}</label>
                                    <input type="range" min="0.1" max="5" step="0.1" value={freq} onChange={e => setFreq(Number(e.target.value))} style={{ width: "100%" }}/>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: "0.85rem", color: "#94a3b8", display: "block" }}>السعة: {amp.toFixed(1)}</label>
                                    <input type="range" min="0.1" max="3" step="0.1" value={amp} onChange={e => setAmp(Number(e.target.value))} style={{ width: "100%" }}/>
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                                <button onClick={() => setWireframe(!wireframe)} style={{ flex: 1, padding: "0.5rem", background: wireframe ? "#f59e0b" : "#334155", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>سلكي (Wire)</button>
                                <button onClick={() => setShowContour(!showContour)} style={{ flex: 1, padding: "0.5rem", background: showContour ? "#8b5cf6" : "#334155", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>كنتور (Contour)</button>
                            </div>

                            <div style={{ background: "#1e1b4b", border: "1px solid #4338ca", borderRadius: "8px", padding: "0.8rem", textAlign: "center" }}>
                                <h4 style={{ margin: "0 0 0.5rem 0", color: "#818cf8" }}>AI Gradient Descent</h4>
                                <button onClick={() => setAiActive(!aiActive)} style={{ width: "100%", padding: "0.5rem", background: aiActive ? "#ef4444" : "#4338ca", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
                                    {aiActive ? "إيقاف المحاكاة ⏹️" : "تشغيل التدحرج الذكي ▶️"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </Html>
            
            <ContactShadows position={[0, -2.5, 0]} opacity={0.6} scale={15} blur={2.5} far={4} color="#000000" />
        </group>
    );
};

export default FunctionGraph3D;
