// src/components/PlayerControls.jsx

import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { PointerLockControls, OrbitControls, Html } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { isMobile } from 'react-device-detect';
import nipplejs from 'nipplejs';

const PlayerControls = forwardRef((props, ref) => {
    // 🌸 1. GET SCENE FOR COLLISION DETECTION
    // We need access to the scene to find all the objects we can collide with.
    const { camera, gl, scene } = useThree();
    const [isLocked, setIsLocked] = useState(false);
    const pointerLockControlsRef = useRef();
    const orbitControlsRef = useRef();

    const velocity = useRef(new THREE.Vector3());
    const direction = new THREE.Vector3();
    const onGround = useRef(false);
    const keys = useRef({});
    const joystickData = useRef({ x: 0, y: 0 });

    const GRAVITY = -30;
    const JUMP_STRENGTH = 10;
    const PLAYER_HEIGHT = 1.8;
    // 🌸 2. SETUP FOR COLLISION
    const playerCollider = new THREE.Box3();
    const playerRaycaster = new THREE.Raycaster();
    const collisionDistance = 0.5; // How close the player can get to an object.

    useImperativeHandle(ref, () => ({
        unlock: () => document.exitPointerLock(),
        isLocked: () => isLocked,
    }));

    useEffect(() => {
        const handleKeyDown = (e) => (keys.current[e.code] = true);
        const handleKeyUp = (e) => (keys.current[e.code] = false);
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    useEffect(() => {
        if (!isMobile) return;
        const joystickZone = document.createElement("div");
        joystickZone.style.cssText = "position:absolute; bottom:80px; left:50px; width:120px; height:120px; z-index:1000;";
        document.body.appendChild(joystickZone);
        const joystick = nipplejs.create({
            zone: joystickZone,
            mode: "static",
            position: { left: "60px", bottom: "60px" },
            color: "blue",
            size: 100,
        });
        joystick.on("move", (_, data) => {
            const rad = data.angle.radian;
            joystickData.current = { x: Math.cos(rad) * (data.force || 0), y: Math.sin(rad) * (data.force || 0) };
        });
        joystick.on("end", () => (joystickData.current = { x: 0, y: 0 }));
        return () => joystickZone.remove();
    }, []);

    // 🌸 3. COLLISION DETECTION FUNCTION
    const checkCollision = (moveDirection) => {
        const player = pointerLockControlsRef.current.getObject();
        // Set the raycaster's origin to the player's current position.
        playerRaycaster.set(player.position, moveDirection);
        
        // Find all potential objects to collide with (we assume flowers are complex groups).
        const collidableObjects = scene.children.filter(
            (obj) => obj.isGroup && obj.children.length > 0
        );
        const intersections = playerRaycaster.intersectObjects(collidableObjects, true);

        // If a collision is found closer than our allowed distance, we block the movement.
        if (intersections.length > 0 && intersections[0].distance < collisionDistance) {
            return true; // Collision detected
        }
        return false; // No collision
    };


    useFrame((_, delta) => {
        if (!isLocked || !pointerLockControlsRef.current) return;

        const speed = 10;
        const player = pointerLockControlsRef.current.getObject();

        // Ground check
        if (player.position.y <= PLAYER_HEIGHT) {
            velocity.current.y = Math.max(0, velocity.current.y);
            onGround.current = true;
            player.position.y = PLAYER_HEIGHT;
        } else {
            onGround.current = false;
        }

        // Jumping
        if (keys.current['Space'] && onGround.current) {
            velocity.current.y = JUMP_STRENGTH;
        }

        // Gravity
        velocity.current.y += GRAVITY * delta;

        // Horizontal movement direction
        direction.x = (keys.current['KeyD'] ? 1 : 0) - (keys.current['KeyA'] ? 1 : 0);
        direction.z = (keys.current['KeyS'] ? 1 : 0) - (keys.current['KeyW'] ? 1 : 0);
        
        if (isMobile) {
            direction.x = joystickData.current.x;
            direction.z = -joystickData.current.y;
        }

        if (direction.length() > 0) direction.normalize();
        
        // � 4. CHECK COLLISIONS BEFORE MOVING
        const forwardVector = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        const rightVector = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);

        // Forward/Backward Collision
        const moveZ = new THREE.Vector3().copy(forwardVector).multiplyScalar(direction.z);
        if (direction.z !== 0 && checkCollision(moveZ.normalize())) {
           // Don't move forward/backward
        } else {
            pointerLockControlsRef.current.moveForward(direction.z * speed * delta);
        }

        // Left/Right Collision
        const moveX = new THREE.Vector3().copy(rightVector).multiplyScalar(direction.x);
        if (direction.x !== 0 && checkCollision(moveX.normalize())) {
            // Don't move left/right
        } else {
            pointerLockControlsRef.current.moveRight(direction.x * speed * delta);
        }

        // Apply vertical movement (gravity/jump)
        player.position.y += velocity.current.y * delta;
    });

    const handleUnlock = () => {
        setIsLocked(false);
        if (orbitControlsRef.current) {
            const lookDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
            const newTarget = camera.position.clone().add(lookDirection.multiplyScalar(10));
            orbitControlsRef.current.target.copy(newTarget);
            orbitControlsRef.current.update();
        }
    };

    return (
        <>
            <PointerLockControls
                ref={pointerLockControlsRef}
                args={[camera, gl.domElement]}
                onLock={() => setIsLocked(true)}
                onUnlock={handleUnlock}
                makeDefault={isLocked}
            />
            <OrbitControls
                ref={orbitControlsRef}
                args={[camera, gl.domElement]}
                enabled={!isLocked}
                makeDefault={!isLocked}
            />
            {!isLocked && (
                <Html center>
                    <div
                        style={{
                            textAlign: 'center',
                            color: 'white',
                            background: 'rgba(0,0,0,0.6)',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            border: '1px solid white',
                            pointerEvents: 'none',
                        }}
                    >
                        <h2>Click scene to explore</h2>
                        <p>(W, A, S, D = Move | Space = Jump | ESC = Exit)</p>
                    </div>
                </Html>
            )}
        </>
    );
});

export default PlayerControls;
