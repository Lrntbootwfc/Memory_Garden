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
    const MAP_SIZE_PIXELS = 200; // Slightly larger circular map
    const WORLD_SIZE_UNITS = 50; // A rough estimate of the garden's diameter. Adjust if needed.

    const playerMapPos = worldToMapCoords(cameraPos, WORLD_SIZE_UNITS, MAP_SIZE_PIXELS);
    
    // Convert camera rotation from radians to degrees for CSS transform
    const playerRotationDegrees = cameraRot * (180 / Math.PI);

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed top-4 right-4 z-50"
        >
            {/* Outer ring with glow effect */}
            <div className="relative">
                {/* Glowing outer border */}
                <div 
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/30 to-blue-600/30 blur-sm"
                    style={{ width: MAP_SIZE_PIXELS + 20, height: MAP_SIZE_PIXELS + 20, left: -10, top: -10 }}
                />
                
                {/* Main border ring */}
                <div 
                    className="absolute inset-0 rounded-full border-4 border-white/80 shadow-2xl"
                    style={{ width: MAP_SIZE_PIXELS + 8, height: MAP_SIZE_PIXELS + 8, left: -4, top: -4 }}
                />
                
                {/* Inner border */}
                <div 
                    className="absolute inset-0 rounded-full border-2 border-cyan-300/60"
                    style={{ width: MAP_SIZE_PIXELS + 4, height: MAP_SIZE_PIXELS + 4, left: -2, top: -2 }}
                />

                {/* The Circular Map Area */}
                <div 
                    className="relative rounded-full overflow-hidden bg-gradient-to-br from-green-900/40 via-green-800/60 to-green-700/40 backdrop-blur-sm"
                    style={{ 
                        width: MAP_SIZE_PIXELS, 
                        height: MAP_SIZE_PIXELS,
                        background: `
                            radial-gradient(circle at center, rgba(34, 197, 94, 0.3) 0%, rgba(21, 128, 61, 0.6) 100%),
                            conic-gradient(from 0deg, rgba(6, 78, 59, 0.4), rgba(34, 197, 94, 0.4), rgba(6, 78, 59, 0.4))
                        `
                    }}
                >
                    {/* Terrain texture overlay */}
                    <div 
                        className="absolute inset-0 opacity-20"
                        style={{
                            background: `
                                radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                                radial-gradient(circle at 70% 70%, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                                radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
                            `,
                            backgroundSize: '20px 20px, 30px 30px, 25px 25px'
                        }}
                    />

                    {/* Cardinal direction markers */}
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-white/60 text-xs font-bold">N</div>
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-white/60 text-xs font-bold">S</div>
                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white/60 text-xs font-bold">W</div>
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/60 text-xs font-bold">E</div>

                    {/* Range circles */}
                    <div className="absolute inset-0">
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-white/20 rounded-full"/>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white/15 rounded-full"/>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/10 rounded-full"/>
                    </div>

                    {/* Render each memory cluster */}
                    {Array.isArray(clusters) && clusters.map((cluster) => {
                        const clusterMapPos = worldToMapCoords(cluster.centerPosition, WORLD_SIZE_UNITS, MAP_SIZE_PIXELS);
                        
                        // Check if cluster is within circular bounds
                        const centerX = MAP_SIZE_PIXELS / 2;
                        const centerY = MAP_SIZE_PIXELS / 2;
                        const clusterX = parseInt(clusterMapPos.left);
                        const clusterY = parseInt(clusterMapPos.top);
                        const distanceFromCenter = Math.sqrt(Math.pow(clusterX - centerX, 2) + Math.pow(clusterY - centerY, 2));
                        const maxRadius = (MAP_SIZE_PIXELS / 2) - 15; // Margin from edge
                        const isWithinCircle = distanceFromCenter <= maxRadius;
                        
                        // If outside circle, project to edge
                        let finalPos = clusterMapPos;
                        if (!isWithinCircle) {
                            const angle = Math.atan2(clusterY - centerY, clusterX - centerX);
                            const edgeX = centerX + Math.cos(angle) * maxRadius;
                            const edgeY = centerY + Math.sin(angle) * maxRadius;
                            finalPos = { left: `${edgeX}px`, top: `${edgeY}px` };
                        }
                        
                        return (
                            <div
                                key={cluster.date}
                                className="absolute flex flex-col items-center group z-10"
                                style={{ 
                                    left: finalPos.left, 
                                    top: finalPos.top,
                                    transform: 'translate(-50%, -50%)' // Center the icon
                                }}
                            >
                                {/* Cluster pulse effect - different for edge clusters */}
                                <div className={`absolute w-4 h-4 rounded-full animate-ping ${isWithinCircle ? 'bg-cyan-400/30' : 'bg-orange-400/40'}`}/>
                                
                                {/* Cluster Icon - different color for edge clusters */}
                                <div className={`relative w-3 h-3 rounded-full border-2 border-white shadow-lg ${
                                    isWithinCircle 
                                        ? 'bg-gradient-to-br from-cyan-300 to-cyan-500' 
                                        : 'bg-gradient-to-br from-orange-300 to-orange-500'
                                }`}>
                                    <div className={`absolute inset-0.5 rounded-full ${
                                        isWithinCircle ? 'bg-cyan-200' : 'bg-orange-200'
                                    }`}/>
                                </div>
                                
                                {/* Cluster Label on Hover */}
                                <div className="hidden group-hover:block absolute -top-8 bg-black/80 text-white text-xs px-2 py-1 rounded-md border border-cyan-400/50 whitespace-nowrap z-20">
                                    <div className="font-semibold">{cluster.date}</div>
                                    {!isWithinCircle && <div className="text-orange-300 text-xs">Outside view</div>}
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/80"/>
                                </div>
                            </div>
                        );
                    })}

                    {/* Player Indicator */}
                    <div
                        className="absolute z-20"
                        style={{
                            left: playerMapPos.left,
                            top: playerMapPos.top,
                            transform: `translate(-50%, -50%) rotate(${playerRotationDegrees}deg)`
                        }}
                    >
                        {/* Player glow effect */}
                        <div className="absolute inset-0 w-6 h-6 bg-blue-400/40 rounded-full blur-sm transform -translate-x-1/2 -translate-y-1/2"/>
                        
                        {/* Player arrow */}
                        <div className="relative w-4 h-4">
                            <svg 
                                viewBox="0 0 24 24" 
                                fill="currentColor" 
                                className="text-blue-400 drop-shadow-lg w-full h-full"
                            >
                                <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
                            </svg>
                        </div>
                        
                        {/* Player base circle */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full border border-blue-400"/>
                    </div>

                    {/* Scanning line effect */}
                    <div 
                        className="absolute top-1/2 left-1/2 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent transform -translate-x-1/2 -translate-y-1/2 animate-spin"
                        style={{ 
                            transformOrigin: 'center',
                            animationDuration: '4s',
                            animationTimingFunction: 'linear'
                        }}
                    />
                </div>

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500/80 hover:bg-red-600 text-white text-sm rounded-full border-2 border-white shadow-lg transition-all duration-200 hover:scale-110"
                >
                    ✕
                </button>

                {/* Map title */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-white/80 text-sm font-semibold bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm border border-white/20">
                    Garden Map
                </div>
            </div>
        </motion.div>
    );
}