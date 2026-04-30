import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

/* ── Rotating wireframe icosahedron ── */
function GeoSphere({ radius = 2.4, detail = 2, color = "#2563EB", opacity = 0.18, speed = 0.08 }: {
  radius?: number; detail?: number; color?: string; opacity?: number; speed?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.y = t * speed;
    ref.current.rotation.x = t * speed * 0.6;
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[radius, detail]} />
      <meshBasicMaterial color={color} wireframe transparent opacity={opacity} />
    </mesh>
  );
}

/* ── Spinning torus ring ── */
function Ring({ radius = 3.4, tube = 0.014, color = "#7C3AED", opacity = 0.22, rotX = 0, rotY = 0, spinSpeed = 0.1 }: {
  radius?: number; tube?: number; color?: string; opacity?: number; rotX?: number; rotY?: number; spinSpeed?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.z = clock.getElapsedTime() * spinSpeed;
  });
  return (
    <mesh ref={ref} rotation={[rotX, rotY, 0]}>
      <torusGeometry args={[radius, tube, 16, 120]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  );
}

/* ── Floating particle dots ── */
function Particles({ count = 120, spread = 6 }: { count?: number; spread?: number }) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r     = spread * (0.6 + Math.random() * 0.4);
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      arr[i*3]   = r * Math.sin(phi) * Math.cos(theta);
      arr[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i*3+2] = r * Math.cos(phi);
    }
    return arr;
  }, [count, spread]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.04;
    ref.current.rotation.x = clock.getElapsedTime() * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#2563EB" size={0.045} transparent opacity={0.55} sizeAttenuation />
    </points>
  );
}

/* ── Small orbiting satellite dot ── */
function Satellite({ orbitR = 3.8, speed = 0.5, color = "#7C3AED", y = 0.8 }: {
  orbitR?: number; speed?: number; color?: string; y?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() * speed;
    ref.current.position.x = Math.cos(t) * orbitR;
    ref.current.position.z = Math.sin(t) * orbitR;
    ref.current.position.y = y + Math.sin(t * 0.7) * 0.5;
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.12, 16, 16]} />
      <meshBasicMaterial color={color} transparent opacity={0.75} />
    </mesh>
  );
}

/* ── Connecting line between two points ── */
function ConnectionLines() {
  const ref = useRef<THREE.LineSegments>(null);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pts: number[] = [];
    for (let i = 0; i < 18; i++) {
      const r1 = 2.4, r2 = 2.4;
      const a1 = (i / 18) * Math.PI * 2;
      const a2 = ((i + 3) / 18) * Math.PI * 2;
      pts.push(Math.cos(a1) * r1, Math.sin(a1 * 0.7) * r1 * 0.8, Math.sin(a1) * r1);
      pts.push(Math.cos(a2) * r2, Math.sin(a2 * 0.7) * r2 * 0.8, Math.sin(a2) * r2);
    }
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pts), 3));
    return g;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.06;
    ref.current.rotation.z = clock.getElapsedTime() * 0.03;
  });

  return (
    <lineSegments ref={ref} geometry={geo}>
      <lineBasicMaterial color="#0EA5E9" transparent opacity={0.2} />
    </lineSegments>
  );
}

/* ── Main exported component ── */
export default function HeroOrb3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 9], fov: 50 }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 1.5]}
    >
      {/* No solid meshes — only wireframes, lines, and points */}

      {/* Outer large geo sphere */}
      <GeoSphere radius={3.0} detail={1} color="#2563EB" opacity={0.10} speed={0.05} />

      {/* Inner denser geo sphere */}
      <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.6}>
        <GeoSphere radius={2.0} detail={2} color="#0EA5E9" opacity={0.16} speed={0.10} />
      </Float>

      {/* Rotating rings */}
      <Ring radius={3.5} tube={0.013} color="#7C3AED" opacity={0.20} rotX={Math.PI/2.2} rotY={0.3} spinSpeed={0.12} />
      <Ring radius={4.1} tube={0.010} color="#38BDF8" opacity={0.14} rotX={Math.PI/4}   rotY={Math.PI/5} spinSpeed={-0.08} />
      <Ring radius={2.8} tube={0.010} color="#2563EB" opacity={0.12} rotX={Math.PI/6}   rotY={Math.PI/3} spinSpeed={0.18} />

      {/* Particle cloud */}
      <Particles count={150} spread={5.5} />

      {/* Connection lines */}
      <ConnectionLines />

      {/* Orbiting satellites */}
      <Satellite orbitR={3.6} speed={0.45} color="#7C3AED" y={0.8} />
      <Satellite orbitR={4.2} speed={0.28} color="#0EA5E9" y={-1.0} />
      <Satellite orbitR={2.9} speed={0.65} color="#2563EB" y={0.2} />

      {/* Soft lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 6]} intensity={0.4} color="#60A5FA" />
    </Canvas>
  );
}
