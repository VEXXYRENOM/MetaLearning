import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * إطار لوحة كلاسيكي مع رسم زيتي بأسلوب 3D
 * يعرض إطاراً مذهباً مفصلاً مع تدرج لوني للرسمة وإضاءة موجهة (Spotlight)
 * للتعبير عن الفنون التشكيلية واستكشاف اللوحات بعمق
 */
export function PaintingFrame3D() {
  const groupRef = useRef<THREE.Group>(null);
  const canvasRef = useRef<THREE.Mesh>(null);
  const spotLightRef = useRef<THREE.SpotLight>(null);

  // توليد خريطة تدرج لوني (Gradient) كنسيج للرسمة
  const paintingTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // إعداد تدرج لغروب الشمس كمثال للوحة
      const gradient = ctx.createLinearGradient(0, 0, 0, 512);
      gradient.addColorStop(0, "#0f172a");  // سماء ليلية داكنة
      gradient.addColorStop(0.3, "#4c1d95"); // بنفسجي غامق
      gradient.addColorStop(0.6, "#be123c"); // أحمر وردي
      gradient.addColorStop(0.8, "#f59e0b"); // برتقالي ذهبي
      gradient.addColorStop(1, "#1e293b");   // أرض سوداء

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 512);

      // رسم جبال مبسطة
      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.moveTo(0, 512);
      ctx.lineTo(150, 300);
      ctx.lineTo(250, 400);
      ctx.lineTo(400, 250);
      ctx.lineTo(512, 450);
      ctx.lineTo(512, 512);
      ctx.fill();

      // رسم شمس غاربة
      ctx.fillStyle = "#fde047";
      ctx.beginPath();
      ctx.arc(280, 280, 40, 0, Math.PI * 2);
      ctx.fill();
      
      // توهج حول الشمس
      const sunGlow = ctx.createRadialGradient(280, 280, 40, 280, 280, 100);
      sunGlow.addColorStop(0, "rgba(253, 224, 71, 0.4)");
      sunGlow.addColorStop(1, "rgba(253, 224, 71, 0)");
      ctx.fillStyle = sunGlow;
      ctx.arc(280, 280, 100, 0, Math.PI * 2);
      ctx.fill();
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      // دوران بطيء جداً وثابت مثل معرض الفن
      groupRef.current.rotation.y = Math.sin(t * 0.2) * 0.15;
    }
    // حركة طفيفة للضوء الموجه للفت الانتباه للوحة
    if (spotLightRef.current) {
      spotLightRef.current.position.x = Math.sin(t * 0.5) * 1.5;
    }
    // تأثير "تنفس" لعمق الرسمة (كأن اللوحة حية)
    if (canvasRef.current) {
      canvasRef.current.position.z = Math.sin(t * 1.5) * 0.01;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]} scale={0.9}>
      
      {/* === إضاءة معرض فني (Gallery Spotlight) === */}
      <spotLight
        ref={spotLightRef}
        position={[0, 3, 2]}
        angle={Math.PI / 4}
        penumbra={0.5}
        intensity={2}
        color="#fff1e6"
        castShadow
      />

      {/* === جدار خلفية للمعرض الفني === */}
      <mesh position={[0, 0, -0.3]}>
        <planeGeometry args={[4, 3]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>

      {/* لوحة تعريفية أسفل الرسمة */}
      <group position={[0, -0.9, -0.28]}>
        <mesh>
          <boxGeometry args={[0.5, 0.15, 0.02]} />
          <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* نص وهمي على اللوحة التعريفية */}
        <mesh position={[0, 0, 0.015]}>
          <planeGeometry args={[0.4, 0.1]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
      </group>

      {/* === اللوحة القماشية (Canvas) === */}
      <mesh ref={canvasRef} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[1.6, 1.2]} />
        <meshStandardMaterial
          map={paintingTexture}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* عمق قماش اللوحة (الحواف الجانبية) */}
      <group position={[0, 0, -0.05]}>
        {/* أعلى وأسفل */}
        <mesh position={[0, 0.61, 0]}>
          <boxGeometry args={[1.6, 0.02, 0.1]} />
          <meshStandardMaterial color="#e5e7eb" roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.61, 0]}>
          <boxGeometry args={[1.6, 0.02, 0.1]} />
          <meshStandardMaterial color="#e5e7eb" roughness={0.9} />
        </mesh>
        {/* يمين ويسار */}
        <mesh position={[0.81, 0, 0]}>
          <boxGeometry args={[0.02, 1.24, 0.1]} />
          <meshStandardMaterial color="#e5e7eb" roughness={0.9} />
        </mesh>
        <mesh position={[-0.81, 0, 0]}>
          <boxGeometry args={[0.02, 1.24, 0.1]} />
          <meshStandardMaterial color="#e5e7eb" roughness={0.9} />
        </mesh>
      </group>

      {/* === إطار مذهب كلاسيكي (Ornate Frame) === */}
      <group position={[0, 0, 0]}>
        {/* الإطار الخارجي */}
        <mesh>
          {/* نستخدم إطار مفرغ حول اللوحة */}
          <shapeGeometry
            args={[
              useMemo(() => {
                const shape = new THREE.Shape();
                // المربع الخارجي للإطار
                shape.moveTo(-1, -0.8);
                shape.lineTo(1, -0.8);
                shape.lineTo(1, 0.8);
                shape.lineTo(-1, 0.8);
                shape.lineTo(-1, -0.8);

                // الثقب الداخلي (حجم اللوحة)
                const hole = new THREE.Path();
                hole.moveTo(-0.8, -0.6);
                hole.lineTo(0.8, -0.6);
                hole.lineTo(0.8, 0.6);
                hole.lineTo(-0.8, 0.6);
                hole.lineTo(-0.8, -0.6);
                shape.holes.push(hole);

                return shape;
              }, [])
            ]}
          />
          {/* استخدام مادة معدنية ذهبية معتقة */}
          <meshStandardMaterial
            color="#d4af37"
            emissive="#5c4a1e"
            emissiveIntensity={0.2}
            roughness={0.4}
            metalness={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* حواف الإطار لإعطاء عمق وسماكة */}
        {/* حافة خارجية علوية */}
        <mesh position={[0, 0.82, 0.05]}>
          <boxGeometry args={[2.04, 0.04, 0.1]} />
          <meshStandardMaterial color="#b8860b" roughness={0.5} metalness={0.8} />
        </mesh>
        {/* حافة خارجية سفلية */}
        <mesh position={[0, -0.82, 0.05]}>
          <boxGeometry args={[2.04, 0.04, 0.1]} />
          <meshStandardMaterial color="#b8860b" roughness={0.5} metalness={0.8} />
        </mesh>
        {/* حافة خارجية يمنى */}
        <mesh position={[1.02, 0, 0.05]}>
          <boxGeometry args={[0.04, 1.6, 0.1]} />
          <meshStandardMaterial color="#b8860b" roughness={0.5} metalness={0.8} />
        </mesh>
        {/* حافة خارجية يسرى */}
        <mesh position={[-1.02, 0, 0.05]}>
          <boxGeometry args={[0.04, 1.6, 0.1]} />
          <meshStandardMaterial color="#b8860b" roughness={0.5} metalness={0.8} />
        </mesh>

        {/* زخارف جانبية صغيرة (كورنيش الإطار) */}
        {[-0.95, 0.95].map((x) =>
          [-0.75, 0.75].map((y) => (
            <mesh key={`ornament-${x}-${y}`} position={[x, y, 0.02]}>
              <sphereGeometry args={[0.05, 16, 16]} />
              <meshStandardMaterial color="#ffd700" roughness={0.3} metalness={1} />
            </mesh>
          ))
        )}
      </group>

      {/* حبل تعليق اللوحة */}
      <group position={[0, 0.8, -0.1]}>
        <mesh position={[-0.5, 0.2, 0]} rotation={[0, 0, -Math.PI / 6]}>
          <cylinderGeometry args={[0.005, 0.005, 0.6, 8]} />
          <meshStandardMaterial color="#ffffff" roughness={0.9} />
        </mesh>
        <mesh position={[0.5, 0.2, 0]} rotation={[0, 0, Math.PI / 6]}>
          <cylinderGeometry args={[0.005, 0.005, 0.6, 8]} />
          <meshStandardMaterial color="#ffffff" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.45, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.02, 16]} />
          <meshStandardMaterial color="#71717a" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* إضاءة محيطية خفيفة */}
      <ambientLight intensity={0.3} color="#e0e7ff" />
    </group>
  );
}
