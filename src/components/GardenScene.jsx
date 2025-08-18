// src/components/GardenScene.jsx
import React, { useMemo } from "react";
import { PointerLockControls, Environment, Sky, useTexture } from "@react-three/drei";
import * as THREE from "three";
import Flower from "./Flower";

const flowerModels = [
    { path: "/models/alien_flower.glb", scale: 1.0 },
    { path: "/models/blue_flower_animated.glb", scale: 1.5 },
    { path: "/models/calendula_flower.glb", scale: 1.5 },
    { path: "/models/flower (1).glb", scale: 1.5 },
    { path: "/models/flower.glb", scale: 1.5 },
    { path: "/models/margarita_flower.glb", scale: 1.5 },
    { path: "/models/orchid_flower.glb", scale: 1.5 },
    { path: "/models/sunflower.glb", scale: 1.5 },
    { path: "/models/white_flower.glb", scale: 1.5 },
];

const lotusModel = "/models/lotus_flower_by_geometry_nodes.glb";
const gardenSize = 50;
const spacing = 2.5;

const generateFlowerRows = () => {
    const flowers = [];
    const rows = Math.floor((gardenSize * 0.75) / spacing);
    const cols = Math.floor((gardenSize * 0.75) / spacing);

    flowerModels.forEach((flower, rowIndex) => {
        for (let i = 0; i < cols; i++) {
            const x = -gardenSize / 2 + i * spacing;
            const z = -gardenSize / 2 + rowIndex * spacing * 2;
            flowers.push({ position: [x, 0, z], modelPath: flower.path, scale: flower.scale });
        }
    });

    return flowers;
};

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
        lotusFlowers.push({ position: [x, 0, z], modelPath: lotusModel, scale: 0.6 });
    }

    return lotusFlowers;
};

const GardenScene = ({ grassTexturePath = "/textures/grass.jpeg" }) => {
    const grassTexture = useTexture(grassTexturePath);
    grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(10, 10);

    const flowers = useMemo(() => generateFlowerRows(), []);
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

            {/* Pond */}
            <mesh position={[15, 0, 15]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <circleGeometry args={[4, 64]} />
                <meshStandardMaterial color="#4DA6FF" transparent opacity={0.5} roughness={0.2} metalness={0.1} />
            </mesh>

            {/* Lotus Flowers */}
            {lotusFlowers.map((flower, idx) => (
                <Flower key={`lotus-${idx}`} position={flower.position} modelPath={flower.modelPath} targetHeight={flower.scale} />
            ))}

            {/* Other Flowers */}
            {flowers.map((flower, idx) => (
                <Flower key={`flower-${idx}`} position={flower.position} modelPath={flower.modelPath} targetHeight={flower.scale} />
            ))}

            {/* Sky & Environment */}
            <Sky sunPosition={[100, 20, 100]} />
            <Environment preset="sunset" />

            {/* First-Person Navigation */}
            <PointerLockControls />
        </>
    );
};

export default GardenScene;
