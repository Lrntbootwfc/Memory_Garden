// src/components/HologramScreen.jsx

import React from 'react';
import { useTexture, useVideoTexture } from "@react-three/drei";

const HologramScreen = ({ position, memoryData, onClose }) => {
    // NEW: Ab hum memory type ke hisab se texture load karenge.
    let texture;
    let video;

    if (memoryData.type === 'image') {
        texture = useTexture(memoryData.source);
    } else if (memoryData.type === 'video') {
        // video texture ke liye useVideoTexture use hota hai.
        video = useVideoTexture(memoryData.source);
        texture = video;
    } else {
        // Agar koi valid type nahi hai, to null return karo.
        return null;
    }

    // Position ko flower ke upar set karte hain (y-axis mein upar).
    const screenPosition = [position[0], 2.5, position[2]];

    return (
        // onPointerDown se click ya tap event handle hota hai.
        // onClose prop ko call karke hologram ko band karte hain.
        <mesh
            position={screenPosition}
            onClick={(e) => {
                e.stopPropagation();
                onClose();
            }}
        >
            <planeGeometry args={[2, 1.2]} />
            <meshBasicMaterial
                map={texture}
                transparent
                opacity={0.8}
            />
        </mesh>
    );
};

export default HologramScreen;