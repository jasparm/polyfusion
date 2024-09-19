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
    if (geometry.boundingBox) {
        geometry.boundingBox.getCenter(center);
    }
    mesh.localToWorld(center); // convert the local coordinates of the mesh to world coords.

    return center;

}