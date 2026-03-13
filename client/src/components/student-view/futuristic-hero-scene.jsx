/* eslint-disable react/no-unknown-property */
import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Float, Text, MeshDistortMaterial, MeshWobbleMaterial } from "@react-three/drei";
import * as THREE from "three";

/* ─── Pulsing Central Hub ───────────────────────────────────────────────── */
function CareerCore() {
  const mesh = useRef();
  const ring = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (mesh.current) {
      mesh.current.rotation.y = t * 0.4;
      mesh.current.rotation.z = t * 0.2;
    }
    if (ring.current) {
      ring.current.rotation.x = t * 0.5;
      ring.current.rotation.y = t * 0.3;
    }
  });

  return (
    <group>
      {/* Central Knowledge Diamond */}
      <group>
        <mesh ref={mesh}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial 
            color="#3b82f6" 
            emissive="#1d4ed8" 
            emissiveIntensity={2} 
            metalness={0.9} 
            roughness={0.1} 
            wireframe={true}
          />
        </mesh>
        
        {/* Inner Glow Core */}
        <mesh>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshStandardMaterial 
            color="#60a5fa" 
            emissive="#3b82f6" 
            emissiveIntensity={4}
          />
        </mesh>
      </group>

      {/* Orbiting Tech-Ring */}
      <mesh ref={ring}>
        <torusGeometry args={[1.8, 0.02, 16, 100]} />
        <meshStandardMaterial 
          color="#a855f7" 
          emissive="#a855f7" 
          emissiveIntensity={1.5} 
          transparent 
          opacity={0.5} 
        />
      </mesh>
    </group>
  );
}

/* ─── Floating Skill Blocks (Representation of Modules) ──────────────────── */
function SkillBlock({ position, color, delay = 0 }) {
  const ref = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() + delay;
    // Removed floating Y movement to avoid "bouncing" feel
    ref.current.rotation.x = Math.sin(t * 0.5) * 0.2;
    ref.current.rotation.y = Math.cos(t * 0.3) * 0.2;
  });

  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={[0.4, 0.4, 0.4]} />
      <meshStandardMaterial 
        color={color} 
        emissive={color} 
        emissiveIntensity={0.8} 
        metalness={0.8} 
        roughness={0.2}
        transparent
        opacity={0.9}
      />
      {/* Ghostly Outer Layer */}
      <mesh scale={[1.2, 1.2, 1.2]}>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial 
          color={color} 
          wireframe 
          transparent 
          opacity={0.15} 
        />
      </mesh>
    </mesh>
  );
}

/* ─── Data Stream Lines (Connecting the Hub to Skills) ───────────────────── */
function DataStream({ start = [0, 0, 0], end, color }) {
  const ref = useRef();
  
  const curve = useMemo(() => {
    const v1 = new THREE.Vector3(...start);
    const v2 = new THREE.Vector3(...end);
    const mid = v1.clone().lerp(v2, 0.5).add(new THREE.Vector3(0, 0.5, 0));
    return new THREE.QuadraticBezierCurve3(v1, mid, v2);
  }, [start, end]);

  const points = useMemo(() => curve.getPoints(50), [curve]);
  
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.dashOffset = -clock.getElapsedTime() * 0.5;
    }
  });

  return (
    <line>
      <bufferGeometry setFromPoints={points} />
      <lineBasicMaterial color={color} transparent opacity={0.2} linewidth={1} />
    </line>
  );
}

/* ─── Moving Pulses on the Data Streams ─────────────────────────────────── */
function ConnectionPulse({ start, end, color, delay }) {
  const mesh = useRef();
  const curve = useMemo(() => {
    const v1 = new THREE.Vector3(...start);
    const v2 = new THREE.Vector3(...end);
    const mid = v1.clone().lerp(v2, 0.5).add(new THREE.Vector3(0, 0.5, 0));
    return new THREE.QuadraticBezierCurve3(v1, mid, v2);
  }, [start, end]);

  useFrame(({ clock }) => {
    const t = ((clock.getElapsedTime() + delay) % 4) / 4;
    const pos = curve.getPointAt(t);
    mesh.current.position.copy(pos);
  });

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[0.03, 8, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={5} />
    </mesh>
  );
}

/* ─── Background Grid Floor ────────────────────────────────────────────── */
function TechGrid() {
  return (
    <gridHelper 
      args={[40, 40, "#1e293b", "#0f172a"]} 
      position={[0, -3, 0]} 
      rotation={[0, 0, 0]} 
    />
  );
}

/* ─── Main Component ────────────────────────────────────────────────────── */
export default function FuturisticHeroScene() {
  const skillPositions = [
    { pos: [2.5, 1, -1.5],  color: "#3b82f6", delay: 0 },
    { pos: [-2.2, 0.5, 1.2], color: "#a855f7", delay: 1 },
    { pos: [1.8, -1.2, 2],  color: "#06b6d4", delay: 2 },
    { pos: [-3, -1, -2],    color: "#10b981", delay: 3 },
    { pos: [0, 2.5, -3],    color: "#f59e0b", delay: 1.5 },
    { pos: [-1.5, 2, 2.5],  color: "#ef4444", delay: 0.5 },
  ];

  return (
    <Canvas
      camera={{ position: [0, 1, 6], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        {/* Lights */}
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#3b82f6" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
        <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={2} color="#60a5fa" />

        {/* Core Career Hub */}
        <CareerCore />

        {/* Floating Modules */}
        {skillPositions.map((skill, i) => (
          <group key={i}>
            <SkillBlock position={skill.pos} color={skill.color} delay={skill.delay} />
            <DataStream end={skill.pos} color={skill.color} />
            <ConnectionPulse start={[0,0,0]} end={skill.pos} color={skill.color} delay={skill.delay} />
          </group>
        ))}

        {/* Environment */}
        <Stars radius={50} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
        <TechGrid />
        
        {/* Particle Field */}
        <Points count={200} />
      </Suspense>
    </Canvas>
  );
}

/* ─── Helper: Particle Points ───────────────────────────────────────────── */
function Points({ count }) {
  const ref = useRef();
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        p[i * 3] = (Math.random() - 0.5) * 15;
        p[i * 3 + 1] = (Math.random() - 0.5) * 15;
        p[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    return p;
  }, [count]);

  useFrame((state) => {
    ref.current.rotation.y = state.clock.getElapsedTime() * 0.05;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length / 3}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#3b82f6" transparent opacity={0.4} />
    </points>
  );
}
