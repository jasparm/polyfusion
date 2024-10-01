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

  /**
   * Calculates the exact volume of a custom shape.
   * Based on the Divergence Theorem: https://en.wikipedia.org/wiki/Divergence_theorem
   * For meshes, this basically just simplifies to calculating the signed volume of each triangle in the mesh.
   * 
   * @returns volume of the shape.
   *
   */
  export function calculateVolume(shape: THREE.Mesh, scale: THREE.Vector3 = new THREE.Vector3(1, 1, 1)) {
    // volume this calculates looks correct so it's good enough for me
    let volume = 0;
    const position = shape.geometry.attributes.position;

    if (!position) {
      return 0;
    }
    const faces = position.count / 3;

    function volumeOfTriangle(vA: THREE.Vector3, vB: THREE.Vector3, vC: THREE.Vector3) {
      return vA.dot(vB.cross(vC)) / 6;
    }

    for (let i = 0; i < faces; i ++) {
      const vA = new THREE.Vector3().fromBufferAttribute(position, i * 3);
      const vB = new THREE.Vector3().fromBufferAttribute(position, i * 3 + 1);
      const vC = new THREE.Vector3().fromBufferAttribute(position, i * 3 + 2);

      volume += volumeOfTriangle(vA, vB, vC);
    }
    // Account for scaling of the shape
    const scaleFactor = scale.x * scale.y * scale.z

    return Math.abs(volume * scaleFactor);
  }

