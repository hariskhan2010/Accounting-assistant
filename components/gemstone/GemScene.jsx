import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { GemModel } from "./GemModel";
import { GemParticles } from "./GemParticles";

export function GemScene({ speed = 1, colorIndex = 0, scale = 0.8, height = 240 }) {
  return (
    <Canvas
      camera={{ fov: 32, position: [0, 0.3, 5.5] }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true, toneMapping: 3 }}
      style={{ height, width: "100%" }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.3} />
        <pointLight intensity={3} position={[4, 6, 4]} color="#F0D060" />
        <pointLight intensity={1.5} position={[-3, -2, 3]} color="#9B59B6" />
        <pointLight intensity={0.8} position={[0, -4, 2]} color="#D4AF37" />
        <GemModel speed={speed} colorIndex={colorIndex} scale={scale} />
        <GemParticles radius={3.5} count={60} />
        <Environment preset="night" />
      </Suspense>
    </Canvas>
  );
}
