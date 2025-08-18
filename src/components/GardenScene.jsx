// src/components/GardenScene.jsx
import React from "react";
import { Environment, OrbitControls, Sky, useTexture } from "@react-three/drei";
import * as THREE from "three";
import Flower from "./Flower";
import CameraController from "./CameraController";

// Flower models
const flowerModels = [
    "/models/alien_flower.glb",
    "/models/blue_flower_animated.glb",
    "/models/calendula_flower.glb",
    "/models/flower (1).glb",
    "/models/flower.glb",
    "/models/margarita_flower.glb",
    "/models/orchid_flower.glb",
    "/models/sunflower.glb",
    "/models/tulip_flower.glb",
    "/models/white_flower.glb",
];

// Clustered flowers on grass
const generateFlowerClusters = () => {
    const clusters = [];
    let zOffset = -8; // row spacing

    flowerModels
        .filter((model) => !model.includes("lotus")) // exclude lotus
        .forEach((modelPath) => {
            const rowLength = 3 + Math.floor(Math.random() * 3);
            for (let i = 0; i < rowLength; i++) {
                const x = -5 + i * 3;
                clusters.push({
                    position: [x, 0, zOffset],
                    modelPath,
                    scale: 1.0 + Math.random() * 0.3,
                });
            }
            zOffset += 3;
        });

    return clusters;
};

// Lotus flower positions in pond
const lotusPositions = [
    [8, 0, 0], // center of pond
    [9.5, 0, -1], // slight offset
    [6.5, 0, 1],
];

const flowerData = generateFlowerClusters();

const GardenScene = ({
    grassTexturePath = "/textures/grass.jpeg",
    gardenSize = 100,
    pondRadius = 4,
}) => {
    // Grass texture
    const grassTexture = useTexture(grassTexturePath);
    grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(25, 25);

    return (
        <>
            {/* Lights */}
            <ambientLight intensity={0.6} />
            <directionalLight position={[8, 15, 8]} intensity={1.2} castShadow />

            {/* Sky */}
            <Sky sunPosition={[100, 20, 100]} />

            {/* Grass Ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.75, 0]} receiveShadow>
                <planeGeometry args={[gardenSize, gardenSize]} />
                <meshStandardMaterial map={grassTexture} />
            </mesh>

            {/* Pond */}
            <group>
                <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                    <circleGeometry args={[pondRadius, 64]} />
                    <meshStandardMaterial color="#4DA6FF" transparent opacity={0.7} />
                </mesh>

                {/* Lotus flowers in pond only */}
                {lotusPositions.map((pos, idx) => (
                    <Flower
                        key={`lotus-${idx}`}
                        modelPath="/models/lotus_flower_by_geometry_nodes.glb"
                        position={pos}
                        scale={0.5} // smaller, proportional to other flowers
                    />
                ))}
            </group>

            {/* Clustered non-lotus flowers */}
            {flowerData.map((flower, idx) => (
                <Flower
                    key={idx}
                    position={flower.position}
                    modelPath={flower.modelPath}
                    scale={flower.scale}
                />
            ))}

            {/* Controls & Environment */}
            <OrbitControls enablePan enableZoom enableRotate />
            <CameraController />
            <Environment preset="sunset" />
        </>
    );
};

export default GardenScene;
