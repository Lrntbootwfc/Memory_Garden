// src/components/CameraController.jsx
import { OrbitControls } from "@react-three/drei";
import React from "react";

const CameraController = () => {
    return <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />;
};

export default CameraController;
