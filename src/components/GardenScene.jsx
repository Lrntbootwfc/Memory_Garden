// src/components/GardenScene.jsx
import React from "react";
import { Environment, OrbitControls } from "@react-three/drei";
import Flower from "./Flower";
import CameraController from "./CameraController";

// Random flower placement for a natural garden
const generateFlowers = (count = 20) => {
    return Array.from({ length: count }, () => ({
        position: [
            (Math.random() - 0.5) * 20, // x spread
            0,
            (Math.random() - 0.5) * 20, // z spread
        ],
        color: ["red", "yellow", "blue", "pink", "orange", "purple", "white"][
            Math.floor(Math.random() * 7)
        ],
    }));
};

const flowerData = generateFlowers(30);

const GardenScene = () => {
    return (
        <>
            <ambientLight intensity={0.6} />
            <directionalLight position={[8, 15, 8]} intensity={1.2} castShadow />

            {/* Flowers */}
            {flowerData.map((flower, index) => (
                <Flower
                    key={index}
                    position={flower.position}
                    color={flower.color}
                />
            ))}

            {/* Grass Ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.75, 0]} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color="#228B22" /> {/* forest green grass */}
            </mesh>

            {/* Controls + Environment */}
            <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
            <CameraController />
            <Environment preset="sunset" />
        </>
    );
};

export default GardenScene;