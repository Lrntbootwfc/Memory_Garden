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
            {/* Enhanced background plane with better visibility */}
            <Plane args={[4.2, 2.7]}>
                <animated.meshStandardMaterial
                    color="#0077ff"
                    opacity={opacity.to(o => o * 0.4)} // Increased opacity for better visibility
                    transparent={true}
                    side={THREE.DoubleSide}
                    emissive="#00aaff"
                    emissiveIntensity={0.5} // Increased emissive intensity
                />
            </Plane>

            {/* Border frame for better definition */}
            <Plane args={[4.4, 2.9]} position={[0, 0, -0.001]}>
                <animated.meshBasicMaterial
                    color="#ffffff"
                    opacity={opacity.to(o => o * 0.8)}
                    transparent={true}
                    side={THREE.DoubleSide}
                />
            </Plane>

            {/* HTML content projected onto the plane */}
            <Html
                center
                transform
                position={[0, 0, 0.01]} // Slightly in front of the plane
                occlude={false} // Disable occlusion for better visibility
                className="hologram-content"
                onPointerDown={handleContentClick}
                style={{
                    pointerEvents: 'auto',
                    zIndex: 1000,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    borderRadius: '10px',
                    padding: '20px',
                    color: 'white',
                    maxWidth: '400px',
                    maxHeight: '300px',
                    overflow: 'auto'
                }}
            >
                <div className="memory-card">
                    <h3 style={{ color: '#00aaff', marginBottom: '10px' }}>{title}</h3>
                    <p style={{ marginBottom: '15px' }}>{description}</p>

                    {/* --- FIX: Render media using the corrected `fullMediaPath` --- */}
                    {fullMediaPath && (
                        <div className="media-container" style={{ marginBottom: '15px' }}>
                            {media_type === 'image' && <img src={fullMediaPath} alt={title} style={{ maxWidth: '100%', height: 'auto' }} />}
                            {media_type === 'video' && <video src={fullMediaPath} controls autoPlay loop muted style={{ maxWidth: '100%', height: 'auto' }} />}
                            {media_type === 'audio' && <audio src={fullMediaPath} controls autoPlay loop style={{ width: '100%' }} />}
                        </div>
                    )}

                    <button 
                        onClick={onClose} 
                        className="close-button"
                        style={{
                            backgroundColor: '#ff4444',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        Close
                    </button>
                </div>
            </Html>
        </animated.group>
    );
};

export default HologramScreen;