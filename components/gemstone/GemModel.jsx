import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";

const GEM_COLORS = ["#D4AF37", "#9B59B6", "#1ABC9C", "#F5F5DC"];

function createBrilliantCut(radius, segments = 6) {
  const geo = new THREE.BufferGeometry();
  const verts = [];
  const idx = [];

  const crownHeight = radius * 0.35;
  const pavilionHeight = radius * 0.6;
  const tableRadius = radius * 0.55;

  const crownBaseY = radius * 0.15;
  const girdleY = 0;
  const pavilionTipY = -radius * 0.75;

  const angleStep = (Math.PI * 2) / segments;
  const halfAngle = angleStep / 2;

  // Center crown top (table center)
  const tableCenter = [0, crownHeight * 0.85, 0];
  const tip = [0, pavilionTipY, 0];

  for (let i = 0; i < segments; i++) {
    const a1 = i * angleStep;
    const a2 = a1 + angleStep;
    const aMid = a1 + halfAngle;

    const c1 = [Math.cos(a1) * radius, girdleY, Math.sin(a1) * radius];
    const c2 = [Math.cos(a2) * radius, girdleY, Math.sin(a2) * radius];
    const cMid = [Math.cos(aMid) * radius * 0.85, crownBaseY, Math.sin(aMid) * radius * 0.85];

    const t1 = [Math.cos(a1) * tableRadius, crownHeight * 0.85, Math.sin(a1) * tableRadius];
    const t2 = [Math.cos(a2) * tableRadius, crownHeight * 0.85, Math.sin(a2) * tableRadius];

    const p1 = [Math.cos(a1) * radius * 0.25, pavilionTipY * 0.6, Math.sin(a1) * radius * 0.25];
    const p2 = [Math.cos(a2) * radius * 0.25, pavilionTipY * 0.6, Math.sin(a2) * radius * 0.25];

    const base = verts.length;

    // Crown: table to crown midpoint
    verts.push(...tableCenter, ...t1, ...cMid);
    idx.push(base, base + 1, base + 2);
    verts.push(...tableCenter, ...cMid, ...t2);
    idx.push(base + 3, base + 4, base + 5);

    // Crown: crown midpoint to girdle
    verts.push(...cMid, ...c1, ...c2);
    idx.push(base + 6, base + 7, base + 8);
    verts.push(...cMid, ...c2, ...c1);
    idx.push(base + 9, base + 10, base + 11);

    // Pavilion: girdle to pavilion point
    verts.push(...c1, ...p1, ...tip);
    idx.push(base + 12, base + 13, base + 14);
    verts.push(...p1, ...c2, ...tip);
    idx.push(base + 15, base + 16, base + 17);
    verts.push(...c1, ...c2, ...p1);
    idx.push(base + 18, base + 19, base + 20);
    verts.push(...p1, ...p2, ...tip);
    idx.push(base + 21, base + 22, base + 23);
    verts.push(...p2, ...c2, ...tip);
    idx.push(base + 24, base + 25, base + 26);
    verts.push(...c2, ...p2, ...p1);
    idx.push(base + 27, base + 28, base + 29);
  }

  geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

export function GemModel({ speed = 1, colorIndex = 0, scale = 1 }) {
  const meshRef = useRef();
  const color = GEM_COLORS[colorIndex % GEM_COLORS.length];

  const geometry = useMemo(() => createBrilliantCut(1.4 * scale, 8), [scale]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15 * speed) * 0.15;
      meshRef.current.rotation.y += 0.005 * speed;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <MeshTransmissionMaterial
        backside
        backsideThickness={0.3}
        chromaticAberration={0.6}
        color={color}
        distortion={0.2}
        distortionScale={0.15}
        envMapIntensity={3}
        ior={2.4}
        roughness={0.02}
        thickness={1.2}
        temporalDistortion={0.1}
        transparent
      />
    </mesh>
  );
}
