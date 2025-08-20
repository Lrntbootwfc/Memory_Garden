// src/state/store.js
import { create } from 'zustand'

// Global app state (memories, filters, player position, UI toggles)
export const useAppStore = create((set) => ({
    // --- Data ---
    memories: [], // array of memory objects from backend
    filters: {
        date: null,
        emotion: null,
        location: null,
        keywords: [],
    },

    // --- Player state ---
    playerPos: [0, 0, 0],

    // --- UI Toggles ---
    showSearch: false,
    showUpload: false,
    showMinimap: true,
    showCompass: false,
    // --- Actions ---
    setMemories: (memories) => set({ memories }),
    setFilters: (filters) => set({ filters }),
    setPlayerPos: (pos) => set({ playerPos: pos }),
    toggleSearch: () => set((s) => ({ showSearch: !s.showSearch })),
    toggleUpload: () => set((s) => ({ showUpload: !s.showUpload })),
    toggleMinimap: () => set((s) => ({ showMinimap: !s.showMinimap })),
    toggleCompass: () => set((s) => ({ showCompass: !s.showCompass })),
}))
