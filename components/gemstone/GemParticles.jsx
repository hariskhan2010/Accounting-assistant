import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const GOLD = new THREE.Color("#D4AF37");
const WHITE = new THREE.Color("#F5F5DC");

export function GemParticles({ radius = 3.5, count = 60 }) {
  const ref = useRef();

  const [positions, colors, sizes, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const siz = new Float32Array(count);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius * 3 + Math.random() * 6;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      const c = WHITE.clone().lerp(GOLD, Math.random() * 0.6);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;

      siz[i] = 0.02 + Math.random() * 0.06;
      spd[i] = 0.2 + Math.random() * 0.3;
    }
    return [pos, col, siz, spd];
  }, [radius, count]);

  const spiralOffset = useRef(Math.random() * 100);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * 0.15;
    const posArr = ref.current.geometry.attributes.position.array;
    const initial = ref.current.userData.initialPositions;
    if (!initial) return;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const phase = t + i * 0.3 + spiralOffset.current;
      posArr[i3] = initial[i3] + Math.sin(phase * 0.5) * 0.3;
      posArr[i3 + 1] = initial[i3 + 1] + Math.cos(phase * 0.4) * 0.3;
      posArr[i3 + 2] = initial[i3 + 2] + Math.sin(phase * 0.3 + 1) * 0.3;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  const initialPos = useMemo(() => {
    const arr = {};
    positions.forEach((v, i) => { arr[i] = v; });
    return arr;
  }, [positions]);

  return (
    <points ref={ref} userData={{ initialPositions: initialPos }}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} count={count} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} count={count} />
      </bufferGeometry>
      <pointsMaterial
        blending={THREE.AdditiveBlending}
        color={0xffffff}
        depthWrite={false}
        opacity={0.5}
        size={0.04}
        sizeAttenuation
        transparent
        vertexColors
      />
    </points>
  );
}
