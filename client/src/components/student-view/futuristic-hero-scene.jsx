import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Float, Environment } from "@react-three/drei";
import * as THREE from "three";

/* ─── Glowing Earth-like Sphere ─────────────────────────────────────────── */
function GlobeCore() {
  const mesh  = useRef();
  const glow  = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (mesh.current)  mesh.current.rotation.y  = t * 0.12;
    if (glow.current) {
      const s = 1 + Math.sin(t * 1.1) * 0.025;
      glow.current.scale.setScalar(s);
    }
  });

  // Build lat/lon grid lines on a sphere
  const gridLines = useMemo(() => {
    const lines = [];
    const r = 1.5;
    const segs = 64;

    // Latitude rings (horizontal)
    const latitudes = [-60, -30, 0, 30, 60];
    latitudes.forEach((lat) => {
      const phi = THREE.MathUtils.degToRad(90 - lat);
      const ringR = r * Math.sin(phi);
      const yPos  = r * Math.cos(phi);
      const pts   = [];
      for (let i = 0; i <= segs; i++) {
        const theta = (i / segs) * Math.PI * 2;
        pts.push(new THREE.Vector3(ringR * Math.cos(theta), yPos, ringR * Math.sin(theta)));
      }
      lines.push({ pts, color: "#1e40af", opacity: lat === 0 ? 0.35 : 0.15 });
    });

    // Longitude lines (vertical)
    const longitudes = Array.from({ length: 12 }, (_, i) => i * 30);
    longitudes.forEach((lon) => {
      const pts = [];
      for (let i = 0; i <= segs; i++) {
        const phi   = (i / segs) * Math.PI;
        const theta = THREE.MathUtils.degToRad(lon);
        pts.push(new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.cos(phi),
          r * Math.sin(phi) * Math.sin(theta)
        ));
      }
      lines.push({ pts, color: "#1e40af", opacity: 0.12 });
    });

    return lines.map(({ pts, color, opacity }) => {
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      return { geo, color, opacity };
    });
  }, []);

  return (
    <Float speed={0.8} floatIntensity={0.3} rotationIntensity={0.05}>
      {/* Outer atmospheric glow */}
      <mesh ref={glow}>
        <sphereGeometry args={[1.68, 32, 32]} />
        <meshStandardMaterial
          color="#3b82f6"
          emissive="#1d4ed8"
          emissiveIntensity={0.25}
          transparent
          opacity={0.06}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Second glow layer */}
      <mesh>
        <sphereGeometry args={[1.6, 32, 32]} />
        <meshStandardMaterial
          color="#60a5fa"
          emissive="#3b82f6"
          emissiveIntensity={0.15}
          transparent
          opacity={0.04}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Core sphere */}
      <mesh ref={mesh}>
        <sphereGeometry args={[1.5, 64, 64]} />
        <meshStandardMaterial
          color="#0c1d3d"
          emissive="#0c1445"
          emissiveIntensity={0.5}
          metalness={0.6}
          roughness={0.4}
        />

        {/* Grid lines as children so they rotate with the globe */}
        {gridLines.map(({ geo, color, opacity }, i) => (
          <line key={i} geometry={geo}>
            <lineBasicMaterial color={color} transparent opacity={opacity} linewidth={1} />
          </line>
        ))}
      </mesh>
    </Float>
  );
}

/* ─── City Dot on globe surface ─────────────────────────────────────────── */
function GlobeDot({ lat, lon, color = "#60a5fa", size = 0.04, pulseDelay = 0 }) {
  const ref = useRef();
  const r   = 1.52;
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const th  = THREE.MathUtils.degToRad(lon);
  const pos = useMemo(() => new THREE.Vector3(
    r * Math.sin(phi) * Math.cos(th),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(th)
  ), [phi, th, r]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const s = 1 + Math.sin(clock.getElapsedTime() * 1.8 + pulseDelay) * 0.4;
    ref.current.scale.setScalar(s);
  });

  return (
    <mesh ref={ref} position={pos}>
      <sphereGeometry args={[size, 8, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} roughness={0} />
    </mesh>
  );
}

