import { Html } from "@react-three/drei";

/** يظهر قبل رفع صورة: لا نموذج قلب ثابت — فقط دعوة لرفع الصورة. */
export function EmptyHeartPlaceholder() {
  return (
    <group>
      <gridHelper args={[10, 20, "#3a4f62", "#1a222c"]} />
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[3.2, 48]} />
        <meshStandardMaterial
          color="#0e141c"
          roughness={0.95}
          metalness={0.05}
        />
      </mesh>
      <Html center position={[0, 0.35, 0]}>
        <div className="empty-3d-hint">
          <strong>ارفع صورة الدرس</strong>
          <p>
            الصورة التي تختارها ستُعرض هنا ككتلة ثلاثية الأبعاد وتدور مع
            التحكم من الجانب (تكبير، تدوير تلقائي).
          </p>
        </div>
      </Html>
    </group>
  );
}
