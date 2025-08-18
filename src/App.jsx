import { Canvas } from "@react-three/fiber";
import GardenScene from "./components/GardenScene";

function App() {
  return (
    <div className="w-screen h-screen">
      <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
        <GardenScene />
      </Canvas>
    </div>
  );
}

export default App;