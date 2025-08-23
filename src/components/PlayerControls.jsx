// src/components/PlayerControls.jsx

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { PointerLockControls } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { isMobile } from 'react-device-detect';
import nipplejs from 'nipplejs';


const PlayerControls = forwardRef(({ active = true }, ref) => {
    const { camera, gl, scene } = useThree();
    const pointerLockControlsRef = useRef();

    const velocity = useRef(new THREE.Vector3());
    const direction = new THREE.Vector3();
    const onGround = useRef(false);
    const keys = useRef({});
    const joystickData = useRef({ x: 0, y: 0 });

    const GRAVITY = -30;
    const JUMP_STRENGTH = 10;
    const PLAYER_HEIGHT = 1.8;
    const playerRaycaster = new THREE.Raycaster();
    const collisionDistance = 0.5;

    // Expose the unlock function to the parent component.
    useImperativeHandle(ref, () => ({
        unlock: () => document.exitPointerLock(),
    }));

    // 🌸 2. PROGRAMMATIC LOCKING
    // This effect handles locking the controls. It only runs when the 'active' prop is true.
    useEffect(() => {
        const handleCanvasClick = () => {
            if (active && pointerLockControlsRef.current) {
                pointerLockControlsRef.current.lock();
            }
        };
        // We listen for clicks on the canvas element itself.
        const canvas = gl.domElement;
        canvas.addEventListener('click', handleCanvasClick);
        return () => {
            canvas.removeEventListener('click', handleCanvasClick);
        };
    }, [active, gl.domElement]);


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

    const checkCollision = (moveDirection) => {
        const player = pointerLockControlsRef.current.getObject();
        playerRaycaster.set(player.position, moveDirection);
        const collidableObjects = scene.children.filter(
            (obj) => obj.isGroup && obj.children.length > 0
        );
        const intersections = playerRaycaster.intersectObjects(collidableObjects, true);
        if (intersections.length > 0 && intersections[0].distance < collisionDistance) {
            return true;
        }
        return false;
    };

    useFrame((_, delta) => {
        // We only run the movement logic if the controls are actually locked.
        if (!pointerLockControlsRef.current?.isLocked) return;

        const speed = 10;
        const player = pointerLockControlsRef.current.getObject();

        if (player.position.y <= PLAYER_HEIGHT) {
            velocity.current.y = Math.max(0, velocity.current.y);
            onGround.current = true;
            player.position.y = PLAYER_HEIGHT;
        } else {
            onGround.current = false;
        }

        if (keys.current['Space'] && onGround.current) {
            velocity.current.y = JUMP_STRENGTH;
        }

        velocity.current.y += GRAVITY * delta;

        direction.x = (keys.current['KeyD'] ? 1 : 0) - (keys.current['KeyA'] ? 1 : 0);
        direction.z = (keys.current['KeyS'] ? 1 : 0) - (keys.current['KeyW'] ? 1 : 0);
        
        if (isMobile) {
            direction.x = joystickData.current.x;
            direction.z = -joystickData.current.y;
        }

        if (direction.length() > 0) direction.normalize();
        
        const forwardVector = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        const rightVector = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);

        const moveZ = new THREE.Vector3().copy(forwardVector).multiplyScalar(direction.z);
        if (direction.z !== 0 && checkCollision(moveZ.normalize())) {
           // Block forward/backward movement
        } else {
            pointerLockControlsRef.current.moveForward(direction.z * speed * delta);
        }

        const moveX = new THREE.Vector3().copy(rightVector).multiplyScalar(direction.x);
        if (direction.x !== 0 && checkCollision(moveX.normalize())) {
            // Block left/right movement
        } else {
            pointerLockControlsRef.current.moveRight(direction.x * speed * delta);
        }

        player.position.y += velocity.current.y * delta;
    });

    return (
        // 🌸 3. SIMPLIFIED RETURN
        // Only the PointerLockControls are needed now.
        <PointerLockControls ref={pointerLockControlsRef} args={[camera, gl.domElement]} />
    );
});

export default PlayerControls;
