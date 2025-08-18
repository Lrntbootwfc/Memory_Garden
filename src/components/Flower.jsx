// src/components/Flower.jsx
import React, { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

const Flower = ({ position = [0, 0, 0], modelPath, targetHeight = 1.5 }) => {
  const { scene } = useGLTF(modelPath);

  // Compute normalization once
  const { normalizedScene, yOffset } = useMemo(() => {
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

    // Compute bottom Y so model sits on ground
    const yOffset = -newBox.min.y;

    return { normalizedScene: clone, yOffset };
  }, [scene, targetHeight]);

  return (
    <primitive
      object={normalizedScene}
      position={[position[0], position[1] + yOffset, position[2]]}
    />
  );
};

// Optional: Preload some models for smoother first load
useGLTF.preload("/models/rose.glb");
useGLTF.preload("/models/tulip_flower.glb");
useGLTF.preload("/models/orchid_flower.glb");

export default Flower;
