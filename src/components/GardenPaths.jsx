// src/components/GardenPaths.jsx
import React from 'react';
import * as THREE from 'three';

const GardenPaths = () => {
  // Define path points for a natural garden walkway
  const pathPoints = [
    // Main path from entrance to center
    new THREE.Vector3(-30, 0.1, 0),
    new THREE.Vector3(-20, 0.1, 0),
    new THREE.Vector3(-10, 0.1, 0),
    new THREE.Vector3(0, 0.1, 0),
    new THREE.Vector3(10, 0.1, 0),
    new THREE.Vector3(20, 0.1, 0),
    new THREE.Vector3(30, 0.1, 0),
    
    // Side paths
    new THREE.Vector3(0, 0.1, -10),
    new THREE.Vector3(0, 0.1, -20),
    new THREE.Vector3(0, 0.1, -30),
    
    new THREE.Vector3(0, 0.1, 10),
    new THREE.Vector3(0, 0.1, 20),
    new THREE.Vector3(0, 0.1, 30),
    
    // Curved paths around the pond
    new THREE.Vector3(10, 0.1, 10),
    new THREE.Vector3(15, 0.1, 15),
    new THREE.Vector3(20, 0.1, 20),
    
    new THREE.Vector3(-10, 0.1, -10),
    new THREE.Vector3(-15, 0.1, -15),
    new THREE.Vector3(-20, 0.1, -20),
  ];

  // Create path geometry
  const pathGeometry = new THREE.BufferGeometry().setFromPoints(pathPoints);
  
  // Create connecting lines between nearby points
  const connections = [];
  pathPoints.forEach((point, i) => {
    pathPoints.forEach((otherPoint, j) => {
      if (i !== j && point.distanceTo(otherPoint) < 15) {
        connections.push(point, otherPoint);
      }
    });
  });
  
  const connectionGeometry = new THREE.BufferGeometry().setFromPoints(connections);

  return (
    <group>
      {/* Main path lines */}
      <line geometry={pathGeometry}>
        <lineBasicMaterial color="#8B4513" linewidth={3} />
      </line>
      
      {/* Path connections */}
      <line geometry={connectionGeometry}>
        <lineBasicMaterial color="#A0522D" linewidth={2} />
      </line>
      
      {/* Stone path segments */}
      {pathPoints.map((point, index) => (
        <mesh key={index} position={[point.x, point.y, point.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.5, 8]} />
          <meshStandardMaterial 
            color="#D2B48C" 
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
};

export default GardenPaths;
