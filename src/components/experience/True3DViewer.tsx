import { useEffect, useState } from "react";
import { useGLTF, Center, Html, useAnimations } from "@react-three/drei";
import * as THREE from 'three';

interface Props {
  url: string;
}

function LoadedModel({ url }: Props) {
  const { scene, animations } = useGLTF(url, "https://www.gstatic.com/draco/versioned/decoders/1.5.5/");
  const [modelScale, setModelScale] = useState(1);

  // دعم الأنميشن إذا كان المجسم متحركاً (مثل الثعلب)
  const { actions } = useAnimations(animations, scene);

  useEffect(() => {
    if (scene) {
      // 1. حجم المجسم تلقائياً ليتناسب مع الشاشة بغض النظر عن حجمه الأصلي
      const box = new THREE.Box3().setFromObject(scene);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      if (maxDim > 0) {
        setModelScale(3 / maxDim); // التكبير المستهدف 3 وحدات
      }

      // 2. تحسين المواد والظلال
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material) {
            // تجنب تدمير المواد الجاهزة عالية الجودة
            if (child.material.map) {
               child.material.needsUpdate = true;
            } else {
               child.material.roughness = Math.min(child.material.roughness, 0.7);
            }
          }
        }
      });

      // تشغيل الأنيميشن الأول تلقائياً لو وُجد
      const actionNames = Object.keys(actions);
      if (actionNames.length > 0 && actions[actionNames[0]]) {
        actions[actionNames[0]]?.play();
      }
    }
  }, [scene, actions]);

  return (
    <Center>
      <primitive object={scene} scale={modelScale} rotation={[0, -Math.PI / 8, 0]} />
    </Center>
  );
}

export function True3DViewer({ url }: Props) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
  }, [url]);

  if (error) {
    return (
      <Html center>
        <div style={{
          background: "rgba(255,0,0,0.15)",
          border: "1px solid #ff4444",
          borderRadius: "12px",
          padding: "20px",
          color: "#ff6666",
          textAlign: "center",
          maxWidth: "300px",
          direction: "rtl"
        }}>
          <p style={{ fontSize: "14px", margin: 0 }}>⚠️ فشل تحميل المجسم</p>
          <p style={{ fontSize: "11px", opacity: 0.7, margin: "8px 0 0" }}>{error}</p>
        </div>
      </Html>
    );
  }

  return (
    <ErrorCatcher onError={(err) => setError(err)}>
      <LoadedModel url={url} />
    </ErrorCatcher>
  );
}

// Simple error boundary for Three.js components
import React from "react";

class ErrorCatcher extends React.Component<
  { children: React.ReactNode; onError: (msg: string) => void },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error) {
    this.props.onError(error.message?.substring(0, 120) || "خطأ غير معروف");
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
