// src/components/Flower.jsx
import React from "react";
import { MeshDistortMaterial } from "@react-three/drei";

const Flower = ({ position, color }) => {
  return (
    <group position={position}>
      {/* Stem */}
      <mesh>
        <cylinderGeometry args={[0.05, 0.05, 1.5]} />
        <meshStandardMaterial color="green" />
      </mesh>
      {/* Flower Head */}
      <mesh position={[0, 0.9, 0]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <MeshDistortMaterial color={color} distort={0.2} speed={2} />
      </mesh>
    </group>
  );
};

export default Flower;