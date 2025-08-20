// src/utils/clusterUtils.js (FINAL VERSION)

/**
 * Group flowers into clusters
 * - Group by either date OR emotion
 * - Returns array of clusters: { flowers, centerPosition, size, date, emotion }
 */
export function createClusters(flowers, groupBy = "date") {
    const clustersMap = {};

    flowers.forEach(flower => {
        const key = flower[groupBy] || "unknown";
        if (!clustersMap[key]) {
            clustersMap[key] = [];
        }
        clustersMap[key].push(flower);
    });

    const clusters = Object.keys(clustersMap).map(key => {
        const clusterFlowers = clustersMap[key];

        // First, calculate the original center position for the cluster
        const originalCenterX = clusterFlowers.reduce((sum, f) => sum + f.position[0], 0) / clusterFlowers.length;
        const originalCenterZ = clusterFlowers.reduce((sum, f) => sum + f.position[2], 0) / clusterFlowers.length;

        // Now, calculate the compact grid dimensions for the flowers
        const numFlowers = clusterFlowers.length;
        const gridSize = Math.ceil(Math.sqrt(numFlowers));
        const gridSpacing = 1.0; // Use a larger value for less compact spacing

        // Recalculate positions for a compact grid relative to the cluster's center
        const newClusterFlowers = clusterFlowers.map((flower, index) => {
            const col = index % gridSize;
            const row = Math.floor(index / gridSize);

            // Position the flowers in a compact grid centered around the origin [0,0,0]
            const offsetX = (col - (gridSize - 1) / 2) * gridSpacing;
            const offsetZ = (row - (gridSize - 1) / 2) * gridSpacing;

            // Apply the original cluster's position to place the entire new grid
            const newPosition = [
                originalCenterX + offsetX,
                0, // Keep Y at 0
                originalCenterZ + offsetZ,
            ];

            // Return a new flower object with the updated position
            return { ...flower, position: newPosition };
        });

        // Use the size of the new, compact grid for the display card
        const size = gridSize * gridSpacing;

        return {
            flowers: newClusterFlowers,
            centerPosition: [originalCenterX, 0, originalCenterZ],
            size,
            date: groupBy === "date" ? key : clusterFlowers[0].date,
            emotion: groupBy === "emotion" ? key : clusterFlowers[0].emotion || "",
        };
    });

    return clusters;
}