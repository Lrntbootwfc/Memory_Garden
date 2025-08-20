import React, { Suspense, useState, useEffect } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import GardenScene from "./components/GardenScene";
import { motion } from "framer-motion";
import { Compass } from "lucide-react";
import MiniMapDrawer from "./components/MiniMapDrawer";
import SearchDrawer from "./components/SearchDrawer";
import { useAppStore } from "./state/store";
import CompassDrawer from "./components/CompassDrawer";

// CameraTracker component to update camera position in state
function CameraTracker() {
  const { camera } = useThree();
  const setCameraPos = useAppStore((s) => s.setCameraPos);
  const setCameraRot = useAppStore((s) => s.setCameraRot);

  useFrame(() => {
    setCameraPos([camera.position.x, camera.position.y, camera.position.z]);
    setCameraRot(camera.rotation.y); // rotation around Y-axis in radians
  });

  return null;
}

function App() {
  const isMobile = window.innerWidth <= 768;
  // State from your Zustand store
  const showSearch = useAppStore((s) => s.showSearch);
  const showMinimap = useAppStore((s) => s.showMinimap);
  const showCompass = useAppStore((s) => s.showCompass);
  const cameraPos = useAppStore((s) => s.cameraPos);
  const cameraRot = useAppStore((s) => s.cameraRot);

  // Toggle functions from your Zustand store
  const toggleSearch = useAppStore((s) => s.toggleSearch);
  const toggleMinimap = useAppStore((s) => s.toggleMinimap);
  const toggleCompass = useAppStore((s) => s.toggleCompass);

  // Local state to track pointer lock for garden entry
  const [isControlsLocked, setIsControlsLocked] = useState(true);

  // Helper function to stop event propagation on buttons
  const handleClickStop = (fn) => (e) => {
    e.stopPropagation();
    fn();
  };


  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'e' || e.key === 'E') {
        setIsControlsLocked(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="w-screen h-screen relative">
      {/* 🎨 3D Canvas - This is your main view */}
      <Canvas shadows camera={{ position: [0, 10, 25], fov: 60 }} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0 }}>
        <Suspense fallback={null}>
          <GardenScene isControlsLocked={isControlsLocked} setIsControlsLocked={setIsControlsLocked} />
          <CameraTracker />
        </Suspense>
      </Canvas>

      {/* 📌 Fixed UI overlay (buttons on top of canvas) */}
      
      {/* Button container on the top right */}
      <div className="absolute top-4 right-4 flex flex-col gap-3 z-50 text-white">
        {/* Map icon button */}
        <motion.button
          onClick={handleClickStop(toggleMinimap)}
          className="p-2 rounded-full bg-white/20 hover:bg-white/40 text-white"
        >
          🗺️
        </motion.button>

        {/* Search icon button */}
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            toggleSearch();
          }}
          className="p-2 rounded-full bg-white/20 hover:bg-white/40 text-white"
        >
          🔍
        </motion.button>

        {/* Compass button */}
        <motion.button
          className="p-2 rounded-full bg-white/20 hover:bg-white/40 text-white"
          onClick={(e) => {
            e.stopPropagation();
            toggleCompass();
          }}
        >
          <Compass className="w-6 h-6" />
        </motion.button>
      </div>

      {/* Enter Garden button container on the top left */}
      <div className="absolute top-4 left-4 z-50">
        <button
          className="px-4 py-2 rounded-md bg-white/80 hover:bg-white/100 text-black font-semibold shadow-lg"
          onClick={() => {
            const canvas = document.querySelector("canvas");
            if (canvas) {
              canvas.requestPointerLock();
              // CHANGED: isControlsLocked ko true set kiya
              setIsControlsLocked(true);
            }
          }}
        >
          Enter Garden
        </button>
      </div>

      {/* Conditional Drawers with camera data */}
      {showMinimap && <MiniMapDrawer onClose={toggleMinimap} cameraPos={cameraPos} />}
      {showSearch && <SearchDrawer onClose={toggleSearch} />}
      {showCompass && <CompassDrawer rotation={(cameraRot * 180) / Math.PI} />}
    
      {/* NEW: Instructions for controls */}
      <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 100, color: 'white', fontSize: '1.2rem', backgroundColor: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '5px', textAlign: 'center' }}>
          {isControlsLocked ? "Controls Locked. Press 'E' to unlock and click flowers." : "Controls Unlocked. Click on a flower or press 'E' to lock again."}
      </div>

    </div>
  );
}

export default App;
