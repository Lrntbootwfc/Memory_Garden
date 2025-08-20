// src/components/MiniMapDrawer.jsx
import React from "react";

export default function MiniMapDrawer({ onClose, cameraPos = [0, 0] }) {
    return (
        <div className="fixed top-20 right-4 w-48 h-48 bg-white/10 backdrop-blur-md rounded-lg border border-white/30 z-50 p-2">
            <div className="flex justify-between items-center mb-1">
                <h2 className="text-white text-sm font-semibold">MiniMap</h2>
                <button
                    onClick={onClose}
                    className="text-white text-xs px-2 py-1 bg-white/20 rounded hover:bg-white/40"
                >
                    ✕
                </button>
            </div>
            {/* Simple top-down minimap */}
            <div className="relative w-full h-full bg-black/20 rounded">
                {/* Camera indicator */}
                <div
                    className="absolute w-2 h-2 bg-red-500 rounded-full"
                    style={{
                        left: `${50 + cameraPos[0]}%`,
                        top: `${50 - cameraPos[1]}%`,
                        transform: "translate(-50%, -50%)",
                    }}
                />
            </div>
        </div>
    );
}
