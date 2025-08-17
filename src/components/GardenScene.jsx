import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

export default function GardenScene() {
    return (
    <div className="w-full h-screen bg-gradient-to-b from-blue-100 to-green-200">
        <Canvas camera={{ position: [0, 5, 15], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} intensity={1} />
        <OrbitControls />
        {/* Garden ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[50, 50]} />
            <meshStandardMaterial color="#88cc88" />
        </mesh>
        </Canvas>
    </div>
    );
}
