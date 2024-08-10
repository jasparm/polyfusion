import * as THREE from 'three';

/**
 * Returns all objects which are found from a point in a certain direction.
 * 
 * @param position - Position we are checking from we are checking from
 * @param direction - Direction in which we are checking for collisions.
 * @param min - Minimum distance to search for collisions.
 * @param max - Maximum distance to search for collisions.
 * @returns Array of objects which the ray collides with in the direction given.
 */
export function collidesWith(position: THREE.Vector3, direction: THREE.Vector3, scene: THREE.Scene, min: number = 0, max: number = Number.POSITIVE_INFINITY): any[] {
    const vector = direction.normalize(); // normalize vector first 
    const raycaster = new THREE.Raycaster(position, vector, min, max);

    const intersects = raycaster.intersectObjects(scene.children);
    return intersects;
}

/**
 * Checks if one object is inside of another object.
 * Returns true if 50% or more of the object is inside.
 * 
 * @param point - Point in global coordinates
 * @param object - THREE.Mesh of outside object
 * @param scene - Scene at which this point and objects exist inside
 * @returns Returns true if the point is partially inside the object
 */
export function isPartiallyInside(point: THREE.Vector3, object: THREE.Mesh, scene: THREE.Scene): boolean {
    const id = object.uuid;
    // Check for collisions in all directions
    const directions = [
        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(-1, 0, 0),
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, -1, 0),
        new THREE.Vector3(0, 0, 1),
        new THREE.Vector3(0, 0, -1)
    ]

    const validCollisions: object[] = [];

    for (var i = 0; i < directions.length; i ++){
        const collisions = collidesWith(point, directions[i], scene);

        // Filters out all collisions that do not have the correct uuid
        const filtered = collisions.filter(collision => collision.object.uuid === id);

        // add only the collisions where this occurs once
        if (filtered.length === 1) {
            validCollisions.push(filtered[0]);
        }
    }

    if (validCollisions.length > 1){
        return true;
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
export function isInsideObjects(point: THREE.Vector3, objects: Array<THREE.Mesh>, scene: THREE.Scene): boolean {
    for (var i = 0; i < objects.length; i++){
        const check = isPartiallyInside(point, objects[i], scene);

        if (check === false) {
            return false
        }
    }

    return true
}


