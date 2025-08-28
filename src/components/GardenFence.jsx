// src/components/GardenFence.jsx
import React from 'react';
import * as THREE from 'three';

const GardenFence = () => {
  const fenceHeight = 1.5;
  const fenceSize = 100; // Size of the square garden area, increased to 100m
  const postSpacing = 3;
  const numPosts = Math.floor(fenceSize / postSpacing);
  const picketWidth = 0.05;

  const createFenceSide = (side) => {
    const posts = [];
    const rails = [];
    const pickets = [];

    for (let i = 0; i <= numPosts; i++) {
      const position = (i * postSpacing) - (fenceSize / 2);

      let x, z;
      if (side === 'front' || side === 'back') {
        x = position;
        z = side === 'front' ? -fenceSize / 2 : fenceSize / 2;
      } else {
        x = side === 'left' ? -fenceSize / 2 : fenceSize / 2;
        z = position;
      }

      // Create a post, skipping the gate area on the front side
      if (side === 'front' && x >= -2 && x <= 2) {
        continue;
      }
      
      posts.push(
        <mesh key={`${side}-post-${i}`} position={[x, fenceHeight / 2, z]}>
          <boxGeometry args={[0.1, fenceHeight, 0.1]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      );

      // Create pickets
      if (i < numPosts) {
        for (let j = 0; j < postSpacing / picketWidth / 2; j++) {
          const picketPos = (j * picketWidth * 2) - (postSpacing / 2);
          const picketX = side === 'front' || side === 'back' ? x + picketPos : x;
          const picketZ = side === 'front' || side === 'back' ? z : z + picketPos;
          
          if (side === 'front' && picketX >= -2 && picketX <= 2) {
            continue;
          }

          picketZ !== undefined && pickets.push(
            <mesh key={`${side}-picket-${i}-${j}`} position={[picketX, fenceHeight * 0.4, picketZ]}>
              <boxGeometry args={[0.05, fenceHeight * 0.8, 0.05]} />
              <meshStandardMaterial color="#A0522D" />
            </mesh>
          );
        }
      }
      
      // Create horizontal rails
      if (i < numPosts) {
        let railX, railZ;
        if (side === 'front' || side === 'back') {
          railX = x + postSpacing / 2;
          railZ = z;
        } else {
          railX = x;
          railZ = z + postSpacing / 2;
        }

        rails.push(
          <mesh key={`${side}-rail-top-${i}`} position={[railX, fenceHeight * 0.8, railZ]}>
            <boxGeometry args={[side === 'front' || side === 'back' ? postSpacing : 0.05, 0.05, side === 'front' || side === 'back' ? 0.05 : postSpacing]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
        );
        
        rails.push(
          <mesh key={`${side}-rail-bottom-${i}`} position={[railX, fenceHeight * 0.3, railZ]}>
            <boxGeometry args={[side === 'front' || side === 'back' ? postSpacing : 0.05, 0.05, side === 'front' || side === 'back' ? 0.05 : postSpacing]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
        );
      }
    }
    return [...posts, ...rails, ...pickets];
  };

  return (
    <group>
      {/* Front fence with gate opening */}
      <group>{createFenceSide('front')}</group>

      {/* Back fence */}
      <group>{createFenceSide('back')}</group>

      {/* Left fence */}
      <group>{createFenceSide('left')}</group>

      {/* Right fence */}
      <group>{createFenceSide('right')}</group>

      {/* Decorative Gate Structure */}
      <group>
        {/* Gate posts */}
        <mesh position={[-2, fenceHeight * 1.5, -fenceSize / 2]}>
          <boxGeometry args={[0.2, fenceHeight * 3, 0.2]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
        <mesh position={[2, fenceHeight * 1.5, -fenceSize / 2]}>
          <boxGeometry args={[0.2, fenceHeight * 3, 0.2]} />
          <meshStandardMaterial color="#654321" />
        </mesh>

        {/* Gate arch */}
        <mesh position={[0, fenceHeight * 2.5, -fenceSize / 2]}>
          <boxGeometry args={[4, 0.2, 0.2]} />
          <meshStandardMaterial color="#654321" />
        </mesh>

        {/* Gate door */}
        <mesh position={[0, fenceHeight / 2, -fenceSize / 2]}>
          <boxGeometry args={[3, fenceHeight, 0.05]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      </group>
    </group>
  );
};

export default GardenFence;