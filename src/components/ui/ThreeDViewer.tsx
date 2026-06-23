import { Suspense, useMemo } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Stage, Center } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import * as THREE from 'three';
import { Loader2 } from 'lucide-react';

interface ThreeDViewerProps {
  url: string;
}

function Model({ url }: { url: string }) {
  // useLoader handles the suspense boundary automatically
  const obj = useLoader(OBJLoader, url);

  // Apply a nice default material to the parsed OBJ geometry
  const geometry = useMemo(() => {
    let geo;
    obj.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        geo = child.geometry;
      }
    });
    return geo;
  }, [obj]);

  if (!geometry) return null;

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial 
        color="#8c92a6" 
        roughness={0.4} 
        metalness={0.6}
        side={THREE.DoubleSide} 
      />
    </mesh>
  );
}

// Fallback spinner while OBJ is downloading/parsing
function Loader() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-1 z-10">
      <Loader2 size={48} className="text-gold animate-spin mb-4" />
      <p className="t-body-sm text-ink-light animate-pulse">Loading 3D Geometry...</p>
    </div>
  );
}

export function ThreeDViewer({ url }: ThreeDViewerProps) {
  return (
    <div className="relative w-full h-[500px] md:h-[600px] bg-surface-1 rounded-xl overflow-hidden border border-cream-border">
      <Suspense fallback={<Loader />}>
        <Canvas shadows dpr={[1, 2]} camera={{ fov: 45 }}>
          <color attach="background" args={['#1a1c23']} />
          
          <Stage environment="city" intensity={0.6} adjustCamera={1.2}>
            <Center>
              <Model url={url} />
            </Center>
          </Stage>
          
          <OrbitControls 
            makeDefault 
            autoRotate={true} 
            autoRotateSpeed={0.5} 
            minPolarAngle={0} 
            maxPolarAngle={Math.PI / 1.5}
            enableZoom={true}
            enablePan={false}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}
