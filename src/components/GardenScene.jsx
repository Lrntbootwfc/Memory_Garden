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
import HologramScreen from "./HologramScreen";
import PlayerControls from "./PlayerControls";
import { useAppStore } from '../state/store';
import '../App.css';

// 🌸 Flower models
// 🌸 Flower models - UPDATED WITH OPTIMIZED PATHS
const flowerModelData = {
    "alien_flower_optimized.glb": { path: "/models/alien_flower_optimized.glb", scale: 0.5 },
    "blue_flower_optimized.glb": { path: "/models/blue_flower_optimized.glb", scale: 0.5 },
    "calendula_flower.glb": { path: "/models/calendula_flower.glb", scale: 1.5 },
    "flower_original_optimized.glb": { path: "/models/flower_original_optimized.glb", scale: 1.5 },
    "flower_optimized.glb": { path: "/models/flower_optimized.glb", scale: 1.5 },
    "white_flower_optimized.glb": { path: "/models/white_flower_optimized.glb", scale: 0.5 },
    "lotus_flower_by_geometry_nodes.glb": { path: "/models/lotus_flower_by_geometry_nodes.glb", scale: 0.5 },
    "sunflower.glb": { path: "/models/sunflower.glb", scale: 0.005 },
    "rose.glb": { path: "/models/rose.glb", scale: 1.0 },

    // Add any other models you have here
};
const defaultModel = { path: "/models/flower_optimized.glb", scale: 1.5 };

const lotusModel = "/models/lotus_flower_by_geometry_nodes.glb";
const gardenSize = 50;
const spacing = 2.0;

const ROWS = 11;
const COLS = 10;
const SPACING_X = 5;
const SPACING_Z = 6;
const BLOOM_DISTANCE = 50;

const keyForCell = (x, z) => `${x}|${z}`;
// src/components/GardenScene.jsx

// src/components/GardenScene.jsx

const generateLotusFlowers = (lotusMemories) => {
    // This function now receives the already-filtered lotus memories
    if (!lotusMemories || lotusMemories.length === 0) {
        return [];
    }

    const positionedFlowers = [];
    const pondCenter = [15, 0, 15];
    const pondRadius = 4;

    lotusMemories.forEach((memory, i) => {
        const angle = (i / lotusMemories.length) * Math.PI * 2;
        const radius = pondRadius * (0.4 + Math.random() * 0.6);
        const x = pondCenter[0] + radius * Math.cos(angle);
        const z = pondCenter[2] + radius * Math.sin(angle);

        // Use the model path directly from the memory data
        const modelInfo = flowerModelData[memory.model_path] || defaultModel;

        positionedFlowers.push({
            // Nest the original memory data inside a 'memory' property
            // This ensures its structure matches the other flowers
            memory: memory,
            id: memory.id,
            position: [x, 0, z],
            modelPath: modelInfo.path,
            scale: modelInfo.scale,
        });
    });

    return positionedFlowers;
};
const params = new URLSearchParams(window.location.search);
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
const API_ENDPOINT = `${API_BASE}/memories`;
const PARAM_USER_ID = params.get("user_id");
const RUNTIME_USER_ID = window.memoryscape_user_id;
const FALLBACK_USER_ID = 2;

