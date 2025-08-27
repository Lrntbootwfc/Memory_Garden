// src/components/GardenFence.jsx
import React from 'react';
import * as THREE from 'three';

const GardenFence = () => {
  const fenceHeight = 1.5;
  const fenceLength = 60;
  const postSpacing = 3;
  const numPosts = Math.floor(fenceLength / postSpacing);
  
  const fencePosts = [];
  const fenceRails = [];
  
  // Create fence posts and rails
  for (let i = 0; i < numPosts; i++) {
    const x = (i * postSpacing) - (fenceLength / 2);
    
    // Fence post
    fencePosts.push(
      <mesh key={`post-${i}`} position={[x, fenceHeight / 2, -30]}>
        <boxGeometry args={[0.1, fenceHeight, 0.1]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
    );
    
    // Horizontal rails
    if (i < numPosts - 1) {
      fenceRails.push(
        <mesh key={`rail-top-${i}`} position={[x + postSpacing / 2, fenceHeight * 0.8, -30]}>
          <boxGeometry args={[postSpacing, 0.05, 0.05]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      );
      
      fenceRails.push(
        <mesh key={`rail-bottom-${i}`} position={[x + postSpacing / 2, fenceHeight * 0.3, -30]}>
          <boxGeometry args={[postSpacing, 0.05, 0.05]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      );
    }
  }
  
  // Create corner posts
  const cornerPosts = [
    { position: [-30, fenceHeight / 2, -30], key: 'corner-1' },
    { position: [30, fenceHeight / 2, -30], key: 'corner-2' },
    { position: [-30, fenceHeight / 2, 30], key: 'corner-3' },
    { position: [30, fenceHeight / 2, 30], key: 'corner-4' },
  ];
  
  return (
    <group>
      {/* Main fence line */}
      {fencePosts}
      {fenceRails}
      
      {/* Corner posts */}
      {cornerPosts.map(corner => (
        <mesh key={corner.key} position={corner.position}>
          <boxGeometry args={[0.15, fenceHeight, 0.15]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
      ))}
      
      {/* Decorative gate */}
      <mesh position={[0, fenceHeight / 2, -30]}>
        <boxGeometry args={[2, fenceHeight, 0.05]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* Gate posts */}
      <mesh position={[-1.2, fenceHeight / 2, -30]}>
        <boxGeometry args={[0.1, fenceHeight, 0.1]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      <mesh position={[1.2, fenceHeight / 2, -30]}>
        <boxGeometry args={[0.1, fenceHeight, 0.1]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
    </group>
  );
};

export default GardenFence;
