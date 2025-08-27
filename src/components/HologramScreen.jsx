import React, { useRef, useState, useEffect } from 'react';
import { Html, Plane } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

// --- FIX: Construct absolute media URL ---
const API_ROOT = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api").replace("/api", "");

const HologramScreen = ({ position, memoryData, onClose }) => {
    const { camera } = useThree();
    const groupRef = useRef();
    const [contentDimensions, setContentDimensions] = useState({ width: 4, height: 3 });
    const memory = memoryData.memory || memoryData;
    const { media_path, media_type, title, description } = memory;

    // --- FIX: Create a full, absolute URL for the media content
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

    // Handle media load to get dimensions
    const handleMediaLoad = (e) => {
        if (media_type === 'image' || media_type === 'video') {
            const element = e.target;
            const aspectRatio = element.videoWidth || element.naturalWidth ? 
                (element.videoWidth || element.naturalWidth) / (element.videoHeight || element.naturalHeight) : 1;
            
            // Calculate optimal dimensions based on aspect ratio
            let width, height;
            if (aspectRatio > 1) {
                // Landscape
                width = Math.min(5, aspectRatio * 3);
                height = width / aspectRatio;
            } else {
                // Portrait or square
                height = 4;
                width = height * aspectRatio;
            }
            
            setContentDimensions({ width, height });
        }
    };

    const handleContentClick = (e) => e.stopPropagation();

    // Calculate HTML container size based on 3D dimensions
    const htmlWidth = contentDimensions.width * 100; // Convert to pixels
    const htmlHeight = contentDimensions.height * 100;

    return (
        <animated.group ref={groupRef} position={position} scale={scale}>
            {/* Main hologram plane - dynamically sized */}
            <Plane args={[contentDimensions.width + 0.2, contentDimensions.height + 0.2]}>
                <animated.meshStandardMaterial
                    color="#00ffff"
                    opacity={opacity.to(o => o * 0.15)}
                    transparent={true}
                    side={THREE.DoubleSide}
                    emissive="#00aaff"
                    emissiveIntensity={0.3}
                    roughness={0.1}
                    metalness={0.8}
                />
            </Plane>

            {/* Holographic scan lines effect - dynamically sized */}
            <Plane args={[contentDimensions.width + 0.2, 0.05]} position={[0, contentDimensions.height/3, 0.002]}>
                <animated.meshBasicMaterial
                    color="#00ffff"
                    opacity={opacity.to(o => o * 0.6)}
                    transparent={true}
                />
            </Plane>
            <Plane args={[contentDimensions.width + 0.2, 0.05]} position={[0, 0, 0.002]}>
                <animated.meshBasicMaterial
                    color="#00ffff"
                    opacity={opacity.to(o => o * 0.4)}
                    transparent={true}
                />
            </Plane>
            <Plane args={[contentDimensions.width + 0.2, 0.05]} position={[0, -contentDimensions.height/3, 0.002]}>
                <animated.meshBasicMaterial
                    color="#00ffff"
                    opacity={opacity.to(o => o * 0.6)}
                    transparent={true}
                />
            </Plane>

            {/* Subtle border glow effect - dynamically sized */}
            <Plane args={[contentDimensions.width + 0.4, contentDimensions.height + 0.4]} position={[0, 0, -0.001]}>
                <animated.meshBasicMaterial
                    color="#00aaff"
                    opacity={opacity.to(o => o * 0.2)}
                    transparent={true}
                    side={THREE.DoubleSide}
                />
            </Plane>

            {/* Corner markers - dynamically positioned */}
            {/* Top-left corner */}
            <Plane args={[0.3, 0.05]} position={[-contentDimensions.width/2, contentDimensions.height/2, 0.003]}>
                <animated.meshBasicMaterial
                    color="#ffffff"
                    opacity={opacity.to(o => o * 0.8)}
                    transparent={true}
                />
            </Plane>
            <Plane args={[0.05, 0.3]} position={[-contentDimensions.width/2, contentDimensions.height/2, 0.003]}>
                <animated.meshBasicMaterial
                    color="#ffffff"
                    opacity={opacity.to(o => o * 0.8)}
                    transparent={true}
                />
            </Plane>
            {/* Top-right corner */}
            <Plane args={[0.3, 0.05]} position={[contentDimensions.width/2, contentDimensions.height/2, 0.003]}>
                <animated.meshBasicMaterial
                    color="#ffffff"
                    opacity={opacity.to(o => o * 0.8)}
                    transparent={true}
                />
            </Plane>
            <Plane args={[0.05, 0.3]} position={[contentDimensions.width/2, contentDimensions.height/2, 0.003]}>
                <animated.meshBasicMaterial
                    color="#ffffff"
                    opacity={opacity.to(o => o * 0.8)}
                    transparent={true}
                />
            </Plane>
            {/* Bottom-left corner */}
            <Plane args={[0.3, 0.05]} position={[-contentDimensions.width/2, -contentDimensions.height/2, 0.003]}>
                <animated.meshBasicMaterial
                    color="#ffffff"
                    opacity={opacity.to(o => o * 0.8)}
                    transparent={true}
                />
            </Plane>
            <Plane args={[0.05, 0.3]} position={[-contentDimensions.width/2, -contentDimensions.height/2, 0.003]}>
                <animated.meshBasicMaterial
                    color="#ffffff"
                    opacity={opacity.to(o => o * 0.8)}
                    transparent={true}
                />
            </Plane>
            {/* Bottom-right corner */}
            <Plane args={[0.3, 0.05]} position={[contentDimensions.width/2, -contentDimensions.height/2, 0.003]}>
                <animated.meshBasicMaterial
                    color="#ffffff"
                    opacity={opacity.to(o => o * 0.8)}
                    transparent={true}
                />
            </Plane>
            <Plane args={[0.05, 0.3]} position={[contentDimensions.width/2, -contentDimensions.height/2, 0.003]}>
                <animated.meshBasicMaterial
                    color="#ffffff"
                    opacity={opacity.to(o => o * 0.8)}
                    transparent={true}
                />
            </Plane>

            {/* HTML content with dynamic sizing */}
            <Html
                center
                transform
                position={[0, 0, 0.01]}
                occlude={false}
                className="hologram-content"
                onPointerDown={handleContentClick}
                style={{
                    pointerEvents: 'auto',
                    zIndex: 1000,
                    backgroundColor: 'transparent',
                    padding: '0',
                    margin: '0',
                    width: `${htmlWidth}px`,
                    height: `${htmlHeight}px`,
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <div className="memory-card" style={{ 
                    width: '100%', 
                    height: '100%', 
                    position: 'relative',
                    padding: '0',
                    margin: '0',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {/* --- FIX: Render media with perfect fit --- */}
                    {fullMediaPath && (
                        <div className="media-container" style={{ 
                            width: '100%',
                            height: '100%',
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {media_type === 'image' && <img 
                                src={fullMediaPath} 
                                alt="" 
                                onLoad={handleMediaLoad}
                                style={{ 
                                    width: '100%', 
                                    height: '100%',
                                    objectFit: 'cover', // Changed from 'contain' to 'cover' to fill space
                                    display: 'block'
                                }} 
                            />}
                            {media_type === 'video' && <video 
                                src={fullMediaPath} 
                                controls 
                                autoPlay 
                                loop 
                                muted 
                                onLoadedMetadata={handleMediaLoad}
                                style={{ 
                                    width: '100%', 
                                    height: '100%',
                                    objectFit: 'cover' // Fill the entire space
                                }} 
                            />}
                            {media_type === 'audio' && (
                                <div style={{
                                    width: '100%',
                                    height: '100%',
                                    backgroundColor: 'rgba(0, 20, 40, 0.8)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#00ffff',
                                    fontFamily: 'monospace'
                                }}>
                                    <div style={{ fontSize: '24px', marginBottom: '20px' }}>🎵 AUDIO</div>
                                    <audio 
                                        src={fullMediaPath} 
                                        controls 
                                        autoPlay 
                                        loop 
                                        style={{ 
                                            width: '80%',
                                            height: '40px'
                                        }} 
                                    />
                                    {title && <div style={{ marginTop: '15px', fontSize: '12px', textAlign: 'center' }}>{title}</div>}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Text overlay for title/description if no media */}
                    {!fullMediaPath && (title || description) && (
                        <div style={{
                            width: '100%',
                            height: '100%',
                            backgroundColor: 'rgba(0, 20, 40, 0.9)',
                            color: '#00ffff',
                            fontFamily: 'monospace',
                            padding: '20px',
                            boxSizing: 'border-box',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            textAlign: 'center'
                        }}>
                            {title && <h3 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>{title}</h3>}
                            {description && <p style={{ margin: '0', fontSize: '14px', lineHeight: '1.4' }}>{description}</p>}
                        </div>
                    )}

                    {/* Close button */}
                    <button 
                        onClick={onClose} 
                        className="close-button"
                        style={{
                            position: 'absolute',
                            top: '5px',
                            right: '5px',
                            backgroundColor: 'rgba(255, 0, 0, 0.8)',
                            color: '#ffffff',
                            border: 'none',
                            padding: '4px 8px',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            zIndex: 1001,
                            transition: 'all 0.3s ease',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.backgroundColor = 'rgba(255, 0, 0, 1)';
                            e.target.style.transform = 'scale(1.1)';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
                            e.target.style.transform = 'scale(1)';
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