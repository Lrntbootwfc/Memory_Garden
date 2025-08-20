// src/components/GardenScene.jsx
import React, { useMemo, useRef, useEffect, useState } from "react";
import { PointerLockControls, OrbitControls, Environment, Sky, useTexture, Html } from "@react-three/drei";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import Flower from "./Flower";
import nipplejs from "nipplejs";
import { isMobile } from "react-device-detect";
import InfiniteGround from "./InfiniteGround";

import GardenControls from "./GardenControls";

// 🌸 Flower models
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
const spacing = 2.0;

// 🌸 NEW: Grid settings for flower rows
const ROWS = 11;        // generate this many rows at once
const COLS = 10;        // flowers per row
const SPACING_X = 3;    // horizontal spacing
const SPACING_Z = 4;    // row spacing
const BLOOM_DISTANCE = 50; // proximity bloom distance

const keyForCell = (x, z) => `${x}|${z}`;
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

function PlayerControls({ lockPointer }) {
    const { camera, gl } = useThree();
    // const [lockPointer, setLockPointer] = useState(false);
    const controlsRef = useRef();
    const velocity = useRef(new THREE.Vector3());
    const direction = new THREE.Vector3();
    const keys = useRef({});
    const [isLocked, setIsLocked] = useState(false);

    useEffect(() => {
        const handleLockChange = () => {
            setIsLocked(document.pointerLockElement === gl.domElement);
        };
        document.addEventListener("pointerlockchange", handleLockChange);
        return () => document.removeEventListener("pointerlockchange", handleLockChange);
    }, [gl.domElement]);


    useEffect(() => {
        const handleKeyDown = (e) => (keys.current[e.code] = true);
        const handleKeyUp = (e) => (keys.current[e.code] = false);

        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("keyup", handleKeyUp);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    const joystickData = useRef({ x: 0, y: 0 });
    useEffect(() => {
        if (!isMobile) return;

        const joystickZone = document.createElement("div");
        joystickZone.style.position = "absolute";
        joystickZone.style.bottom = "80px";
        joystickZone.style.left = "50px";
        joystickZone.style.width = "120px";
        joystickZone.style.height = "120px";
        joystickZone.style.zIndex = "1000";
        document.body.appendChild(joystickZone);

        const joystick = nipplejs.create({
            zone: joystickZone,
            mode: "static",
            position: { left: "60px", bottom: "60px" },
            color: "blue",
            size: 100,
        });

        joystick.on("move", (_, data) => {
            const rad = data.angle.radian;
            joystickData.current.x = Math.cos(rad) * (data.force || 0);
            joystickData.current.y = Math.sin(rad) * (data.force || 0);
        });

        joystick.on("end", () => {
            joystickData.current.x = 0;
            joystickData.current.y = 0;
        });

        return () => joystickZone.remove();
    }, []);

    


    useFrame((_, delta) => {
        if (!controlsRef.current || !controlsRef.current.isLocked) return;

        direction.set(0, 0, 0);
        if (!isMobile) {
            if (keys.current["KeyW"]) direction.z -= 1;
            if (keys.current["KeyS"]) direction.z += 1;
            if (keys.current["KeyA"]) direction.x -= 1;
            if (keys.current["KeyD"]) direction.x += 1;
            if (keys.current["Space"]) direction.y += 1;
            if (keys.current["KeyQ"]) direction.y -= 1;
        } else {
            direction.x = joystickData.current.x;
            direction.z = -joystickData.current.y;
        }
        direction.normalize();

        const speed = 10;
        // velocity.current.x = direction.x * speed * delta;
        // velocity.current.z = direction.z * speed * delta;
        
        controlsRef.current.moveRight(velocity.current.x);
        controlsRef.current.moveForward(velocity.current.z);
        camera.position.y += velocity.current.y;

        velocity.current.copy(direction).multiplyScalar(speed * delta);
        // camera.position.add(velocity.current);
    });
    // return <OrbitControls enablePan enableZoom enableRotate />;

    return <PointerLockControls ref={controlsRef} args={[camera, gl.domElement]} />;
}

const GardenScene = ({ grassTexturePath = "/textures/grass.jpeg" }) => {
    const { camera, scene } = useThree();
    const grassTexture = useTexture(grassTexturePath);
    grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(10, 10);

    const lotusFlowers = useMemo(() => generateLotusFlowers(), []);

    // 🌸 NEW: generate grid-based flowers
    const [flowers, setFlowers] = useState(() => {
        const arr = [];
        let count = 0;
        for (let row = 0; row < ROWS; row++) {
            const model = flowerModels[row % flowerModels.length]; // one type per row
            for (let col = 0; col < COLS; col++) {
                const x = col * SPACING_X;
                const z = row * SPACING_Z;
                arr.push({
                    id: `row-${row}-${col}`,
                    position: [x, 0, -z],
                    modelPath: model.path,
                    scale: model.scale,
                    bloomed: count < 50, // first 50 are pre-bloomed
                });
                count++;
            }
        }
        return arr;
    });
    const [scaled, setScaled] = useState({});
    // 🌸 NEW: Proximity-based bloom for flowers
    useFrame(() => {
        const newScaled = {};
        flowers.forEach((flower, idx) => {
            if (!flower.bloomed) {
                const dx = flower.position[0] - camera.position.x;
                const dz = flower.position[2] - camera.position.z;
                const dist = Math.sqrt(dx * dx + dz * dz);
                if (dist < BLOOM_DISTANCE) {
                    newScaled[flower.id] = THREE.MathUtils.lerp(
                        0.3,
                        flower.baseScale,
                        1 - dist / BLOOM_DISTANCE
                    );
                } else {
                    newScaled[flower.id] = 0.3;
                }
            }
        });
        setScaled(newScaled);
    });

    // 🌫️ Fog for horizon smoothing
    useEffect(() => {
        scene.fog = new THREE.FogExp2("#87CEEB", 0.0008);
    }, [scene]);

    return (
        <>
            <ambientLight intensity={0.6} />
            <directionalLight position={[20, 40, 20]} intensity={1.2} castShadow />

            {/* <InfiniteGround grassTexture={grassTexture} /> */}

            {/* Pond */}
            <mesh position={[15, 0, 15]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <circleGeometry args={[4, 64]} />
                <meshStandardMaterial color="#4DA6FF" transparent opacity={0.5} roughness={0.2} metalness={0.1} />
            </mesh>

            {/* Lotus Flowers */}
            {lotusFlowers.map((flower, idx) => (
                <Flower
                    key={`lotus-${idx}`}
                    position={flower.position}
                    modelPath={flower.modelPath}
                    targetHeight={flower.scale}
                    autoBloom={true}
                />
            ))}

            {/* Aligned Flower Rows */}
            {flowers.map((flower) => (
                <Flower
                    key={flower.id}
                    position={flower.position}
                    modelPath={flower.modelPath}
                    targetHeight={flower.scale}
                    autoBloom={flower.bloomed}
                />
            ))}

            <Sky sunPosition={[100, 20, 100]} />
            <Environment preset="sunset" />

            <PlayerControls />
            {/* <GardenControls /> */}
            {/* UI Overlays */}

        </>
    );
};

export default GardenScene;