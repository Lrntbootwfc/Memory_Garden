// src/components/ImageMemory.jsx

import React from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

const ImageMemory = ({ src }) => {
    // Hook ko yahan direct call kiya gaya hai, bina kisi condition ke.
    const texture = useTexture(src);

    return (
        <meshBasicMaterial
            map={texture}
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
        />
    );
};

export default ImageMemory;