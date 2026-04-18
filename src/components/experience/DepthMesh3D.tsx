import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useLocalDepthMap } from '../../hooks/useLocalDepthMap';

const SEGS = 127; // 128×128 vertex grid = 32,258 triangles

interface Props {
  imageDataUri: string;
  displacementScale?: number;
  autoRotate?: boolean;
  pulse?: boolean;
}

/**
 * Renders a high-poly displaced mesh from any image DataURI.
 * Creates genuine 3D geometry based on image luminance depth.
 */
export function DepthMesh3D({
  imageDataUri,
  displacementScale = 0.35,
  autoRotate = true,
  pulse = false,
}: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const { result } = useLocalDepthMap(imageDataUri);

  const geometry = useMemo(() => {
    if (!result) return null;
    const w = 3 * result.aspect;
    const h = 3;
    return new THREE.PlaneGeometry(w, h, Math.round(SEGS * result.aspect), SEGS);
  }, [result]);

  useFrame(({ clock }) => {
    const g = groupRef.current;
    if (!g) return;

    const t = clock.elapsedTime;

    if (autoRotate) {
      g.rotation.y = Math.sin(t * 0.25) * 0.45;
      g.rotation.x = Math.sin(t * 0.18) * 0.12;
    }

    if (pulse) {
      const beat = 1 + Math.sin(t * Math.PI * 1.3) * 0.025;
      g.scale.setScalar(beat);
    }
  });

  if (!result || !geometry) return null;

  return (
    <group ref={groupRef}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial
          map={result.imageTexture}
          displacementMap={result.depthTexture}
          displacementScale={displacementScale}
          displacementBias={-displacementScale * 0.5}
          roughness={0.55}
          metalness={0.12}
          side={THREE.FrontSide}
          envMapIntensity={1.2}
        />
      </mesh>

      {/* Subtle wireframe overlay for depth visualization */}
      <mesh geometry={geometry}>
        <meshBasicMaterial
          color="#a78bfa"
          wireframe
          opacity={0.04}
          transparent
        />
      </mesh>
    </group>
  );
}
