// src/components/GardenScene.jsx

import React, { useMemo, useRef, useEffect, useState } from "react";
import { PointerLockControls, OrbitControls, Environment, Sky, useTexture, Html } from "@react-three/drei";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import Flower from "./Flower";
import nipplejs from "nipplejs";
import { isMobile } from "react-device-detect";
import InfiniteGround from "./InfiniteGround";
import DisplayCard from "./DisplayCard";
import { createClusters } from "../utils/clusterUtils";
import Cluster from "./Cluster";
import GardenControls from "./GardenControls";
// NEW: Ab hum HologramScreen component import kar rahe hain.
import HologramScreen from "./HologramScreen";


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
const ROWS = 11;
const COLS = 10;
const SPACING_X = 3;
const SPACING_Z = 4;
const BLOOM_DISTANCE = 50;

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

function PlayerControls({ isLocked, setIsLocked}) {
    const { camera, gl } = useThree();
    const controlsRef = useRef();
    const velocity = useRef(new THREE.Vector3());
    const direction = new THREE.Vector3();
    const keys = useRef({});
    // const [isLocked, setIsLocked] = useState(false);

    useEffect(() => {
    
        if (!isLocked) {
            document.exitPointerLock();
        }
    }, [isLocked]); 
    
    useEffect(() => {
        const handleLockChange = () => {
            setIsLocked(document.pointerLockElement === gl.domElement);
        };
        document.addEventListener("pointerlockchange", handleLockChange);
        return () => document.removeEventListener("pointerlockchange", handleLockChange);
    }, [gl.domElement, setIsLocked]);


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
        // if (!controlsRef.current || !controlsRef.current.isLocked) return;
        // if (!isLocked) return;

        if (!controlsRef.current || !isLocked) {
            return;
        }
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
        velocity.current.copy(direction).multiplyScalar(speed * delta);
        controlsRef.current.moveRight(velocity.current.x);
        controlsRef.current.moveForward(velocity.current.z);
        // camera.position.y += velocity.current.y;

        
    });

    return  isLocked ? <PointerLockControls ref={controlsRef} args={[camera, gl.domElement]} />: <OrbitControls />;
}

const GardenScene = ({ grassTexturePath = "/textures/grass.jpeg" }) => {
    const { camera, scene } = useThree();
    const grassTexture = useTexture(grassTexturePath);
    grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(10, 10);
    const lotusFlowers = useMemo(() => generateLotusFlowers(), []);

    // NEW: Dummy data jismein memory information hai.
    const DUMMY_FLOWERS_DATA = useMemo(() => {
        const arr = [];
        let count = 0;
        for (let row = 0; row < ROWS; row++) {
            const model = flowerModels[row % flowerModels.length];
            for (let col = 0; col < COLS; col++) {
                const x = col * SPACING_X;
                const z = row * SPACING_Z;
                arr.push({
                    id: `row-${row}-${col}`,
                    position: [x, 0, -z],
                    modelPath: model.path,
                    scale: model.scale,
                    bloomed: count < 50,
                    date: `2025-08-${(row + 1).toString().padStart(2, '0')}`,
                    
                    memory: {
                        type: count % 2 === 0 ? 'image' : 'video',
                        source: count % 2 === 0 ? '/memories/test_image.jpg' : '/memories/test_video.mp4',
                    }
                });
                count++;
            }
        }
        return arr;
    }, []);

    //  Ab hum flowers array DUMMY_FLOWERS_DATA se bana rahe hain.
    const [flowers, setFlowers] = useState(DUMMY_FLOWERS_DATA);

    // selectedFlower state banaya hai, jo clicked flower ko track karega.
    const [selectedFlower, setSelectedFlower] = useState(null);
    const [isControlsLocked, setIsControlsLocked] = useState(true);

    // NEW: Yeh function flower click hone par chalta hai.
    const handleFlowerClick = (flower) => {
        console.log("Flower clicked:", flower);
        setSelectedFlower(flower);
        setIsControlsLocked(false);
    };

    // NEW: Hologram ko band karne ke liye function.
    const handleHologramClose = () => {
        setSelectedFlower(null);
    };

    const [scaled, setScaled] = useState({});

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

    useEffect(() => {
        scene.fog = new THREE.FogExp2("#87CEEB", 0.0008);
    }, [scene]);

    // CHANGED: Clusters DUMMY_FLOWERS_DATA se banaye ja rahe hain.
    const clusters = useMemo(() => createClusters(DUMMY_FLOWERS_DATA, "date"), []);

    console.log("Clusters array created with", clusters.length, "clusters.");
    console.log("Clusters data:", clusters);

    return (
        <>
            <ambientLight intensity={0.6} />
            <directionalLight position={[20, 40, 20]} intensity={1.2} castShadow />

            <InfiniteGround grassTexture={grassTexture} />

            <mesh position={[15, 0, 15]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <circleGeometry args={[4, 64]} />
                <meshStandardMaterial color="#4DA6FF" transparent opacity={0.5} roughness={0.2} metalness={0.1} />
            </mesh>

            {lotusFlowers.map((flower, idx) => (
                <Flower
                    key={`lotus-${idx}`}
                    position={flower.position}
                    modelPath={flower.modelPath}
                    targetHeight={flower.scale}
                    autoBloom={true}
                />
            ))}

            {clusters.map((cluster, idx) => (
                <React.Fragment key={`cluster-${idx}`}>
                    {cluster.flowers.map((flower, fIdx) => (
                        <Flower
                            key={`flower-${idx}-${fIdx}`}
                            position={flower.position}
                            modelPath={flower.modelPath}
                            targetHeight={flower.scale}
                            autoBloom={flower.bloomed}
                            // NEW: onClick prop pass kar rahe hain.
                            // onFlowerClick function ke andar flower data bheja ja raha hai.
                            onClick={() => handleFlowerClick(flower)}
                            hasMemory={!!flower.memory}
                        />
                    ))}

                    <DisplayCard
                        clusterPosition={cluster.centerPosition}
                        clusterSize={cluster.size}
                        date={cluster.date}
                        emotion={cluster.emotion}
                        gradientColors={["#f5e6c8", "#d9b382"]}
                    />
                </React.Fragment>
            ))}

            {/* NEW: Agar koi flower selected hai, to HologramScreen render karo */}
            {selectedFlower && (
                <HologramScreen
                    position={selectedFlower.position}
                    memoryData={selectedFlower.memory}
                    onClose={handleHologramClose}
                />
            )}

            <Sky sunPosition={[100, 20, 100]} />
            <Environment preset="sunset" />
            <PlayerControls 
            isLocked={isControlsLocked} 
            setIsLocked={setIsControlsLocked} 
            />
        </>
    );
};

export default GardenScene;