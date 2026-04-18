import { Environment } from "@react-three/drei";

export function SceneBackdrop() {
  return (
    <>
      <color attach="background" args={["#0c1118"]} />
      <ambientLight intensity={0.42} />
      <directionalLight position={[6, 10, 5]} intensity={1.05} />
      <directionalLight position={[-5, 3, -6]} intensity={0.38} />
      <Environment preset="city" />
    </>
  );
}
