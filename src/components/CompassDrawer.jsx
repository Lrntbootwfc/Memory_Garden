// src/components/CompassDrawer.jsx
import React from "react";

export default function CompassDrawer({ rotation = 0 }) {
    return (
        <div className="fixed top-4 left-4 w-16 h-16 bg-white/10 backdrop-blur-md rounded-full border border-white/30 z-50 flex items-center justify-center">
            <div
                className="w-10 h-10 border border-red-500 rounded-full relative"
                style={{ transform: `rotate(${rotation}deg)` }}
            >
                <div className="absolute top-1/2 left-1/2 w-1 h-4 bg-red-500 origin-bottom-center -translate-x-1/2 -translate-y-1/2"></div>
            </div>
        </div>
    );
}
