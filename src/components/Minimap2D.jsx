// src/components/Minimap2D.jsx
import React, { useEffect, useRef } from "react";

/**
 * Lightweight 2D minimap drawn to <canvas>.
 * - Shows user as a triangle
 * - Shows memory flowers as dots
 * - Appears only when visible=true
 */
export default function Minimap2D({
    width = 180,
    height = 180,
    visible = false,     // NEW: controlled visibility
    player = { x: 0, z: 0, yaw: 0 },
    memoryPoints = [],   // NEW: [{x,z}, ...]
    range = 1200,        // NEW: how many world units are visible edge-to-edge
}) {
    const canvasRef = useRef();

    useEffect(() => {
        if (!visible) return;
        const ctx = canvasRef.current.getContext("2d");

        const draw = () => {
            if (!visible) return;
            ctx.clearRect(0, 0, width, height);

            // background
            ctx.fillStyle = "#0e1a10";
            ctx.globalAlpha = 0.85;
            ctx.fillRect(0, 0, width, height);
            ctx.globalAlpha = 1;

            // grid
            ctx.strokeStyle = "rgba(255,255,255,0.06)";
            ctx.lineWidth = 1;
            const cells = 6;
            for (let i = 1; i < cells; i++) {
                const x = (i * width) / cells;
                const y = (i * height) / cells;
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
            }

            // convert world -> map
            const sx = (wx) => ((wx - player.x) / range) * width + width / 2;
            const sz = (wz) => ((wz - player.z) / range) * height + height / 2;

            // memory points
            ctx.fillStyle = "#6ee7b7";
            memoryPoints.forEach(p => {
                const x = sx(p.x);
                const y = sz(p.z);
                if (x < -5 || x > width + 5 || y < -5 || y > height + 5) return;
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.fill();
            });

            // player (triangle)
            const px = width / 2;
            const pz = height / 2;
            const size = 8;
            ctx.save();
            ctx.translate(px, pz);
            ctx.rotate(-player.yaw); // yaw is camera rotation around Y
            ctx.fillStyle = "#93c5fd";
            ctx.beginPath();
            ctx.moveTo(0, -size);
            ctx.lineTo(size * 0.75, size);
            ctx.lineTo(-size * 0.75, size);
            ctx.closePath();
            ctx.fill();
            ctx.restore();

            requestAnimationFrame(draw);
        };

        const id = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(id);
    }, [visible, width, height, player, memoryPoints, range]);

    if (!visible) return null;

    return (
        <div style={{
            position: "absolute",
            right: 16,
            bottom: 16,
            width,
            height,
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(8px)",
            zIndex: 30
        }}>
            <canvas ref={canvasRef} width={width} height={height} />
        </div>
    );
}
