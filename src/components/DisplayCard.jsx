// src/components/DisplayCard.jsx
import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";

/**
 * DisplayCard for flower clusters
 * - Always faces camera (billboard)
 * - Rectangular plane with horizontal gradient
 * - Position slightly in front of cluster
 * - Dynamic width based on text length, height based on line count
 * - Displays date on top, emotion below (if available)
 */
export default function DisplayCard({
    clusterPosition = [0, 0, 0],   
    clusterSize = 5,               
    date = "2025-08-20",           
    emotion = "",                  // NEW: emotion field
    gradientColors = ["#f5e6c8", "#d9b382"], 
    fontSize = 0.4,                // fixed readable font size
}) {
    const { camera } = useThree();
    const cardRef = useRef();

    // Prepare text lines
    const lines = emotion ? [date, emotion] : [date];
    const lineCount = lines.length;

    // Estimate width dynamically (approx. character count)
    const charLength = Math.max(...lines.map(l => l.length));
    const width = charLength * 0.35; // adjust multiplier for spacing
    const height = lineCount * fontSize * 1.5; // adjust vertical spacing

    // Create gradient texture
    const texture = useMemo(() => {
        const texWidth = 256;
        const texHeight = 64 * lineCount;
        const canvas = document.createElement("canvas");
        canvas.width = texWidth;
        canvas.height = texHeight;
        const ctx = canvas.getContext("2d");

        const grad = ctx.createLinearGradient(0, 0, texWidth, 0);
        grad.addColorStop(0, gradientColors[0]);
        grad.addColorStop(1, gradientColors[1]);

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, texWidth, texHeight);

        const tex = new THREE.CanvasTexture(canvas);
        tex.needsUpdate = true;
        return tex;
    }, [gradientColors, lineCount]);

    // Billboard effect: always face camera
    useFrame(() => {
        if (cardRef.current) cardRef.current.lookAt(camera.position);
    });

    // Position offset slightly above cluster
    const offset = 1.0;

    return (
        <group ref={cardRef} position={[clusterPosition[0], clusterPosition[1] + offset, clusterPosition[2]]}>
            <mesh>
                <planeGeometry args={[width, height]} /> 
                <meshStandardMaterial map={texture} />
            </mesh>

            {/* Text lines */}
            {lines.map((line, idx) => (
                <Text
                    key={idx}
                    position={[0, (height/2 - fontSize*0.75) - idx * fontSize*1.5, 0.01]} // top-aligned, z-offset
                    fontSize={fontSize}
                    color="#4b2e0f"
                    anchorX="center"
                    anchorY="middle"
                >
                    {line}
                </Text>
            ))}
        </group>
    );
}
