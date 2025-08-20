// src/App.jsx
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import GardenScene from "./components/GardenScene";
import { motion } from "framer-motion";
import { Compass } from "lucide-react";
import MiniMapDrawer from "./components/MiniMapDrawer";
import SearchDrawer from "./components/SearchDrawer";
import { useAppStore } from "./state/store";
import CompassDrawer from "./components/CompassDrawer";

function App() {
  // ✅ Access zustand store
  const memories = useAppStore((s) => s.memories);
  const showSearch = useAppStore((s) => s.showSearch);
  const showUpload = useAppStore((s) => s.showUpload);
  const showMinimap = useAppStore((s) => s.showMinimap);
  const showCompass = useAppStore((s) => s.showCompass);

  const toggleSearch = useAppStore((s) => s.toggleSearch);
  const toggleMinimap = useAppStore((s) => s.toggleMinimap);
  const toggleCompass = useAppStore((s) => s.toggleCompass);
  return (
    <div className="w-screen h-screen">
      {/* 🎨 3D Canvas */}
      <Canvas shadows camera={{ position: [0, 10, 25], fov: 60 }}>
        <Suspense fallback={null}>
          <GardenScene />
        </Suspense>

      </Canvas>

      {/* 📌 Fixed UI overlay (always on screen) */}
      <div className="absolute top-4 right-4 flex flex-col gap-3 z-50 text-white">
        {/* Map icon */}
        <motion.button
          onClick={(e) => {
            e.stopPropagation(); // <-- stop click from reaching canvas
            toggleMinimap();      // <-- existing logic
          }}
          className="p-2 rounded-full bg-white/20 hover:bg-white/40">
          🗺️
        </motion.button>

        {/* Search icon */}
        <motion.button
          onClick={(e) => {
            e.stopPropagation(); // <-- stop click from reaching canvas
            toggleSearch();      // <-- existing logic
          }}
          className="p-2 rounded-full bg-white/20 hover:bg-white/40">
          🔍
        </motion.button>

        {/* Compass */}
        <motion.button
          className="p-2 rounded-full bg-white/20 hover:bg-white/40"
          onClick={(e) => {
            e.stopPropagation(); // <-- stop click from reaching canvas
            toggleCompass();
          }}
        >
          <Compass className="w-6 h-6" />
        </motion.button>
      </div>
      {/* 🎮 Enter Garden button */}
      <div className="absolute top-4 left-4 z-50">
        <button
          className="px-4 py-2 rounded-md bg-white/80 hover:bg-white/100 text-black font-semibold shadow-lg"
          onClick={() => {
            const canvas = document.querySelector("canvas");
            if (canvas) {
              canvas.requestPointerLock();
              setLockPointer(true); // you need this state from PlayerControls
            }
          }}
        >
          Enter Garden
        </button>
      </div>


      {/* ✅ Drawers (conditionally rendered) */}
      {showMinimap && <MiniMapDrawer onClose={toggleMinimap} />}
      {showSearch && <SearchDrawer onClose={toggleSearch} />}
      {showCompass && <CompassDrawer />}


    </div >
  );
}

export default App;
