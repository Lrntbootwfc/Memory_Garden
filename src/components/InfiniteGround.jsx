// src/components/InfiniteGround.jsx
import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";

/**
 * Infinite-looking tiled ground:
 * - Keeps a fixed NxN grid of tiles around the camera.
 * - Repositions tiles as you move so it appears endless.
 */
const clampRepeat = (tex, repeat = 8) => {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeat, repeat);
    tex.anisotropy = 8;
    tex.needsUpdate = true;
    return tex;
};

export default function InfiniteGround({
    tileSize = 40,
    tiles = 3,                // creates tiles x tiles grid around camera (must be odd)
    texturePath = "/textures/grass.jpeg",
    textureRepeatPerTile = 12 // how many times the grass tiles within one tile
}) {
    const { camera } = useThree();
    const grassTexture = clampRepeat(useTexture(texturePath), textureRepeatPerTile);

    // Prepare fixed meshes we’ll recycle.
    const tileRefs = useRef([]);
    const halfTiles = Math.floor(tiles / 2);

    // Make stable array of tile indices
    const tileIndices = useMemo(() => {
        const arr = [];
        for (let zi = -halfTiles; zi <= halfTiles; zi++) {
            for (let xi = -halfTiles; xi <= halfTiles; xi++) {
                arr.push({ xi, zi });
            }
        }
        return arr;
    }, [tiles]);

    useFrame(() => {
        // Which tile is camera on?
        const cx = Math.floor(camera.position.x / tileSize);
        const cz = Math.floor(camera.position.z / tileSize);

        // Reposition each tile mesh
        tileRefs.current.forEach((mesh, i) => {
            const { xi, zi } = tileIndices[i];
            const tx = (cx + xi) * tileSize;
            const tz = (cz + zi) * tileSize;
            mesh.position.set(tx, 0, tz);
        });
    });

    return (
        <group>
            {tileIndices.map((entry, i) => (
                <mesh
                    key={i}
                    ref={(el) => (tileRefs.current[i] = el)}
                    rotation={[-Math.PI / 2, 0, 0]} // rotate each tile to be horizontal
                    receiveShadow
                >
                    <planeGeometry args={[tileSize, tileSize]} />
                    <meshStandardMaterial map={grassTexture} />
                </mesh>
            ))}
        </group>
    );

}
