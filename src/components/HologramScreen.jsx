// src/components/HologramScreen.jsx

import React from 'react';
import ImageMemory from './ImageMemory'; // New Import
import VideoMemory from './VideoMemory'; // New Import

const HologramScreen = ({ position, memoryData, onClose }) => {
    const screenPosition = [position[0], 2.5, position[2]];

    let memoryComponent = null;

    if (memoryData.type === 'image' && memoryData.source) {
        memoryComponent = <ImageMemory src={memoryData.source} />;
    } else if (memoryData.type === 'video' && memoryData.source) {
        memoryComponent = <VideoMemory src={memoryData.source} />;
    } else {
        // Agar data missing hai, to component render hi na ho
        return null;
    }

    return (
        <mesh
            position={screenPosition}
            onClick={(e) => {
                e.stopPropagation();
                onClose();
            }}
        >
            <planeGeometry args={[2, 1.2]} />
            {/* Ab yahan hum memoryComponent ko render karenge */}
            {memoryComponent}
        </mesh>
    );
};

export default HologramScreen;