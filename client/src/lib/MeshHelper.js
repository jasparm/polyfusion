import * as THREE from 'three';

/**
 * Returns the centre point of a given mesh in global coordinates.
 * 
 * @param {THREE.Mesh} mesh 
 * @returns Vector3 containing the centre point of the mesh in global space.
 */
export function getCentrePoint(mesh) {
    const geometry = mesh.geometry;

    geometry.computeBoundingBox();

    const center = new THREE.Vector3();
    geometry.boundingBox.getCenter(center);
    mesh.localToWorld(center);

    return center;

}