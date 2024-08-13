import * as THREE from 'three';

/**
 * Returns the centre point of a given mesh in global coordinates.
 * 
 * @param mesh 
 * @returns Vector storing the centre point of the mesh in global space.
 */
export function getCentrePoint(mesh: THREE.Mesh): THREE.Vector3 {
    const geometry = mesh.geometry; // extract the geometry from the mesh

    geometry.computeBoundingBox();

    // We can easily get the center of this bounding box
    const center = new THREE.Vector3();
    geometry.boundingBox.getCenter(center);
    mesh.localToWorld(center); // convert the local coordinates of the mesh to world coords.

    return center;

}

/**
 * Finds the closest vertex in a list of vertices from a point.
 * 
 * @param vertices An array of Vector3 objects representing a vertex in 3D space.
 * @param position A Vector3 object representing a point in 3D space.
 * @returns The index of the vertex in the vertices array.
 */
export function findClosestVertex(vertices: THREE.Vector3[], position: THREE.Vector3): number | null {
    var closestVertex: number | null = null;
    var minDistance = Infinity;

    // Calculate distance from position to all vertices
    for (let i = 0; i < vertices.length; i ++){
        const vertex = vertices[i]
        // Calculate Euclidean distance between current vertex and position
        const distance = Math.sqrt(
            Math.pow(vertex.x - position.x, 2) +
            Math.pow(vertex.y - position.y, 2) +
            Math.pow(vertex.z - position.z, 2)
        );

        // If distance is the smallest we have seen so far, update min distance and closest vertex
        if (distance < minDistance) {
            minDistance = distance;
            closestVertex = i;
        }
    }
    vertices.forEach(vertex => {
        
    });

    return closestVertex;
}