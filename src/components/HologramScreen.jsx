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
    const memory = memoryData.memory || memoryData;
    const { media_path, media_type, title, description } = memory;

    // --- FIX: Create a full, absolute URL for the media cont
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
            {/* Main hologram plane - translucent with holographic effect */}
            <Plane args={[4.2, 2.7]}>
                <animated.meshStandardMaterial
                    color="#00ffff"
                    opacity={opacity.to(o => o * 0.15)} // Much more translucent
                    transparent={true}
                    side={THREE.DoubleSide}
                    emissive="#00aaff"
                    emissiveIntensity={0.3}
                    roughness={0.1}
                    metalness={0.8}
                />
            </Plane>

            {/* Holographic scan lines effect */}
            <Plane args={[4.2, 0.05]} position={[0, 1, 0.002]}>
                <animated.meshBasicMaterial
                    color="#00ffff"
                    opacity={opacity.to(o => o * 0.6)}
                    transparent={true}
                />
            </Plane>
            <Plane args={[4.2, 0.05]} position={[0, 0, 0.002]}>
                <animated.meshBasicMaterial
                    color="#00ffff"
                    opacity={opacity.to(o => o * 0.4)}
                    transparent={true}
                />
            </Plane>
            <Plane args={[4.2, 0.05]} position={[0, -1, 0.002]}>
                <animated.meshBasicMaterial
                    color="#00ffff"
                    opacity={opacity.to(o => o * 0.6)}
                    transparent={true}
                />
            </Plane>

            {/* Subtle border glow effect */}
            <Plane args={[4.4, 2.9]} position={[0, 0, -0.001]}>
                <animated.meshBasicMaterial
                    color="#00aaff"
                    opacity={opacity.to(o => o * 0.2)}
                    transparent={true}
                    side={THREE.DoubleSide}
                />
            </Plane>

            {/* Corner markers for holographic authenticity */}
            <Plane args={[0.3, 0.05]} position={[-2, 1.3, 0.003]}>
                <animated.meshBasicMaterial
                    color="#ffffff"
                    opacity={opacity.to(o => o * 0.8)}
                    transparent={true}
                />
            </Plane>
            <Plane args={[0.05, 0.3]} position={[-2, 1.3, 0.003]}>
                <animated.meshBasicMaterial
                    color="#ffffff"
                    opacity={opacity.to(o => o * 0.8)}
                    transparent={true}
                />
            </Plane>
            <Plane args={[0.3, 0.05]} position={[2, 1.3, 0.003]}>
                <animated.meshBasicMaterial
                    color="#ffffff"
                    opacity={opacity.to(o => o * 0.8)}
                    transparent={true}
                />
            </Plane>
            <Plane args={[0.05, 0.3]} position={[2, 1.3, 0.003]}>
                <animated.meshBasicMaterial
                    color="#ffffff"
                    opacity={opacity.to(o => o * 0.8)}
                    transparent={true}
                />
            </Plane>

            {/* HTML content with holographic styling */}
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
                    backgroundColor: 'transparent',
                    padding: '0',
                    margin: '0',
                    width: '400px',
                    height: '300px',
                    position: 'relative'
                }}
            >
                <div className="memory-card" style={{ 
                    width: '100%', 
                    height: '100%', 
                    position: 'relative',
                    padding: '0',
                    margin: '0'
                }}>
                    {/* --- FIX: Render media using the corrected `fullMediaPath` --- */}
                    {fullMediaPath && (
                        <div className="media-container" style={{ 
                            width: '100%',
                            height: '100%',
                            position: 'relative'
                        }}>
                            {media_type === 'image' && <img 
                                src={fullMediaPath} 
                                alt="" 
                                style={{ 
                                    width: '100%', 
                                    height: '100%',
                                    objectFit: 'contain',
                                    display: 'block'
                                }} 
                            />}
                            {media_type === 'video' && <video 
                                src={fullMediaPath} 
                                controls 
                                autoPlay 
                                loop 
                                muted 
                                style={{ 
                                    width: '100%', 
                                    height: '100%',
                                    objectFit: 'cover'
                                }} 
                            />}
                            {media_type === 'audio' && <audio 
                                src={fullMediaPath} 
                                controls 
                                autoPlay 
                                loop 
                                style={{ 
                                    width: '100%',
                                    height: '50px',
                                    position: 'absolute',
                                    top: '50%',
                                    transform: 'translateY(-50%)'
                                }} 
                            />}
                        </div>
                    )}

                    <button 
                        onClick={onClose} 
                        className="close-button"
                        style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            color: '#ffffff',
                            border: 'none',
                            padding: '8px 12px',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            zIndex: 1000,
                            transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                        }}
                    >
                        ×
                    </button>
                </div>
            </Html>
        </animated.group>
    );
};

export default HologramScreen;