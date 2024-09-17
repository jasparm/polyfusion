import * as THREE from "three";


// Calculates the Euclidean distance between two points.
// ref: https://en.wikipedia.org/wiki/Euclidean_distance
export function calculateDistance(vertex: THREE.Vector3, position: THREE.Vector3) {
  // Calculate Euclidean distance between current vertex and position
  const distance = Math.sqrt(
    Math.pow(vertex.x - position.x, 2) +
      Math.pow(vertex.y - position.y, 2) +
      Math.pow(vertex.z - position.z, 2)
  );
  return distance;
}


/**
 * Computes the normal vector of a triangle formed by 3 vertices.
 * ref: https://www.khronos.org/opengl/wiki/Calculating_a_Surface_Normal
 *
 * @param vertex1 - First vertex of the triangle
 * @param vertex2 - Second vertex of the triangle
 * @param vertex3 = Third vertex of the triangle
 * @returns Vector3 representing the normal vector.
 */
export function computeNormal(
  vertex1: THREE.Vector3,
  vertex2: THREE.Vector3,
  vertex3: THREE.Vector3
): THREE.Vector3 {
  const AB = new THREE.Vector3().subVectors(vertex2, vertex1);
  const AC = new THREE.Vector3().subVectors(vertex3, vertex1);
  const normal = new THREE.Vector3().crossVectors(AB, AC).normalize();
  return normal;
}

