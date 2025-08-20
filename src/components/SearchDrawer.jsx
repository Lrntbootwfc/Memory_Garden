// src/components/SearchDrawer.jsx
import React, { useState, useMemo } from "react";
import { useAppStore } from "../state/store";
import { motion, AnimatePresence } from "framer-motion";

const SearchDrawer = ({ data = [] }) => {
    const showSearch = useAppStore((state) => state.showSearch);
    const toggleSearch = useAppStore((state) => state.toggleSearch);

    const [query, setQuery] = useState("");

    // Filtered results based on search query
    const filteredData = useMemo(() => {
        if (!data) return [];
        const q = query.toLowerCase();
        return data.filter(
            (item) =>
                (item.name && item.name.toLowerCase().includes(q)) ||
                (item.date && item.date.toLowerCase().includes(q))
        );
    }, [data, query]);

    return (
        <AnimatePresence>
            {showSearch && (
                <motion.div
                    initial={{ x: 300 }}
                    animate={{ x: 0 }}
                    exit={{ x: 300 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed top-0 right-0 h-full w-80 bg-white/10 backdrop-blur-md shadow-lg p-4 z-50 flex flex-col"
                >
                    {/* Header */}
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-white font-semibold">Search Memories</h2>
                        <button
                            className="text-white text-lg font-bold"
                            onClick={toggleSearch}
                        >
                            ✕
                        </button>
                    </div>

                    {/* Search input */}
                    <input
                        type="text"
                        placeholder="Search by name or date..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full p-2 rounded-md text-black"
                    />

                    {/* Results */}
                    <div className="mt-4 flex-1 overflow-y-auto">
                        {filteredData.length > 0 ? (
                            filteredData.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="p-2 mb-2 rounded-md bg-white/20 hover:bg-white/40 cursor-pointer text-white"
                                    onClick={() => {
                                        // Optional: handle click to jump to flower/memory
                                        console.log("Jump to memory:", item);
                                    }}
                                >
                                    <p className="font-semibold">{item.name}</p>
                                    {item.date && <p className="text-xs">{item.date}</p>}
                                </div>
                            ))
                        ) : (
                            <p className="text-white/60 text-sm mt-2">No results found</p>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SearchDrawer;
