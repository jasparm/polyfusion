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
): { index: number; distance: number } {
  var closestVertex: number = -Infinity;
  var minDistance = Infinity;

  // Calculate distance from position to all vertices
  for (let i = 0; i < vertices.length; i++) {
    const distance = calculateDistance(vertices[i], position);
    // If distance is the smallest we have seen so far, update min distance and closest vertex
    if (distance < minDistance) {
      minDistance = distance;
      closestVertex = i;
    }
  }

  return { index: closestVertex, distance: minDistance };
}

// Calculates the Euclidean distance between two points.
// ref: https://en.wikipedia.org/wiki/Euclidean_distance
function calculateDistance(vertex: THREE.Vector3, position: THREE.Vector3) {
  // Calculate Euclidean distance between current vertex and position
  const distance = Math.sqrt(
    Math.pow(vertex.x - position.x, 2) +
      Math.pow(vertex.y - position.y, 2) +
      Math.pow(vertex.z - position.z, 2)
  );
  return distance;
}

/**
 * Find the closest two vertices from the list of vertices from a point.
 * This can be used to find a group of 3 vertices that can be used to create a triangle.
 *
 * @param vertices An array of Vector3 objects representing a vertex in 3D space.
 * @param position A Vector3 object representing a point in 3D space.
 * @returns Array of closest and second closest vertices. [closest, second closest]
 */
export function findClosestTwoVertices(
  vertices: THREE.Vector3[],
  position: THREE.Vector3
): [number, number] {
  const closestVertexIndex = findClosestVertex(vertices, position);

  if (closestVertexIndex === null) {
    return [-Infinity, -Infinity]; // If no closest vertex, return null for both
  }

  // Remove the closest vertex by setting it very far away.
  const originalClosest = vertices[closestVertexIndex.index];
  vertices[closestVertexIndex.index] = new THREE.Vector3(
    Infinity,
    Infinity,
    Infinity
  );

  const secondClosestVertexIndex = findClosestVertex(vertices, position);
  // Restore the original closest vertex
  vertices[closestVertexIndex.index] = originalClosest;

  return [closestVertexIndex.index, secondClosestVertexIndex.index];
}

/**
 * Returns an array of vertices which have the same distance to the vertex at the current position.
 *
 * @param vertices List of all vertices.
 * @param position Position we want to check from.
 * @returns Number array containing the index of the vertices which have the same distance.
 */
export function checkForVerticesWithSameDistance(
  vertices: THREE.Vector3[],
  position: THREE.Vector3
): number[] {
  const { distance: minDistance } = findClosestVertex(vertices, position);
  const sameDistance: number[] = [];
  const vertexes: THREE.Vector3[] = [];

  for (let i = 0; i < vertices.length; i++) {
    const distance = calculateDistance(vertices[i], position);
    if (distance === minDistance && !isVector3InList(vertices[i], vertexes)) {
      sameDistance.push(i);
      vertexes.push(vertices[i]);
    }
  }
  return sameDistance;
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
