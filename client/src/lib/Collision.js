import * as THREE from 'three';

/**
 * 
 * 
 * @param {THREE.Vector3} position - Position we are checking from we are checking from
 * @param {THREE.Vector3} direction - Vector3: 
 * @param {int} min - Minimum distance to search for collisions.
 * @param {int} max - Maximum distance to search for collisions.
 * @returns Array of objects which the ray collides with in the direction given.
 */
export function collidesWith(position, direction, scene, min = 0, max = Number.POSITIVE_INFINITY) {
    const vector = direction.normalize(); // normalize vector first 
    const raycaster = new THREE.Raycaster(position, vector, min, max);

    const intersects = raycaster.intersectObjects(scene.children);
   
    return intersects;
}

/**
 * Checks if one object is inside of another object.
 * Returns true if 50% or more of the object is inside.
 * 
 * @param {THREE.THREE.Vector3} object1 - Inside object.
 * @param {THREE.Mesh} object2 - Outside object.
 * @returns {boolean} Returns true if object1 is partially inside object2
 */
export function isPartiallyInside(object1, object2, scene) {
    const id = object2.uuid;
    // Check for collisions in all directions
    const directions = new Array(
        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(-1, 0, 0),
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, -1, 0),
        new THREE.Vector3(0, 0, 1),
        new THREE.Vector3(0, 0, -1)
    )

    const validCollisions = new Array();

    for (var i = 0; i < directions.length; i ++){
        const collisions = collidesWith(object1, directions[i], scene);

        // Filters out all collisions that do not have the correct uuid
        const filtered = collisions.filter(collision => collision.object.uuid === id);

        // add only the collisions where this occurs once
        if (filtered.length == 1) {
            validCollisions.push(filtered[0]);
        }
        
    }

    if (validCollisions.length > 1){
        return true;
    }

    return false;
    
}


