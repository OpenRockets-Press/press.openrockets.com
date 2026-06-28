import React, { useMemo, useEffect, Suspense, Component, ReactNode, useRef, useState } from 'react';
import { Canvas, useLoader, useFrame } from '@react-three/fiber';
import { OrbitControls, Center, Bounds } from '@react-three/drei';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

import { Html } from '@react-three/drei';
import { Spinner } from '@/components/ui/Spinner';

interface ErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: any) => void;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, {hasError: boolean, error: any}> {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  componentDidCatch(error: any) {
    console.error("ThreeJS Loading Error:", error);
    this.props.onError?.(error);
  }
  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

interface ModelViewerBoxProps {
  url: string;
  isThumbnail?: boolean;
  isHovered?: boolean;
  onError?: (error: any) => void;
}

function applyThumbnailMaterial(scene: THREE.Object3D) {
  const blackMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
  scene.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      (child as THREE.Mesh).material = blackMaterial;
    }
  });
}

function OBJModel({ url, isThumbnail }: ModelViewerBoxProps) {
  const obj = useLoader(OBJLoader, url);
  const clonedScene = useMemo(() => {
    const clone = obj.clone();
    
    if (isThumbnail) {
      applyThumbnailMaterial(clone);
    } else {
      const defaultMat = new THREE.MeshStandardMaterial({ 
        color: 0x888888, 
        roughness: 0.5, 
        metalness: 0.3,
        side: THREE.DoubleSide 
      });
      clone.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          (child as THREE.Mesh).material = defaultMat;
        }
      });
    }
    
    return clone;
  }, [obj, isThumbnail]);

  return isThumbnail ? <Center><primitive object={clonedScene} /></Center> : <Center><primitive object={clonedScene} /></Center>;
}

function Model({ url, isThumbnail }: ModelViewerBoxProps) {
  return <OBJModel url={url} isThumbnail={isThumbnail} />;
}

// Parallax: subtle rotation based on mouse position & scroll — always active (OrbitControls overrides when dragging)
function ParallaxGroup({ isHovered, children }: { isHovered: boolean, children: ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);
  const targetRotation = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Whether inside or outside the container, subtly follow the mouse
      targetRotation.current.x = (e.clientX / window.innerWidth - 0.5) * (isHovered ? 0.4 : 0.8);
      targetRotation.current.y = (e.clientY / window.innerHeight - 0.5) * (isHovered ? 0.15 : 0.3);
    };
    
    const handleScroll = () => {
      if (!isHovered) {
        targetRotation.current.x = (window.scrollY / window.innerHeight) * Math.PI * 0.3;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isHovered]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += (targetRotation.current.x - groupRef.current.rotation.y) * 0.03;
      groupRef.current.rotation.x += (targetRotation.current.y - groupRef.current.rotation.x) * 0.03;
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

const ModelViewerBoxComponent = ({ url, isThumbnail = false, isHovered = false, onError }: ModelViewerBoxProps) => {
  // Lightweight lighting setup instead of heavy Stage
  const mainViewerElement = useMemo(() => (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <directionalLight position={[-3, -3, 2]} intensity={0.3} />
      <ParallaxGroup isHovered={isHovered}>
        <Center>
          <Model url={url} isThumbnail={false} />
        </Center>
      </ParallaxGroup>
    </>
  ), [url, isHovered]);

  const thumbnailElement = useMemo(() => (
    <Bounds fit observe margin={1.5}>
      <ambientLight intensity={1} />
      <Model url={url} isThumbnail={true} />
    </Bounds>
  ), [url]);

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50, near: 0.1, far: 10000 }}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
      frameloop={isThumbnail ? 'demand' : 'always'}
    >
      <ErrorBoundary onError={onError}>
        <Suspense fallback={
          <Html center>
            <Spinner color="#0067b8" />
          </Html>
        }>
          {isThumbnail ? thumbnailElement : (
            <>
              {mainViewerElement}
              <OrbitControls makeDefault autoRotate={false} enableZoom={true} enablePan={true} />
            </>
          )}
        </Suspense>
      </ErrorBoundary>
    </Canvas>
  );
};

const ModelViewerBoxMemo = React.memo(ModelViewerBoxComponent);

export function ModelViewerBox(props: ModelViewerBoxProps) {
  return <ModelViewerBoxMemo {...props} />;
}
