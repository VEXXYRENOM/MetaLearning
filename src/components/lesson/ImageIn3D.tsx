import { useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Edges, Float, useTexture } from "@react-three/drei";
import { DoubleSide, SRGBColorSpace } from "three";
import { useRef } from "react";
import type { Mesh } from "three";

type Props = {
  url: string;
  modelScale: number;
};

/**
 * صورة الأستاذ ككتلة في الفضاء ثلاثي الأبعاد: لوحة رفيعة بوجهين،
 * تُدار مع المجموعة الخارجية + حركة Float (زمن / «بُعد رابع» بسيط).
 */
export function ImageIn3D({ url, modelScale }: Props) {
  const texture = useTexture(url);

  useEffect(() => {
    texture.colorSpace = SRGBColorSpace;
    texture.needsUpdate = true;
  }, [texture]);

  const { w, h } = useMemo(() => {
    const img = texture.image as HTMLImageElement | undefined;
    const iw = img?.naturalWidth || img?.width || 512;
    const ih = img?.naturalHeight || img?.height || 512;
    const aspect = iw / ih;
    const base = 2.35;
    return aspect >= 1
      ? { w: base * aspect, h: base }
      : { w: base, h: base / aspect };
  }, [texture]);

  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    meshRef.current.position.y = Math.sin(t * 0.85) * 0.035;
  });

  const sx = w * modelScale;
  const sy = h * modelScale;

  return (
    <Float
      speed={1.5}
      rotationIntensity={0.15}
      floatIntensity={0.32}
      floatingRange={[-0.055, 0.055]}
    >
      <mesh ref={meshRef} castShadow receiveShadow>
        <planeGeometry args={[sx, sy]} />
        <meshStandardMaterial
          map={texture}
          side={DoubleSide}
          roughness={0.42}
          metalness={0.08}
          transparent={false}
        />
        <Edges
          threshold={15}
          color="#4a9fe8"
          scale={1}
          lineWidth={1.5}
        />
      </mesh>
    </Float>
  );
}