const GardenScene = ({ grassTexturePath = "/textures/grass.jpeg", isControlsLocked, setIsControlsLocked }) => {
    const [flowers, setFlowers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lotusFlowers, setLotusFlowers] = useState([]);
    const { camera, scene, raycaster } = useThree();
    const grassTexture = useTexture("/textures/grass.jpeg");
    grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(10, 10);
    // const lotusFlowers = useMemo(() => generateLotusFlowers(), []);

    const setClusters = useAppStore((state) => state.setClusters);
    const [selectedFlower, setSelectedFlower] = useState(null);
    const [hologramTransform, setHologramTransform] = useState({ position: null, rotation: null });
    

    const playerControlsRef = useRef();
    const [playerControlsActive, setPlayerControlsActive] = useState(true);
    useEffect(() => {
        const fetchFlowers = async () => {
            try {
                const userId = PARAM_USER_ID || RUNTIME_USER_ID || FALLBACK_USER_ID;
                if (!userId) { setLoading(false); return; }
                const response = await fetch(`${API_ENDPOINT}?user_id=${userId}`);
                if (!response.ok) throw new Error("Network response was not ok");
                const rawMemories = await response.json();
                const memoriesWithLotus = [];
                const memoriesWithoutLotus = [];

                rawMemories.forEach(memory => {
                    if (memory.model_path === "lotus_flower_by_geometry_nodes.glb") {
                        memoriesWithLotus.push(memory);
                    } else {
                        memoriesWithoutLotus.push(memory);
                    }
                });



                const formattedFlowers = memoriesWithoutLotus.map(memory => ({
                    id: memory.id,
                    position: [0, 0, 0], // Add the required 'position' property. It gets overwritten by clustering later.
                    memory: memory,      // Nest the original memory data inside a 'memory' property.
                    date: memory.created_at.split("T")[0],
                    emotion: memory.emotion,
                }));

                const positionedLotus = generateLotusFlowers(memoriesWithLotus);

                setFlowers(formattedFlowers);
                setLotusFlowers(positionedLotus);
            } catch (error) {
                console.error("Failed to fetch flowers:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFlowers();
    }, []);

    // const clusters = useMemo(() => createClusters(flowers, "date"), [flowers]);
    const clusters = useMemo(() => {
        const rawClusters = createClusters(flowers, "date");
        const positionedClusters = [];
        const occupiedPositions = new Set();
        let col = 0;
        let row = 0;

        rawClusters.forEach(cluster => {
            let placed = false;
            while (!placed) {
                const newX = (col * SPACING_X) - (COLS * SPACING_X / 2);
                const newZ = (row * SPACING_Z) - (ROWS * SPACING_Z / 2);
                const positionKey = keyForCell(col, row);

                if (!occupiedPositions.has(positionKey)) {
                    cluster.centerPosition = [newX, 0, newZ];
                    occupiedPositions.add(positionKey);
                    const flowerCount = cluster.flowers.length;
                    const flowerSpreadRadius = 2.0; // Defines the radius of the circle

                    cluster.flowers.forEach((flower, index) => {
                        // If there's only one flower, place it at the center
                        if (flowerCount === 1) {
                            flower.position = cluster.centerPosition;
                        } else {
                            const angle = (index / flowerCount) * Math.PI * 2;
                            const x = cluster.centerPosition[0] + flowerSpreadRadius * Math.cos(angle);
                            const z = cluster.centerPosition[2] + flowerSpreadRadius * Math.sin(angle);
                            // Overwrite the original position to arrange flowers in a circle
                            flower.position = [x, 0, z];
                        }
                    });


                    positionedClusters.push(cluster);
                    placed = true;
                }

                // Move to the next grid cell
                col++;
                if (col >= COLS) {
                    col = 0;
                    row++;
                }

                if (row >= ROWS) {
                    console.warn("Not enough grid space for all clusters.");
                    break;
                }
            }
        });
        return positionedClusters;
    }, [flowers]);

    useEffect(() => {
        // This check prevents errors if the store is not ready
        if (typeof setClusters === 'function') {
            setClusters(clusters);
        }
    }, [clusters, setClusters]);

    const handleFlowerClick = (e,flower) => {
        e.stopPropagation();
        if (!selectedFlower && flower && flower.memory) {
            setSelectedFlower(flower);
            const hologramDistance = 3; // How far from the camera it should appear
            const forwardVector = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
            const position = camera.position.clone().add(forwardVector.multiplyScalar(hologramDistance));
            
            setHologramTransform({ position });
            
            setPlayerControlsActive(false);
            if (playerControlsRef.current?.isLocked) {
                playerControlsRef.current.unlock();
            }
        }
    };


    const handleHologramClose = () => {
        setSelectedFlower(null); // Clear the selected flower
        setHologramTransform({ position: null });
        setPlayerControlsActive(true); // Re-enable movement
};


    useEffect(() => {
        scene.fog = new THREE.FogExp2("#87CEEB", 0.0008);
    }, [scene]);

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
                    onClick={() => handleFlowerClick(flower)}
                    hasMemory={true}
                    userData={{ isLotus: true, flowerData: flower }}
                />
            ))}

            {loading ? (
                <Html center>
                    <div style={{ color: 'white' }}>Loading memories...</div>
                </Html>
            ) : (
                clusters.map((cluster, idx) => (
                    <React.Fragment key={`cluster-${idx}`}>
                        {cluster.flowers.map((flower, fIdx) => {
                            // This function now returns an object like { path: "...", scale: 0.2 }
                            // const flowerModel = getFlowerModelPath(flower.emotion); 
                            const modelInfo = flowerModelData[flower.memory.model_path] || defaultModel;

                            return (
                                <Flower
                                    key={`flower-${idx}-${fIdx}`}
                                    position={flower.position}
                                    // CORRECTED: Pass the .path property (a string)
                                    modelPath={modelInfo.path}
                                    // CORRECTED: Pass the .scale property (a number)
                                    targetHeight={modelInfo.scale}
                                    autoBloom={true}
                                    onClick={() => handleFlowerClick(flower)}
                                    hasMemory={!!flower.memory}
                                    userData={{ isFlower: true, flowerData: flower }}
                                />
                            );
                        })}




                        <DisplayCard
                            pointerEvents="none"
                            clusterPosition={cluster.centerPosition}
                            clusterSize={cluster.size}
                            date={cluster.date}
                            emotion={cluster.emotion}
                            gradientColors={["#f5e6c8", "#d9b382"]}
                        />
                    </React.Fragment>
                ))
            )}

            {selectedFlower && hologramTransform.position && (
                <HologramScreen
                    position={hologramTransform.position}
                    memoryData={selectedFlower.memory}
                    onClose={handleHologramClose}
                />
            )}
            <Sky sunPosition={[100, 20, 100]} />
            <Environment preset="sunset" />
            <PlayerControls ref={playerControlsRef} active={playerControlsActive} />
        </>
    );
};

export default GardenScene;