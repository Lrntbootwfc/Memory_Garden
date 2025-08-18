// src/components/GardenScene.jsx
import React from "react";
import { Environment, OrbitControls } from "@react-three/drei";
import Flower from "./Flower";
import CameraController from "./CameraController";

// Flower models
const flowerModels = [
    "/models/alien_flower.glb",
    "/models/blue_flower_animated.glb",
    "/models/calendula_flower.glb",
    "/models/flower (1).glb",
    "/models/flower.glb",
    "/models/lotus_flower_by_geometry_nodes.glb",
    "/models/margarita_flower.glb",
    "/models/orchid_flower.glb",
    "/models/sunflower.glb",
    "/models/tulip_flower.glb",
    "/models/white_flower.glb",
];

// Grouped flower placement
const generateFlowerClusters = () => {
    const clusters = [];
    let zOffset = -8; // row spacing

    flowerModels.forEach((modelPath, idx) => {
        const rowLength = 3 + Math.floor(Math.random() * 3); // 3–5 flowers per row
        for (let i = 0; i < rowLength; i++) {
            const x = -5 + i * 3; // columns spaced by 3 units
            clusters.push({
                position: [x, 0, zOffset],
                modelPath,
                scale: 1.2 + Math.random() * 0.3,
            });
        }
        zOffset += 3; // move next row further
    });

    return clusters;
};

const flowerData = generateFlowerClusters();

const GardenScene = () => {
    return (
        <>
            <ambientLight intensity={0.6} />
            <directionalLight position={[8, 15, 8]} intensity={1.2} castShadow />

            {/* Lotus pond */}
            <group position={[8, 0, 0]}>
                <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                    <circleGeometry args={[4, 64]} />
                    <meshStandardMaterial color="#4DA6FF" transparent opacity={0.7} />
                </mesh>
                <Flower
                    modelPath="/models/lotus_flower_by_geometry_nodes.glb"
                    position={[0, 0, 0]}
                    scale={0.8} // smaller than other flowers
                />
            </group>

            {/* Clustered flowers */}
            {flowerData.map((flower, idx) => (
                <Flower
                    key={idx}
                    position={flower.position}
                    modelPath={flower.modelPath}
                    scale={flower.scale}
                />
            ))}

            {/* Grass Ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.75, 0]} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color="#228B22" />
            </mesh>

            {/* Controls & Environment */}
            <OrbitControls enablePan enableZoom enableRotate />
            <CameraController />
            <Environment preset="sunset" />
        </>
    );
};

export default GardenScene;
