import React, { useMemo, useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Stars, Line, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { SERVERS, MOCK_USER_LOCATION } from '../constants';
import { ServerNode } from '../types';

// Fix for missing IntrinsicElements types in strict environments
declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
      sphereGeometry: any;
      meshBasicMaterial: any;
      ringGeometry: any;
      boxGeometry: any;
      icosahedronGeometry: any;
      ambientLight: any;
      pointLight: any;
    }
  }
}

// --- Utils to convert Lat/Lng to Vector3 ---
const GLOBE_RADIUS = 2;

const latLngToVector3 = (lat: number, lng: number, radius: number = GLOBE_RADIUS) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = (radius * Math.sin(phi) * Math.sin(theta));
  const y = (radius * Math.cos(phi));
  return new THREE.Vector3(x, y, z);
};

// --- Curve Calculation for Connection Line ---
const getCurvePoints = (p1: THREE.Vector3, p2: THREE.Vector3) => {
  const points: THREE.Vector3[] = [];
  const dist = p1.distanceTo(p2);
  const mid = p1.clone().add(p2).multiplyScalar(0.5).normalize().multiplyScalar(GLOBE_RADIUS + dist * 0.5);
  
  const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
  return curve.getPoints(50);
};

interface GlobeProps {
  selectedServerId: string | null;
  connectedServerId: string | null;
  onSelectServer: (id: string) => void;
}

// --- Subcomponents ---

interface ServerMarkerProps { 
  server: ServerNode; 
  isSelected: boolean; 
  isConnected: boolean;
  onClick: () => void;
}

const ServerMarker: React.FC<ServerMarkerProps> = ({ server, isSelected, isConnected, onClick }) => {
  const pos = useMemo(() => latLngToVector3(server.lat, server.lng, GLOBE_RADIUS + 0.05), [server]);
  const color = isConnected ? '#00f3ff' : isSelected ? '#bc13fe' : '#4b5563';

  return (
    <group position={pos} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      <mesh>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} />
      </mesh>
      {(isSelected || isConnected) && (
        <mesh>
          <ringGeometry args={[0.07, 0.08, 32]} />
          <meshBasicMaterial color={color} side={THREE.DoubleSide} />
        </mesh>
      )}
      {isSelected && (
        <Html distanceFactor={10}>
          <div className="bg-black/80 text-cyber-primary text-xs px-2 py-1 rounded border border-cyber-primary backdrop-blur whitespace-nowrap pointer-events-none">
            {server.city}
          </div>
        </Html>
      )}
    </group>
  );
};

const UserMarker = () => {
  const pos = useMemo(() => latLngToVector3(MOCK_USER_LOCATION.lat, MOCK_USER_LOCATION.lng, GLOBE_RADIUS + 0.05), []);
  return (
    <mesh position={pos}>
      <boxGeometry args={[0.08, 0.08, 0.08]} />
      <meshBasicMaterial color="white" wireframe />
    </mesh>
  );
};

const ConnectionLine = ({ serverId }: { serverId: string }) => {
  const server = SERVERS.find(s => s.id === serverId);
  if (!server) return null;

  const startPos = latLngToVector3(MOCK_USER_LOCATION.lat, MOCK_USER_LOCATION.lng);
  const endPos = latLngToVector3(server.lat, server.lng);
  const points = useMemo(() => getCurvePoints(startPos, endPos), [startPos, endPos]);

  return (
    <Line
      points={points}
      color="#00f3ff"
      lineWidth={2}
      transparent
      opacity={0.6}
    />
  );
};

// --- New Feature: Active Shield & Threats ---

