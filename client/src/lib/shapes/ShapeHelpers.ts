import * as THREE from "three";

/**
 * Finds the closest vertex in a list of vertices from a point.
 *
 * @param vertices An array of Vector3 objects representing a vertex in 3D space.
 * @param position A Vector3 object representing a point in 3D space.
 * @returns The index of the vertex in the vertices array.
 */
export function findClosestVertex(
  vertices: THREE.Vector3[],
  position: THREE.Vector3
): number | null {
  var closestVertex: number | null = null;
  var minDistance = Infinity;

  // Calculate distance from position to all vertices
  for (let i = 0; i < vertices.length; i++) {
    const distance = calculateDistance(vertices[i]);
    // If distance is the smallest we have seen so far, update min distance and closest vertex
    if (distance < minDistance) {
      minDistance = distance;
      closestVertex = i;
    }
  }
  return closestVertex;

  // Calculates the Euclidean distance between two points.
  // ref: https://en.wikipedia.org/wiki/Euclidean_distance
  function calculateDistance(vertex: THREE.Vector3) {
    // Calculate Euclidean distance between current vertex and position
    const distance = Math.sqrt(
      Math.pow(vertex.x - position.x, 2) +
        Math.pow(vertex.y - position.y, 2) +
        Math.pow(vertex.z - position.z, 2)
    );
    return distance;
  }
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
export function computeNormal(vertex1: THREE.Vector3, vertex2: THREE.Vector3, vertex3: THREE.Vector3): THREE.Vector3 {
    // We must compute two vectors and find their cross product to find a normal.

    // Vector AB
    const AB = new THREE.Vector3(
        vertex2.x - vertex1.x,
        vertex2.y - vertex1.y,
        vertex2.z - vertex1.z
    );

    // Vector AC
    const AC = new THREE.Vector3(
        vertex3.x - vertex1.x,
        vertex3.y - vertex1.y,
        vertex3.z - vertex1.z
    );
    // If we get the cross product of AB and AC will give us the normal.
    const normal = new THREE.Vector3();

    normal.crossVectors(AB, AC);

    return normal;

}
