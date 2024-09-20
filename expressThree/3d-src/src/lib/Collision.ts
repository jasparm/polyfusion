import * as THREE from "three";
import { CustomShape } from "./shapes/CustomShape.ts";

// The directions we will want to check collisions in.
const directions: THREE.Vector3[] = [
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(-1, 0, 0),
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, -1, 0),
  new THREE.Vector3(0, 0, 1),
  new THREE.Vector3(0, 0, -1),
  new THREE.Vector3(1, 1, 1),
  new THREE.Vector3(1, -1, 1),
  new THREE.Vector3(-1, 1, 1),
  new THREE.Vector3(-1, 1, -1),
];

/**
 * Returns all objects which are found from a point in a certain direction.
 *
 * @param position - Position we are checking from we are checking from
 * @param direction - Direction in which we are checking for collisions.
 * @param min - Minimum distance to search for collisions.
 * @param max - Maximum distance to search for collisions.
 * @returns Array of objects which the ray collides with in the direction given.
 */
export function collidesWith(
  position: THREE.Vector3,
  direction: THREE.Vector3,
  scene: THREE.Scene,
  min: number = 0,
  max: number = Number.POSITIVE_INFINITY
): any[] {
  const vector = direction.normalize(); // normalize vector first
  const raycaster = new THREE.Raycaster(position, vector, min, max);

  const intersects = raycaster.intersectObjects(scene.children);

  return intersects;
}

/**
 * Checks if one object is inside of another object.
 * Returns true if 50% or more of the object is inside.
 * NOTE: For this to work, the target object needs to be double-sided otherwise there will be no collision detection from the inside.
 *
 * @param point - Point in global coordinates
 * @param object - THREE.Mesh of outside object
 * @param scene - Scene at which this point and objects exist inside
 * @returns Returns true if the point is partially inside the object
 */
export function isPartiallyInside(
  point: THREE.Vector3,
  object: CustomShape,
  scene: THREE.Scene
): boolean {
  const id = object.id;

  for (var i = 0; i < directions.length; i++) {
    const direction = directions[i];
    if (direction) {
      const collisions = collidesWith(point, direction, scene);
      // Filters out all collisions that do not have the correct uuid
      const filtered = collisions.filter(
        (collision) => collision.object.name === id
      );

      // add only the collisions where this occurs once
      if (filtered.length === 1) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Checks if a point is inside multiple objects.
 * Returns true if the point is inside all objects inside of the objects array.
 *
 * @param point - Point in global coordinates
 * @param objects - Array of objects. Checks if point is inside these objects
 * @param  scene - Scene at which this point and objects exist inside
 * @returns
 */
export function isInsideObjects(
  point: THREE.Vector3,
  objects: Array<CustomShape>,
  scene: THREE.Scene
): boolean {
  for (var i = 0; i < objects.length; i++) {
    const object = objects[i];
    if (object && isPartiallyInside(point, object, scene) === false) {
      return false;
    }
  }

  return true;
}