const Shield = ({ position }: { position: THREE.Vector3 }) => {
  const ref = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (ref.current && glowRef.current) {
      const t = clock.getElapsedTime();
      ref.current.rotation.y = t * 0.5;
      ref.current.rotation.z = t * 0.2;
      ref.current.scale.setScalar(1 + Math.sin(t * 3) * 0.05); // Pulse
      glowRef.current.scale.setScalar(1.2 + Math.sin(t * 2) * 0.1);
    }
  });

  return (
    <group position={position}>
      {/* Wireframe Core */}
      <mesh ref={ref}>
        <icosahedronGeometry args={[0.15, 1]} />
        <meshBasicMaterial color="#00f3ff" wireframe transparent opacity={0.6} />
      </mesh>
      {/* Glow Shell */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial color="#bc13fe" transparent opacity={0.2} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
};

const ThreatParticle = ({ targetPosition }: { targetPosition: THREE.Vector3 }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  // Random start position relative to target
  const startOffset = useMemo(() => {
    const vec = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(0.8 + Math.random() * 0.5);
    return vec;
  }, []);

  const [progress, setProgress] = useState(Math.random()); // 0 to 1
  const speed = 0.5 + Math.random() * 0.5;

  useFrame((state, delta) => {
    if (meshRef.current) {
      let newProg = progress + delta * speed;
      if (newProg >= 1) newProg = 0;
      
      // Linear interpolation from (Target + Offset) to Target
      const currentPos = targetPosition.clone().add(startOffset.clone().multiplyScalar(1 - newProg));
      meshRef.current.position.copy(currentPos);
      
      // Scale down as it hits
      const scale = Math.max(0, (newProg - 0.8) * 5); // 0 to 1 roughly
      meshRef.current.scale.setScalar(newProg > 0.9 ? (1 - newProg) * 10 * 0.03 : 0.03);
      
      setProgress(newProg);
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshBasicMaterial color="#ef4444" transparent opacity={0.8} />
    </mesh>
  );
};

const IncomingThreats = ({ serverId }: { serverId: string }) => {
  const server = SERVERS.find(s => s.id === serverId);
  if (!server) return null;
  const pos = useMemo(() => latLngToVector3(server.lat, server.lng, GLOBE_RADIUS + 0.05), [server]);
  
  // Generate 10 random particles
  const particles = useMemo(() => new Array(10).fill(0).map((_, i) => i), []);

  return (
    <group>
      {particles.map(i => <ThreatParticle key={i} targetPosition={pos} />)}
    </group>
  );
};

const WorldMap = () => {
  // Using a high-quality night lights texture for a cyberpunk feel
  const texture = useTexture('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_lights_2048.png');
  
  return (
    <mesh rotation={[0, -Math.PI / 2, 0]}>
      <sphereGeometry args={[GLOBE_RADIUS + 0.01, 64, 64]} />
      <meshBasicMaterial 
        map={texture} 
        transparent 
        opacity={0.7} 
        blending={THREE.AdditiveBlending}
        color="#00f3ff"
      />
    </mesh>
  );
};

const GlobeGrid = () => {
  return (
    <mesh>
      <sphereGeometry args={[GLOBE_RADIUS + 0.05, 32, 32]} />
      <meshBasicMaterial 
        color="#00f3ff" 
        wireframe 
        transparent 
        opacity={0.1} 
      />
    </mesh>
  );
};

const WireframeGlobe = () => {
  return (
    <group>
      {/* Solid Core */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
        <meshBasicMaterial color="#050510" />
      </mesh>
      
      {/* Inner Wireframe */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS + 0.005, 40, 40]} />
        <meshBasicMaterial color="#1e293b" wireframe transparent opacity={0.2} />
      </mesh>

      {/* World Map Texture */}
      <Suspense fallback={null}>
        <WorldMap />
      </Suspense>

      {/* Outer Grid */}
      <GlobeGrid />

      {/* Atmosphere Glow */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS + 0.3, 64, 64]} />
        <meshBasicMaterial 
          color="#00f3ff" 
          transparent 
          opacity={0.03} 
          side={THREE.BackSide} 
          blending={THREE.AdditiveBlending} 
        />
      </mesh>
    </group>
  );
};

const RotatingGroup: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
    }
  });
  return <group ref={groupRef}>{children}</group>;
};

export default function Globe3D({ selectedServerId, connectedServerId, onSelectServer }: GlobeProps) {
  // Calculate shield position based on connected ID
  const connectedServer = SERVERS.find(s => s.id === connectedServerId);
  const shieldPos = connectedServer ? latLngToVector3(connectedServer.lat, connectedServer.lng, GLOBE_RADIUS + 0.05) : null;

  return (
    <div className="w-full h-full absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00f3ff" />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <RotatingGroup>
           <WireframeGlobe />
           <UserMarker />
           {SERVERS.map(server => (
             <ServerMarker 
               key={server.id} 
               server={server} 
               isSelected={selectedServerId === server.id}
               isConnected={connectedServerId === server.id}
               onClick={() => onSelectServer(server.id)}
             />
           ))}
           {connectedServerId && <ConnectionLine serverId={connectedServerId} />}
           {connectedServerId && shieldPos && <Shield position={shieldPos} />}
           {connectedServerId && <IncomingThreats serverId={connectedServerId} />}
        </RotatingGroup>
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          autoRotate={false} 
          minPolarAngle={Math.PI / 4} 
          maxPolarAngle={Math.PI - Math.PI / 4}
        />
      </Canvas>
    </div>
  );
}