// src/components/Flower.jsx
import React, { useMemo, useRef, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const Flower = ({
  position = [0, 0, 0],
  modelPath,
  targetHeight = 1.5,
  autoBloom = false,// true -> bloom automatically
  memoryTexturePath = null, 
  onClick,
  hasMemory = false
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

    // Compute bounding box
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);

    // Scale so tallest dimension = targetHeight
    const scaleFactor = targetHeight / size.y;
    clone.scale.setScalar(scaleFactor);

    // Recompute box after scaling
    const newBox = new THREE.Box3().setFromObject(clone);
    const newSize = new THREE.Vector3();
    newBox.getSize(newSize);

    // Compute offset so base sits on ground
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
      ref={flowerRef}
      position={[position[0], position[1] + yOffset, position[2]]}
      scale={[scale, scale, scale]}
      onClick={handleFlowerClick}
    >
      <primitive object={normalizedScene} />
      {/* Blended memory aura */}
      {memoryTexture && (
        <mesh position={[0, targetHeight * 1.2, 0]}>
          <planeGeometry args={[1.2, 1.2]} />
          <meshBasicMaterial
            map={memoryTexture}
            transparent
            opacity={0.35} // faint blending
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
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
