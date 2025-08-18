// src/components/GardenScene.jsx
import React, { useMemo } from "react";
import { OrbitControls, Environment, Sky, useTexture } from "@react-three/drei";
import * as THREE from "three";
import Flower from "./Flower";
import CameraController from "./CameraController";

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

const lotusModel = "/models/lotus_flower_by_geometry_nodes.glb";

const gardenSize = 50; // smaller garden so flowers stay in camera view
const spacing = 2.5; // spacing between flowers

// Generate clustered flowers in rows and columns (no overlap per coordinate)
const generateFlowerClusters = () => {
    const flowers = [];
    const maxPerRow = Math.floor((gardenSize * 0.75) / spacing);

    for (let i = 0; i < maxPerRow; i++) {
        for (let j = 0; j < maxPerRow; j++) {
            // Randomly pick a flower type for this coordinate
            const modelPath = flowerModels[Math.floor(Math.random() * flowerModels.length)];
            const x = -gardenSize / 2 + i * spacing;
            const z = -gardenSize / 2 + j * spacing;
            flowers.push({
                position: [x, 0, z],
                modelPath,
                scale: 1.5,
            });
        }
    }

    return flowers;
};

// Lotus flowers in corner pond
const generateLotusFlowers = () => {
    const lotusFlowers = [];
    const pondCenter = [15, 0, 15];
    const pondRadius = 4;
    const lotusCount = 6;

    for (let i = 0; i < lotusCount; i++) {
        const angle = (i / lotusCount) * Math.PI * 2;
        const radius = pondRadius * (0.4 + Math.random() * 0.6);
        const x = pondCenter[0] + radius * Math.cos(angle);
        const z = pondCenter[2] + radius * Math.sin(angle);
        lotusFlowers.push({
            position: [x, 0, z],
            modelPath: lotusModel,
            scale: 0.6,
        });
    }

    return lotusFlowers;
};

const GardenScene = ({ grassTexturePath = "/textures/grass.jpeg" }) => {
    const grassTexture = useTexture(grassTexturePath);
    grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(10, 10);

    const flowers = useMemo(() => generateFlowerClusters(), []);
    const lotusFlowers = useMemo(() => generateLotusFlowers(), []);

    return (
        <>
            <ambientLight intensity={0.6} />
            <directionalLight position={[20, 40, 20]} intensity={1.2} castShadow />

            {/* Grass Ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[gardenSize, gardenSize]} />
                <meshStandardMaterial map={grassTexture} />
            </mesh>

            {/* Pond in corner */}
            <mesh position={[15, 0, 15]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <circleGeometry args={[4, 64]} />
                <meshStandardMaterial
                    color="#4DA6FF"
                    transparent
                    opacity={0.5}
                    roughness={0.2}
                    metalness={0.1}
                />
            </mesh>

            {/* Lotus Flowers */}
            {lotusFlowers.map((flower, idx) => (
                <Flower
                    key={`lotus-${idx}`}
                    position={flower.position}
                    modelPath={flower.modelPath}
                    targetHeight={flower.scale}
                />
            ))}

            {/* Other Flowers */}
            {flowers.map((flower, idx) => (
                <Flower
                    key={`flower-${idx}`}
                    position={flower.position}
                    modelPath={flower.modelPath}
                    targetHeight={flower.scale}
                />
            ))}

            <Sky sunPosition={[100, 20, 100]} />
            <Environment preset="sunset" />
            <OrbitControls enablePan enableZoom enableRotate />
            <CameraController />
        </>
    );
};

export default GardenScene;
