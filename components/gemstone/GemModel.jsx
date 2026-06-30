import { useRef, useMemo } from "react";
import { MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";

const GEM_COLORS = ["#D4AF37", "#9B59B6", "#1ABC9C", "#F5F5DC"];

export function GemModel({ colorIndex = 0, scale = 1 }) {
  const meshRef = useRef();
  const color = GEM_COLORS[colorIndex % GEM_COLORS.length];

  const geometry = useMemo(() => {
    const geo = new THREE.OctahedronGeometry(1.4 * scale, 0);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const noise = 1 + 0.08 * (Math.sin(x * 3) * Math.cos(y * 2) * Math.sin(z * 4));
      pos.setXYZ(i, x * noise, y * noise, z * noise);
    }
    geo.computeVertexNormals();
    return geo;
  }, [scale]);

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <MeshTransmissionMaterial
        backside
        backsideThickness={0.5}
        chromaticAberration={0.8}
        color={color}
        distortion={0.4}
        distortionScale={0.2}
        envMapIntensity={2}
        ior={2.5}
        roughness={0.05}
        thickness={1.8}
        temporalDistortion={0.2}
        transparent
      />
    </mesh>
  );
}
