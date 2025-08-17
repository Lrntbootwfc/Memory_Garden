import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export default function Flower({ position, color }) {
    const ref = useRef();

  // Animate slight floating
    useFrame(() => {
    ref.current.rotation.y += 0.005;
    });

    return (
    <mesh ref={ref} position={position}>
       <cylinderGeometry args={[0, 0.5, 1.5, 8]} /> {/* flower bud */}
        <meshStandardMaterial color={color} />
    </mesh>
);
}
