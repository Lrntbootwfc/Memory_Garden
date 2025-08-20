// GardenControls.jsx
import { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function GardenControls() {
    const { camera ,gl} = useThree();
    const velocity = useRef(new THREE.Vector3());
    const direction = useRef(new THREE.Vector3());
    const keys = useRef({});

    // ✅ Handle key press / release
    useEffect(() => {
        const handleKeyDown = (e) => {
            keys.current[e.code] = true;
        };
        const handleKeyUp = (e) => {
            keys.current[e.code] = false;
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    // ✅ Movement update on every frame
    useFrame((_, delta) => {
        const speed = 10; // movement speed
        direction.current.set(0, 0, 0);

        // Arrow keys
        if (keys.current["ArrowUp"]) direction.current.z -= 1; // forward
        if (keys.current["ArrowDown"]) direction.current.z += 1; // backward
        if (keys.current["ArrowLeft"]) direction.current.x -= 1; // left
        if (keys.current["ArrowRight"]) direction.current.x += 1; // right

        // Fly up/down (Q/E keys OR PageUp/PageDown)
        if (keys.current["PageUp"] || keys.current["KeyE"]) direction.current.y += 1;
        if (keys.current["PageDown"] || keys.current["KeyQ"]) direction.current.y -= 1;

        direction.current.normalize(); // keep movement smooth

        // Apply movement relative to camera direction
        if (direction.current.lengthSq() > 0) {
            velocity.current.copy(direction.current).multiplyScalar(speed * delta);

            // Forward/back/left/right relative to camera
            const forward = new THREE.Vector3();
            camera.getWorldDirection(forward);
            forward.y = 0;
            forward.normalize();

            const right = new THREE.Vector3();
            right.crossVectors(camera.up, forward).normalize().negate();

            const move = new THREE.Vector3();
            move.addScaledVector(forward, velocity.current.z);
            move.addScaledVector(right, velocity.current.x);
            move.addScaledVector(new THREE.Vector3(0, 1, 0), velocity.current.y);

            camera.position.add(move);
        }
    });

    return null;
}








// // src/components/GardenControls.jsx
// import { useRef, useEffect } from "react";
// import { useFrame, useThree } from "@react-three/fiber";
// import * as THREE from "three";

// const GardenControls = ({ speed = 10 }) => {
//   const { camera, gl } = useThree();
//   const velocity = useRef(new THREE.Vector3());
//   const keys = useRef({});

//   useEffect(() => {
//     const handleKeyDown = (e) => (keys.current[e.code] = true);
//     const handleKeyUp = (e) => (keys.current[e.code] = false);

//     window.addEventListener("keydown", handleKeyDown);
//     window.addEventListener("keyup", handleKeyUp);

//     return () => {
//       window.removeEventListener("keydown", handleKeyDown);
//       window.removeEventListener("keyup", handleKeyUp);
//     };
//   }, []);

//   useFrame((_, delta) => {
//     const direction = new THREE.Vector3();
//     if (keys.current["KeyW"] || keys.current["ArrowUp"]) direction.z -= 1;
//     if (keys.current["KeyS"] || keys.current["ArrowDown"]) direction.z += 1;
//     if (keys.current["KeyA"] || keys.current["ArrowLeft"]) direction.x -= 1;
//     if (keys.current["KeyD"] || keys.current["ArrowRight"]) direction.x += 1;
//     if (keys.current["Space"]) direction.y += 1;      // fly up
//     if (keys.current["ShiftLeft"]) direction.y -= 1;  // fly down

//     direction.normalize();

//     velocity.current.x = direction.x * speed * delta;
//     velocity.current.y = direction.y * speed * delta;
//     velocity.current.z = direction.z * speed * delta;

//     camera.position.x += velocity.current.x;
//     camera.position.y += velocity.current.y;
//     camera.position.z += velocity.current.z;
//   });

//   return null;
// };

// export default GardenControls;
