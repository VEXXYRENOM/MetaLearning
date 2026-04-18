import { useState, useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Center } from "@react-three/drei";
import * as THREE from "three";

/**
 * يحوّل أي صورة 2D إلى مجسم 3D حقيقي بـ vertex displacement.
 *
 * الإصلاحات:
 * - تلاشي العمق على حواف الصورة (Edge Fade) لمنع الشوكات الحادة
 * - تنعيم العمق باستخدام متوسط الجيران (Smoothing)
 * - عرض الصورة على كلا الوجهين (DoubleSide) لمنع الاختفاء عند الميل
 * - تلاشي شفافية الحواف في الـ Fragment Shader أيضاً
 */

const VERT = /* glsl */`
  uniform sampler2D uTex;
  uniform float uTime;
  uniform float uDepth;
  varying vec2 vUv;
  varying float vEdgeFade;

  void main() {
    vUv = uv;

    // سحب إضاءة البكسل من الصورة كخريطة عمق
    vec4 c = texture2D(uTex, uv);
    float lum = dot(c.rgb, vec3(0.299, 0.587, 0.114));

    // الموضوع الداكن = بارز / الفاتح = مسطح
    float rawDepth = (1.0 - lum) * uDepth;

    // ── الإصلاح 1: تلاشي العمق على حواف UV ──
    // كلما اقتربنا من حافة الصورة، قللنا العمق تدريجياً
    float edgeX = smoothstep(0.0, 0.12, uv.x) * smoothstep(1.0, 0.88, uv.x);
    float edgeY = smoothstep(0.0, 0.12, uv.y) * smoothstep(1.0, 0.88, uv.y);
    float edgeFade = edgeX * edgeY;
    vEdgeFade = edgeFade;

    float depth = rawDepth * edgeFade;

    // ── الإصلاح 2: تنعيم العمق (قراءة من جيران البكسل) ──
    float texelSize = 1.0 / 128.0;
    float lumL = dot(texture2D(uTex, uv + vec2(-texelSize, 0.0)).rgb, vec3(0.299, 0.587, 0.114));
    float lumR = dot(texture2D(uTex, uv + vec2( texelSize, 0.0)).rgb, vec3(0.299, 0.587, 0.114));
    float lumU = dot(texture2D(uTex, uv + vec2(0.0,  texelSize)).rgb, vec3(0.299, 0.587, 0.114));
    float lumD = dot(texture2D(uTex, uv + vec2(0.0, -texelSize)).rgb, vec3(0.299, 0.587, 0.114));
    float smoothLum = (lum + lumL + lumR + lumU + lumD) * 0.2;
    float smoothDepth = (1.0 - smoothLum) * uDepth * edgeFade;

    // مزج بين العمق الخام والمنعم
    depth = mix(smoothDepth, depth, 0.3);

    // نبضة Lub-Dub واقعية
    float beat1 = max(0.0, sin(uTime * 7.0));
    float beat2 = max(0.0, sin(uTime * 7.0 + 1.1)) * 0.6;
    float pulse = (beat1 + beat2) * 0.5;

    vec3 pos = position;
    pos.z += depth + pulse * depth * 0.3;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const FRAG = /* glsl */`
  uniform sampler2D uTex;
  uniform float uTime;
  varying vec2 vUv;
  varying float vEdgeFade;

  void main() {
    vec4 color = texture2D(uTex, vUv);

    // إزالة الخلفية البيضاء
    float lum = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    float bgMask = lum > 0.94 ? 0.0 : 1.0;

    // ── الإصلاح 3: تلاشي الشفافية على حواف الصورة ──
    float alpha = color.a * bgMask * vEdgeFade;

    gl_FragColor = vec4(color.rgb, alpha);
  }
`;

interface Props {
  url: string;
  modelScale?: number;
  depthScale?: number;
}

export function ImageTo3dVolume({ url, modelScale = 1, depthScale = 0.45 }: Props) {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const [dims, setDims] = useState({ w: 2.5, h: 2.5 });
  const matRef = useRef<THREE.ShaderMaterial | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(url, (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      setTex(t);
      const img = t.image as HTMLImageElement;
      const aspect = img.naturalWidth / img.naturalHeight || 1;
      const base = 2.5 * modelScale;
      setDims(
        aspect >= 1
          ? { w: base * aspect, h: base }
          : { w: base, h: base / aspect }
      );
    });
    return () => { setTex(null); };
  }, [url, modelScale]);

  const material = useMemo(() => {
    if (!tex) return null;
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        uTex: { value: tex },
        uTime: { value: 0 },
        uDepth: { value: depthScale },
      },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    matRef.current = mat;
    return mat;
  }, [tex, depthScale]);

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.elapsedTime;
    }
  });

  if (!tex || !material) {
    return (
      <mesh>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#3d9cf0" wireframe />
      </mesh>
    );
  }

  return (
    <Center>
      <mesh material={material} castShadow>
        <planeGeometry args={[dims.w, dims.h, 128, 128]} />
      </mesh>
    </Center>
  );
}
