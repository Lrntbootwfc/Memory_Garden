import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Flower from "./components/Flower";
import GardenScene from "./components/GardenScene";

function App() {
  return (
    <div className="w-screen h-screen">
      <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
        {/* Lights */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
         {/* Garden with random flowers */}
        <GardenScene />

        {/* Test Flowers */}
        <Flower position={[0, 0, 0]} color="red" />
        <Flower position={[2, 0, -2]} color="yellow" />
        <Flower position={[-2, 0, 1]} color="blue" />
        
      
        {/* Camera Controls */}
        <OrbitControls />
      </Canvas>
    </div>
  );
}

export default App;