/* ─── Arc between two globe positions ───────────────────────────────────── */
function GlobeArc({ lat1, lon1, lat2, lon2, color = "#3b82f6", opacity = 0.35, animDelay = 0 }) {
  const ref = useRef();
  const r   = 1.52;

  const geo = useMemo(() => {
    const toVec = (la, lo) => {
      const phi = THREE.MathUtils.degToRad(90 - la);
      const th  = THREE.MathUtils.degToRad(lo);
      return new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(th),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(th)
      );
    };
    const a   = toVec(lat1, lon1);
    const b   = toVec(lat2, lon2);
    const mid = a.clone().add(b).normalize().multiplyScalar(r * 1.38); // arc peak

    const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
    const pts   = curve.getPoints(40);
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [lat1, lon1, lat2, lon2, r]);

  useFrame(({ clock }) => {
    if (ref.current?.material) {
      ref.current.material.opacity = opacity * (0.5 + Math.sin(clock.getElapsedTime() * 1.2 + animDelay) * 0.5);
    }
  });

  return (
    <line ref={ref} geometry={geo}>
      <lineBasicMaterial color={color} transparent opacity={opacity} linewidth={1} />
    </line>
  );
}

/* ─── Orbiting Ring ──────────────────────────────────────────────────────── */
function OrbRing({ radius, color, speed, tilt = 0, thickness = 0.006 }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = clock.getElapsedTime() * speed;
  });
  return (
    <mesh ref={ref} rotation={[tilt, 0, 0]}>
      <torusGeometry args={[radius, thickness, 14, 180]} />
      <meshBasicMaterial color={color} transparent opacity={0.4} />
    </mesh>
  );
}

/* ─── Orbiting satellite dot ─────────────────────────────────────────────── */
function Satellite({ radius, color, speed, offset = 0, tilt = 0 }) {
  const pivot = useRef();
  useFrame(({ clock }) => {
    if (pivot.current) pivot.current.rotation.y = clock.getElapsedTime() * speed + offset;
  });
  return (
    <group ref={pivot} rotation={[tilt, 0, 0]}>
      <mesh position={[radius, 0, 0]}>
        <sphereGeometry args={[0.065, 10, 10]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} roughness={0} />
      </mesh>
    </group>
  );
}

/* ─── Particle field ─────────────────────────────────────────────────────── */
function Particles({ count = 260 }) {
  const ref = useRef();
  const pos = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r     = 2.8 + Math.random() * 5;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      arr[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count]);

  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.009;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={pos} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.022} color="#60a5fa" transparent opacity={0.55} sizeAttenuation />
    </points>
  );
}

