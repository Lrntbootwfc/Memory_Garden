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

function PlayerControls({ isLocked, setIsLocked }) {
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

    return isLocked ? <PointerLockControls ref={controlsRef} args={[camera, gl.domElement]} /> : <OrbitControls />;
}

const params = new URLSearchParams(window.location.search);
const API_BASE = params.get("api_base") || window.memoryscape_api_base || "http://127.0.0.1:8000/api";
const API_ENDPOINT = `${API_BASE}/memories`;
const PARAM_USER_ID = params.get("user_id");
const RUNTIME_USER_ID = window.memoryscape_user_id;
const FALLBACK_USER_ID = 2; // optional

const GardenScene = ({ grassTexturePath = "/textures/grass.jpeg", isControlsLocked, setIsControlsLocked }) => {
    const [flowers, setFlowers] = useState([]);
    const [loading, setLoading] = useState(true);

    const { camera, scene } = useThree();
    const grassTexture = useTexture("/textures/grass.jpeg");
    grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(10, 10);
    const lotusFlowers = useMemo(() => generateLotusFlowers(), []);

    useEffect(() => {
        const fetchFlowers = async () => {
            try {
                const userId = PARAM_USER_ID || RUNTIME_USER_ID || FALLBACK_USER_ID;
                if (!userId) {
                    setLoading(false);
                    return;
                }
                const response = await fetch(`${API_ENDPOINT}?user_id=${userId}`);
                if (!response.ok) throw new Error("Network response was not ok");
                const data = await response.json();
                setFlowers(data);
            } catch (error) {
                console.error("Failed to fetch flowers:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFlowers();
    }, []); // Empty dependency array means this runs only once on mount

    const clusters = useMemo(() => createClusters(flowers, "date"), [flowers]);
    const [selectedFlower, setSelectedFlower] = useState(null);

    const handleFlowerClick = (flower) => {
        console.log("Flower clicked:", flower);
        console.log("Passing this to Hologram:", flower.memory);
        setSelectedFlower(flower);
        setIsControlsLocked(false);
    };

    const handleHologramClose = () => {
        setSelectedFlower(null);
    };

    useFrame(() => {

    });

    useEffect(() => {
        scene.fog = new THREE.FogExp2("#87CEEB", 0.0008);
    }, [scene]);

    const getFlowerModelPath = (emotion) => {
        const modelIndex = emotion ? (emotion.length % flowerModels.length) : 0;
        return flowerModels[modelIndex].path;
    };

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
                    hasMemory={false}
                />
            ))}

            {loading ? (
                <Html center>
                    <div style={{ color: 'white' }}>Loading memories...</div>
                </Html>
            ) : (
                clusters.map((cluster, idx) => (
                    <React.Fragment key={`cluster-${idx}`}>
                        {cluster.flowers.map((flower, fIdx) => (
                            <Flower
                                key={`flower-${idx}-${fIdx}`}
                                // NEW: position ko seedhe database se use karo
                                position={flower.position}
                                // NEW: modelPath ko seedhe database se use karo
                                // modelPath={flowerModels[fIdx % flowerModels.length].path}
                                modelPath={getFlowerModelPath(flower.emotion)}
                                // NEW: targetHeight ko seedhe database se use karo
                                targetHeight={1.5}
                                // autoBloom={flower.bloomed}
                                autoBloom={true}
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
                ))
            )}

            {selectedFlower &&  selectedFlower.media_path &&(
                <HologramScreen
                    position={selectedFlower.position}
                    memoryData={selectedFlower.memory}
        //             memoryData={{ 
        //                 type: selectedFlower.media_type, 
        //                 source: selectedFlower.media_path 
        // }}


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