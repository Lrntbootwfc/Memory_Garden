// src/components/Flower.jsx
import React, { useMemo, useRef, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const MemoryAura = ({ path, targetHeight }) => {
  const memoryTexture = useTexture(path);
  return (
    <mesh position={[0, targetHeight * 1.2, 0]}>
      <planeGeometry args={[1.2, 1.2]} />
      <meshBasicMaterial
        map={memoryTexture}
        transparent
        opacity={0.35}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
};

const Flower = ({
  position = [0, 0, 0],
  modelPath,
  targetHeight = 1.5,
  autoBloom = false,// true -> bloom automatically
  memoryTexturePath = null, 
  onClick,
  hasMemory = false,
  ...props
}) => {
  
  const { scene } = useGLTF(modelPath);
  const flowerRef = useRef();
  const [blooming, setBlooming] = useState(autoBloom);
  const [scale, setScale] = useState(autoBloom ? 1 : 0.2);

  // Normalize and align flower model
  const memoryTexture = memoryTexturePath ? useTexture(memoryTexturePath) : null;
  
  const { normalizedScene, yOffset } = useMemo(() => {
    if (!scene) {
      return { normalizedScene: null, yOffset: 0 };
    }
    
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    const scaleFactor = targetHeight / size.y;
    clone.scale.setScalar(scaleFactor);
    const newBox = new THREE.Box3().setFromObject(clone);
    const newSize = new THREE.Vector3();
    newBox.getSize(newSize);
    const yOffset = -newBox.min.y;

    return { normalizedScene: clone, yOffset };
  }, [scene, targetHeight]);


  const handleFlowerClick = (e) => {
    // Stop the event propagation so it doesn't affect other elements
    e.stopPropagation();

    // Call the local bloom function first
    setBlooming(true);

    // Then, if the onClick prop exists, call it.
    if (onClick) {
      onClick();
    }
  };

  // Bloom animation
  useFrame((_, delta) => {
    if (blooming && scale < 1) {
      setScale((prev) => Math.min(prev + delta * 2, 1));
    }
  });
  if (!normalizedScene) {
    return null; //no scene loaded
  }
  const flowerMesh = normalizedScene.children.find(child => child instanceof THREE.Mesh);
  const glowGeometry = flowerMesh ? flowerMesh.geometry.clone() : null;

  return (
    <group
      {...props}

      ref={flowerRef}
      position={[position[0], position[1] + yOffset, position[2]]}
      scale={[scale, scale, scale]}
      onClick={handleFlowerClick}
    >
      <primitive object={normalizedScene} />
      {/* Blended memory aura */}
      {memoryTexturePath && (
        <MemoryAura path={memoryTexturePath} targetHeight={targetHeight} />
      )}

      {hasMemory && glowGeometry && (
        <mesh geometry={glowGeometry}>
          <meshBasicMaterial
            color="#FFD700"
            transparent
            opacity={0.6}
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>
      )}


    </group>

  );
};

// Optional preloading for smoother experience
useGLTF.preload("/models/rose.glb");
useGLTF.preload("/models/orchid_flower.glb");

export default Flower;
