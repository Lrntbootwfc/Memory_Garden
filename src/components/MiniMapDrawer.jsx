// src/components/MiniMap.jsx

import React from 'react';
import { useAppStore } from '../state/store';
import { motion } from 'framer-motion';

// This helper function converts 3D world coordinates to 2D map pixels
const worldToMapCoords = (worldPos, worldSize, mapSize) => {
    const [x, _, z] = worldPos; // We only need the X and Z axes for a top-down map
    
    // Scale the world position to the map size and center it
    const mapX = (x / worldSize) * mapSize + (mapSize / 2);
    const mapZ = (z / worldSize) * mapSize + (mapSize / 2);
    
    return { left: `${mapX}px`, top: `${mapZ}px` };
};

export default function MiniMapDrawer({ onClose }) {
    // --- Data from our global Zustand store ---
    const clusters = useAppStore((s) => s.clusters);
    const cameraPos = useAppStore((s) => s.cameraPos);
    const cameraRot = useAppStore((s) => s.cameraRot); // Player rotation in radians

    // --- Map Configuration ---
    const MAP_SIZE_PIXELS = 192; // The size of our map div (w-48 in Tailwind)
    const WORLD_SIZE_UNITS = 50; // A rough estimate of the garden's diameter. Adjust if needed.

    const playerMapPos = worldToMapCoords(cameraPos, WORLD_SIZE_UNITS, MAP_SIZE_PIXELS);
    
    // Convert camera rotation from radians to degrees for CSS transform
    const playerRotationDegrees = cameraRot * (180 / Math.PI);

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed top-20 right-4 w-56 bg-white/10 backdrop-blur-md rounded-lg border border-white/30 z-50 p-2 shadow-xl"
        >
            <div className="flex justify-between items-center mb-1">
                <h2 className="text-white text-sm font-semibold">Garden Map</h2>
                <button
                    onClick={onClose}
                    className="text-white text-xs px-2 py-1 bg-white/20 rounded hover:bg-white/40"
                >
                    ✕
                </button>
            </div>

            {/* The Map Area */}
            <div 
                className="relative bg-black/30 rounded"
                style={{ width: MAP_SIZE_PIXELS, height: MAP_SIZE_PIXELS }}
            >
                {/* Render each memory cluster */}
                {Array.isArray(clusters) && clusters.map((cluster) => {
                    const clusterMapPos = worldToMapCoords(cluster.centerPosition, WORLD_SIZE_UNITS, MAP_SIZE_PIXELS);
                    return (
                        <div
                            key={cluster.date}
                            className="absolute flex flex-col items-center group"
                            style={{ 
                                left: clusterMapPos.left, 
                                top: clusterMapPos.top,
                                transform: 'translate(-50%, -50%)' // Center the icon
                            }}
                        >
                            {/* Cluster Icon */}
                            <div className="w-2 h-2 bg-cyan-400 rounded-full border-2 border-cyan-200 shadow-lg"></div>
                            {/* Cluster Label on Hover */}
                            <div className="hidden group-hover:block absolute -top-6 text-xs bg-black/70 text-white px-2 py-1 rounded">
                                {cluster.date}
                            </div>
                        </div>
                    );
                })}

                {/* Player Indicator */}
                <div
                    className="absolute w-3 h-3"
                    style={{
                        left: playerMapPos.left,
                        top: playerMapPos.top,
                        transform: `translate(-50%, -50%) rotate(${playerRotationDegrees}deg)`
                    }}
                >
                     {/* Arrow SVG indicating direction */}
                    <svg viewBox="0 0 24 24" fill="currentColor" className="text-red-500">
                        <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
                    </svg>
                </div>
            </div>
        </motion.div>
    );
}
