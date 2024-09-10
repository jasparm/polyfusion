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
 * Checks if a Vector3 is inside a list of Vector3s.
 *
 * @param vector Vector to search for.
 * @param list List of vectors
 * @returns boolean - true if vector is inside, false if it is not.
 */
export function isVector3InList(
  vector: THREE.Vector3,
  list: THREE.Vector3[]
): boolean {
  for (let i = 0; i < list.length; i++) {
    if (vector.equals(list[i])) {
      return true; // The vector is in the list
    }
  }
  return false; // The vector is not in the list
}

/**
 * Generates combinations of a given array with a specified combination size.
 *
 * @param array - The array of numbers to generate combinations from.
 * @param combinationSize - The size of each combination.
 * @returns An array of number arrays representing the generated combinations.
 */
export function generateCombinations(
  array: number[],
  combinationSize: number
): number[][] {
  const results: number[][] = [];

  function combine(tempArray: number[], start: number, remaining: number) {
    if (remaining === 0) {
      results.push([...tempArray]);
      return;
    }

    for (let i = start; i <= array.length - remaining; i++) {
      tempArray.push(array[i]);
      combine(tempArray, i + 1, remaining - 1);
      tempArray.pop();
    }
  }

  combine([], 0, combinationSize);
  return results;
}

/**
 * Checks if a newly created mesh is convex or if any of the connections between vertices go through other faces.
 *
 * @param mesh - The mesh to check for convexity.
 * @returns boolean - true if the mesh is convex and no connections go through other faces, false otherwise.
 */
export function isMeshConvex(mesh: THREE.Mesh): boolean {
  const geometry = mesh.geometry as THREE.BufferGeometry;
  const vertices = geometry.attributes.position.array;
  const index = geometry.index?.array;

  if (!index) {
    return false;
  }

  const numFaces = index.length / 3;

  // Check if all face normals are pointing outward
  for (let i = 0; i < numFaces; i++) {
    const a = index[i * 3];
    const b = index[i * 3 + 1];
    const c = index[i * 3 + 2];

    const vA = new THREE.Vector3(vertices[a * 3], vertices[a * 3 + 1], vertices[a * 3 + 2]);
    const vB = new THREE.Vector3(vertices[b * 3], vertices[b * 3 + 1], vertices[b * 3 + 2]);
    const vC = new THREE.Vector3(vertices[c * 3], vertices[c * 3 + 1], vertices[c * 3 + 2]);

    const normal = computeNormal(vA, vB, vC);
    const centroid = new THREE.Vector3().add(vA).add(vB).add(vC).divideScalar(3);

    const direction = centroid.clone().normalize();
    if (normal.dot(direction) < 0) {
      return false; // Non-convex if normal points inward
    }
  }

  return true; // Mesh is convex if all checks passed
}

