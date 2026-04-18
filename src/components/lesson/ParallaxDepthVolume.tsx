import { useState, useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Center } from "@react-three/drei";
import * as THREE from "three";

const LAYERS = 6;

interface LayerData {
  texture: THREE.CanvasTexture;
  w: number;
  h: number;
}

function buildLayers(img: HTMLImageElement): LayerData[] {
  const maxSize = 512;
  const aspect = img.naturalWidth / img.naturalHeight || 1;

  // رسم الصورة الأصلية على canvas للقراءة
  const srcCanvas = document.createElement("canvas");
  srcCanvas.width = maxSize;
  srcCanvas.height = Math.round(maxSize / aspect);
  const srcCtx = srcCanvas.getContext("2d")!;
  srcCtx.drawImage(img, 0, 0, srcCanvas.width, srcCanvas.height);
  const srcData = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);

  const results: LayerData[] = [];

  for (let li = 0; li < LAYERS; li++) {
    const lo = (li / LAYERS) * 255;
    const hi = ((li + 1) / LAYERS) * 255;

    const layerCanvas = document.createElement("canvas");
    layerCanvas.width = srcCanvas.width;
    layerCanvas.height = srcCanvas.height;
    const lCtx = layerCanvas.getContext("2d")!;
    const layerData = lCtx.createImageData(srcCanvas.width, srcCanvas.height);

    for (let i = 0; i < srcData.data.length; i += 4) {
      const r = srcData.data[i];
      const g = srcData.data[i + 1];
      const b = srcData.data[i + 2];
      const a = srcData.data[i + 3];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      layerData.data[i] = r;
      layerData.data[i + 1] = g;
      layerData.data[i + 2] = b;
      // إذا كانت البكسلة خارج نطاق هذه الطبقة أو شفافة في الأصل → اخفها
      layerData.data[i + 3] = lum >= lo && lum < hi && a > 10 ? 255 : 0;
    }

    lCtx.putImageData(layerData, 0, 0);
    const tex = new THREE.CanvasTexture(layerCanvas);
    tex.colorSpace = THREE.SRGBColorSpace;

    const base = 2.5;
    const w = aspect >= 1 ? base * aspect : base;
    const h = aspect >= 1 ? base : base / aspect;
    results.push({ texture: tex, w, h });
  }

  return results;
}

interface Props {
  url: string;
  modelScale?: number;
}

export function ParallaxDepthVolume({ url, modelScale = 1 }: Props) {
  const [layers, setLayers] = useState<LayerData[] | null>(null);
  const groupRef = useRef<THREE.Group>(null);

  // تحميل الصورة بشكل غير متزامن ثم بناء الطبقات
  useEffect(() => {
    setLayers(null);
    const img = new Image();
    img.onload = () => {
      const built = buildLayers(img);
      setLayers(built);
    };
    img.src = url;
    return () => {
      img.onload = null;
    };
  }, [url]);

  // تنظيف الـ textures عند الإزالة
  useEffect(() => {
    return () => {
      layers?.forEach((l) => l.texture.dispose());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layers]);

  const layerSpacing = 0.28 * modelScale;

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    const beat1 = Math.max(0, Math.sin(t * 6.8)) * 0.014;
    const beat2 = Math.max(0, Math.sin(t * 6.8 + 1.1)) * 0.009;
    const pulse = beat1 + beat2;
    groupRef.current.children.forEach((child, i) => {
      const ratio = i / Math.max(1, LAYERS - 1);
      const baseZ = (i - LAYERS / 2) * layerSpacing;
      child.position.z = baseZ + pulse * ratio * 0.22;
    });
  });

  if (!layers) {
    // شاشة تحميل أثناء معالجة الصورة
    return (
      <mesh>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial color="#3d9cf0" wireframe />
      </mesh>
    );
  }

  const { w, h } = layers[0];

  return (
    <Center>
      <group ref={groupRef}>
        {layers.map((layer, i) => (
          <mesh key={i} position={[0, 0, (i - LAYERS / 2) * layerSpacing]}>
            <planeGeometry args={[w * modelScale, h * modelScale]} />
            <meshStandardMaterial
              map={layer.texture}
              transparent
              alphaTest={0.05}
              side={THREE.DoubleSide}
              roughness={0.25}
              metalness={0.1}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>
    </Center>
  );
}
