import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { GemModel } from "./GemModel";
import { GemParticles } from "./GemParticles";

export function GemScene({ speed, colorIndex, scale = 0.8, height = 240 }) {
  return (
    <Canvas
      camera={{ fov: 40, position: [0, 0, 5] }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true }}
      style={{ height, width: "100%" }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.6} />
        <pointLight intensity={2} position={[5, 5, 5]} />
        <pointLight intensity={1} position={[-3, -3, 2]} />
        <GemModel speed={speed} colorIndex={colorIndex} scale={scale} />
        <GemParticles radius={3.2} />
        <Environment preset="studio" />
      </Suspense>
    </Canvas>
  );
}
