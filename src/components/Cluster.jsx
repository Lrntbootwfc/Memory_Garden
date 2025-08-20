// Example of a Cluster.jsx component
import React from 'react';
import Flower from './Flower';

const Cluster = ({ clusterData, onFlowerClick }) => {
    return (
        <group>
            {clusterData.flowers.map(flower => (
                <Flower
                    key={flower.id}
                    position={flower.position}
                    modelPath={flower.modelPath}
                    onClick={() => onFlowerClick(flower)} // Pass the entire flower object on click
                />
            ))}
        </group>
    );
};

export default Cluster;