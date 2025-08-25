import React, { useRef } from 'react';
import { Html, Plane } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

// --- FIX: Construct absolute media URL ---
const API_ROOT = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api").replace("/api", "");

const HologramScreen = ({ position, memoryData, onClose }) => {
    const { camera } = useThree();
    const groupRef = useRef();
    const { media_path, media_type, title, description } = memoryData;

    // --- FIX: Create a full, absolute URL for the media content ---
    const fullMediaPath = media_path ? `${API_ROOT}${media_path}` : null;

    const { opacity, scale } = useSpring({
        from: { opacity: 0, scale: 0.5 },
        to: { opacity: 1, scale: 1 },
        config: { tension: 200, friction: 20 },
    });

    // --- FIX: Make the hologram always face the camera ---
    useFrame(() => {
        if (groupRef.current) {
            groupRef.current.lookAt(camera.position);
        }
    });

    const handleContentClick = (e) => e.stopPropagation();

    return (
        <animated.group ref={groupRef} position={position} scale={scale}>
            {/* Transparent background plane */}
            <Plane args={[4.2, 2.7]}>
                <animated.meshStandardMaterial
                    color="#0077ff"
                    opacity={opacity.to(o => o * 0.25)} // Make background more subtle
                    transparent={true}
                    side={THREE.DoubleSide}
                    emissive="#00aaff"
                    emissiveIntensity={0.3}
                />
            </Plane>

            {/* HTML content projected onto the plane */}
            <Html
                center
                transform
                position={[0, 0, 0.01]} // Slightly in front of the plane
                occlude
                className="hologram-content"
                onPointerDown={handleContentClick}
            >
                <div className="memory-card">
                    <h3>{title}</h3>
                    <p>{description}</p>

                    {/* --- FIX: Render media using the corrected `fullMediaPath` --- */}
                    {fullMediaPath && (
                        <div className="media-container">
                            {media_type === 'image' && <img src={fullMediaPath} alt={title} />}
                            {media_type === 'video' && <video src={fullMediaPath} controls autoPlay loop muted />}
                            {media_type === 'audio' && <audio src={fullMediaPath} controls autoPlay loop />}
                        </div>
                    )}

                    <button onClick={onClose} className="close-button">Close</button>
                </div>
            </Html>
        </animated.group>
    );
};

export default HologramScreen;