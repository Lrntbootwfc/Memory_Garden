// src/components/HologramScreen.jsx

import React, { useRef, useEffect } from 'react';
import { Html, Plane } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';

const HologramScreen = ({ position, memoryData, onClose }) => {
    // --- FIX: Access data correctly -
    const { media_path, media_type, title, description } = memoryData;

    // Spring animation for a smooth fade-in/fade-out effect
    const [styles, api] = useSpring(() => ({
        opacity: 0,
        scale: 0.5,
        config: { tension: 200, friction: 20 },
    }));

    // Trigger animation on mount and unmount
    useEffect(() => {
        api.start({ opacity: 1, scale: 1 }); // Fade in
        return () => api.start({ opacity: 0, scale: 0.5 }); // Fade out on close
    }, [api]);

    // Calculate a better position above the flower
    const screenPosition = [position[0], position[1] + 2.0, position[2]];

    // Stop propagation to prevent player controls from locking when clicking the UI
    const handleContentClick = (e) => {
        e.stopPropagation();
    };

    return (
        <animated.group position={screenPosition} scale={styles.scale}>
            {/* Transparent background plane */}
            <Plane
                args={[4, 2.5]}
                onClick={(e) => {
                    e.stopPropagation(); // Prevent clicks from going through to the ground
                    onClose(); // Close when clicking the background
                }}
            >
                <meshStandardMaterial
                    color="#0077ff"
                    opacity={styles.opacity}
                    transparent={true}
                    side={THREE.DoubleSide}
                    emissive="#0077ff"
                    emissiveIntensity={0.2}
                />
            </Plane>

            {/* HTML content projected onto the plane */}
            <Html
                center
                transform
                position={[0, 0, 0.01]} // Slightly in front of the plane
                occlude
                className="hologram-content"
                onPointerDown={handleContentClick} // Prevent click-through
            >
                <div className="memory-card">
                    <h3>{title}</h3>
                    <p>{description}</p>
                    
                    {/* --- FIX: Correctly render media based on media_type --- */}
                    {media_type === 'image' && <img src={media_path} alt={title} />}
                    {media_type === 'video' && <video src={media_path} controls autoPlay loop />}
                    {media_type === 'audio' && <audio src={media_path} controls autoPlay loop />}
                    
                    <button onClick={onClose} className="close-button">Close</button>
                </div>
            </Html>
        </animated.group>
    );
};

export default HologramScreen;