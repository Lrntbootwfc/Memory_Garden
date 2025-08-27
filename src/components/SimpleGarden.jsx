// src/components/SimpleGarden.jsx
import React from 'react';
import * as THREE from 'three';

const SimpleGarden = () => {
  return (
    <group>
      {/* Simple Trees - Just cylinders and spheres */}
      {[
        { pos: [-20, 0, -20], height: 3, color: '#228B22' },
        { pos: [25, 0, -15], height: 2.5, color: '#32CD32' },
        { pos: [-15, 0, 25], height: 3.5, color: '#228B22' },
        { pos: [20, 0, 20], height: 2, color: '#32CD32' },
        { pos: [-25, 0, 10], height: 2.8, color: '#228B22' }
      ].map((tree, i) => (
        <group key={i} position={tree.pos}>
          {/* Tree trunk */}
          <mesh position={[0, tree.height/2, 0]}>
            <cylinderGeometry args={[0.3, 0.4, tree.height, 8]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
          {/* Tree leaves */}
          <mesh position={[0, tree.height + 1, 0]}>
            <sphereGeometry args={[1.5, 8, 6]} />
            <meshStandardMaterial color={tree.color} />
          </mesh>
        </group>
      ))}

      {/* Simple Garden Bench */}
      {[
        { pos: [5, 0, 5] },
        { pos: [-5, 0, -5] }
      ].map((bench, i) => (
        <group key={i} position={bench.pos}>
          {/* Bench seat */}
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[2, 0.1, 0.5]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
          {/* Bench back */}
          <mesh position={[0, 0.8, -0.2]}>
            <boxGeometry args={[2, 0.8, 0.1]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
          {/* Bench legs */}
          {[-0.8, 0.8].map((x, j) => (
            <mesh key={j} position={[x, 0.2, 0]}>
              <boxGeometry args={[0.1, 0.4, 0.1]} />
              <meshStandardMaterial color="#654321" />
            </mesh>
          ))}
        </group>
      ))}

      {/* Simple Bird Bath */}
      <group position={[8, 0, 8]}>
        {/* Base */}
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.8, 1, 0.6, 8]} />
          <meshStandardMaterial color="#C0C0C0" />
        </mesh>
        {/* Water */}
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.7, 0.7, 0.1, 8]} />
          <meshStandardMaterial color="#4DA6FF" transparent opacity={0.7} />
        </mesh>
      </group>

      {/* Simple Garden Lamp */}
      {[
        { pos: [6, 0, 6] },
        { pos: [-6, 0, -6] },
        { pos: [6, 0, -6] },
        { pos: [-6, 0, 6] }
      ].map((lamp, i) => (
        <group key={i} position={lamp.pos}>
          {/* Lamp post */}
          <mesh position={[0, 1.5, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 3, 8]} />
            <meshStandardMaterial color="#696969" />
          </mesh>
          {/* Lamp head */}
          <mesh position={[0, 3, 0]}>
            <sphereGeometry args={[0.3, 8, 6]} />
            <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.3} />
          </mesh>
        </group>
      ))}

      {/* Simple Rock Formations */}
      {[
        { pos: [18, 0, 18], scale: [1.2, 0.8, 1] },
        { pos: [-18, 0, -18], scale: [1, 0.6, 0.8] },
        { pos: [18, 0, -18], scale: [0.8, 0.5, 1.1] },
        { pos: [-18, 0, 18], scale: [1.1, 0.7, 0.9] }
      ].map((rock, i) => (
        <mesh key={i} position={rock.pos} scale={rock.scale}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#708090" roughness={0.8} />
        </mesh>
      ))}

      {/* Simple Garden Gnome */}
      <group position={[3, 0, 3]}>
        {/* Body */}
        <mesh position={[0, 0.4, 0]}>
          <coneGeometry args={[0.3, 0.8, 8]} />
          <meshStandardMaterial color="#FF0000" />
        </mesh>
        {/* Head */}
        <mesh position={[0, 1, 0]}>
          <sphereGeometry args={[0.2, 8, 6]} />
          <meshStandardMaterial color="#FFB6C1" />
        </mesh>
        {/* Hat */}
        <mesh position={[0, 1.3, 0]}>
          <coneGeometry args={[0.25, 0.3, 8]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
      </group>

      {/* Simple Wheelbarrow */}
      <group position={[9, 0, 9]}>
        {/* Main body */}
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[1.5, 0.3, 0.8]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        {/* Wheel */}
        <mesh position={[0.6, 0.15, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.1, 8]} />
          <meshStandardMaterial color="#2F4F4F" />
        </mesh>
        {/* Handles */}
        <mesh position={[-0.8, 0.3, 0]} rotation={[0, 0, Math.PI/4]}>
          <cylinderGeometry args={[0.05, 0.05, 1, 8]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      </group>
    </group>
  );
};

export default SimpleGarden;
