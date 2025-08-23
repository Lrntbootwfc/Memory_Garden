# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.






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
    "/models/white_flower.glb",
];

const lotusModel = "/models/lotus_flower_by_geometry_nodes.glb";

const gardenSize = 50; // smaller garden so flowers stay in camera view

// Generate clustered flowers in rows and lines
const generateFlowerClusters = () => {
    const flowers = [];
    const spacing = 2.5;
    const maxPerRow = Math.floor((gardenSize * 0.75) / spacing);

    flowerModels.forEach((modelPath) => {
        for (let i = 0; i < maxPerRow; i++) {
            for (let j = 0; j < maxPerRow; j++) {
                const x = -gardenSize / 2 + i * spacing + Math.random() * 0.3;
                const z = -gardenSize / 2 + j * spacing + Math.random() * 0.3;
                flowers.push({
                    position: [x, 0, z],
                    modelPath,
                    scale: 1.5, // fixed normal flower height
                });
            }
        }
    });

    return flowers;
};

// Lotus flowers in pond
const generateLotusFlowers = () => {
    const lotusFlowers = [];
    const pondCenter = [15, 0, 15]; // corner pond visible in camera
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
            scale: 0.6, // smaller than other flowers
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






-           8/18/2025 12:34 PM        3102448 alien_flower.glb
-a---           8/18/2025 12:36 PM        3168232 blue_flower_animated.glb
-a---           8/18/2025 12:36 PM          34588 calendula_flower.glb  orange petals yellow central part

-a---           8/18/2025 12:36 PM       34309020 flower (1).glb
-a---           8/18/2025 12:30 PM        1636608 flower.glb
-a---           8/18/2025 12:35 PM       29606796 lotus_flower_by_geometry_nodes.glb
-a---           8/18/2025 12:34 PM          21224 margarita_flower.glb single white flower with yellow central part 
-a---           8/18/2025 12:27 PM       55756692 orchid_flower.glb
-a---           8/18/2025 12:30 PM       23867532 sunflower.glb
-a---           8/18/2025 12:38 PM        7800552 tulip_flower.glb
-a---           8/18/2025 12:33 PM        8708708 white_flower.glb   that bada wala flower 
lk 







