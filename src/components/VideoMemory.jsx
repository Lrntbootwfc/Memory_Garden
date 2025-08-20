// src/components/VideoMemory.jsx

import React, { useEffect, useRef } from 'react';
import { useVideoTexture } from '@react-three/drei';
import * as THREE from 'three';

const VideoMemory = ({ src }) => {
    // Video element ko DOM se control karne ke liye ref
    const video = useRef();

    // Hook ko yahan direct call kiya gaya hai.
    const texture = useVideoTexture(src);

    // Video ko play karne ke liye useEffect hook
    useEffect(() => {
        if (video.current) {
            video.current.play();
            video.current.loop = true;
        }
    }, []);

    return (
        <meshBasicMaterial
            map={texture}
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
        />
    );
};

export default VideoMemory;