/* ─── Main exported scene ─────────────────────────────────────────────────── */
export default function FuturisticHeroScene() {
  // City/campus dots around the globe
  const dots = [
    { lat: 51.5, lon: -0.1,   color: "#60a5fa", size: 0.055, delay: 0    }, // London
    { lat: 40.7, lon: -74.0,  color: "#a78bfa", size: 0.05,  delay: 1    }, // NYC
    { lat: 35.7, lon: 139.7,  color: "#34d399", size: 0.05,  delay: 2    }, // Tokyo
    { lat: 12.9, lon: 77.6,   color: "#fbbf24", size: 0.065, delay: 0.5  }, // Bangalore
    { lat: 28.6, lon: 77.2,   color: "#f472b6", size: 0.05,  delay: 1.5  }, // Delhi
    { lat: -33.9,lon: 151.2,  color: "#22d3ee", size: 0.045, delay: 2.5  }, // Sydney
    { lat: 48.8, lon: 2.3,    color: "#60a5fa", size: 0.048, delay: 0.8  }, // Paris
    { lat: 37.8, lon: -122.4, color: "#a78bfa", size: 0.052, delay: 1.8  }, // SF
    { lat: 1.3,  lon: 103.8,  color: "#34d399", size: 0.046, delay: 3    }, // Singapore
    { lat: 55.7, lon: 37.6,   color: "#c084fc", size: 0.048, delay: 0.3  }, // Moscow
  ];

  // Connection arcs between cities
  const arcs = [
    { lat1: 51.5, lon1: -0.1,  lat2: 40.7, lon2: -74.0, color: "#60a5fa", opacity: 0.4, delay: 0   },
    { lat1: 12.9, lon1: 77.6,  lat2: 35.7, lon2: 139.7, color: "#a78bfa", opacity: 0.4, delay: 1   },
    { lat1: 40.7, lon1: -74.0, lat2: 37.8, lon2:-122.4, color: "#34d399", opacity: 0.35,delay: 2   },
    { lat1: 12.9, lon1: 77.6,  lat2: 51.5, lon2: -0.1,  color: "#fbbf24", opacity: 0.3, delay: 0.5 },
    { lat1: 48.8, lon1: 2.3,   lat2: 35.7, lon2: 139.7, color: "#60a5fa", opacity: 0.3, delay: 1.5 },
    { lat1: 1.3,  lon1: 103.8, lat2: -33.9,lon2: 151.2, color: "#22d3ee", opacity: 0.35,delay: 2.5 },
    { lat1: 28.6, lon1: 77.2,  lat2: 1.3,  lon2: 103.8, color: "#f472b6", opacity: 0.3, delay: 0.8 },
    { lat1: 55.7, lon1: 37.6,  lat2: 48.8, lon2: 2.3,   color: "#c084fc", opacity: 0.35,delay: 1.2 },
  ];

  return (
    <Canvas
      camera={{ position: [0, 0.6, 4.8], fov: 52 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
      dpr={[1, 1.5]}
    >
      <Suspense fallback={null}>
        {/* Lighting */}
        <ambientLight intensity={0.08} />
        <pointLight position={[5, 5, 5]}   intensity={12} color="#60a5fa" distance={14} decay={2} />
        <pointLight position={[-4, -2, 3]}  intensity={8}  color="#a855f7" distance={10} decay={2} />
        <pointLight position={[0, 6, -2]}   intensity={5}  color="#06b6d4" distance={10} decay={2} />

        {/* Globe */}
        <GlobeCore />

        {/* City dots */}
        {dots.map((d, i) => <GlobeDot key={i} {...d} />)}

        {/* Connection arcs */}
        {arcs.map((a, i) => <GlobeArc key={i} {...a} />)}

        {/* Orbit rings */}
        <OrbRing radius={2.1}  color="#3b82f6" speed={0.22}  tilt={0}              thickness={0.007} />
        <OrbRing radius={2.55} color="#a855f7" speed={-0.17} tilt={Math.PI / 5}    thickness={0.005} />
        <OrbRing radius={2.95} color="#06b6d4" speed={0.13}  tilt={Math.PI * 0.38} thickness={0.004} />

        {/* Satellites */}
        <Satellite radius={2.1}  color="#60a5fa" speed={0.6}   offset={0}         tilt={0}           />
        <Satellite radius={2.1}  color="#60a5fa" speed={0.6}   offset={Math.PI}   tilt={0}           />
        <Satellite radius={2.55} color="#c084fc" speed={-0.45} offset={Math.PI/3} tilt={Math.PI / 5} />
        <Satellite radius={2.95} color="#22d3ee" speed={0.32}  offset={Math.PI/2} tilt={Math.PI*0.38}/>

        {/* Particles */}
        <Particles count={280} />

        {/* Stars */}
        <Stars radius={30} depth={50} count={1400} factor={3.5} saturation={0.8} fade speed={0.6} />

        <Environment preset="night" />
      </Suspense>
    </Canvas>
  );
}
