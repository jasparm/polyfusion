import * as THREE from '/three/three.module.js';
import { isInsideObjects } from '../Collision.js';
/**
 * Generates a random point within a given volume.
 *
 * @param {Object} xRange - The range of x values.
 * @param {number} xRange.min - The minimum x value.
 * @param {number} xRange.max - The maximum x value.
 * @param {Object} yRange - The range of y values.
 * @param {number} yRange.min - The minimum y value.
 * @param {number} yRange.max - The maximum y value.
 * @param {Object} zRange - The range of z values.
 * @param {number} zRange.min - The minimum z value.
 * @param {number} zRange.max - The maximum z value.
 * @returns {THREE.Vector3} - The randomly generated point within the volume.
 */
function getRandomPointInVolume(xRange, yRange, zRange) {
    const randomPosition = (min, max) => Math.random() * (max - min) + min;
    const x = randomPosition(xRange.min, xRange.max);
    const y = randomPosition(yRange.min, yRange.max);
    const z = randomPosition(zRange.min, zRange.max);
    const point = new THREE.Vector3(x, y, z);
    return point;
}
/**
 * Represents a Monte Carlo Manager for calculating volume using the Monte Carlo method.
 * @class
 */
export class MonteCarloManager {
    /**
     * Represents a Monte Carlo algorithm for calculating volume.
     * @constructor
     * @param {Array} objects - The array of objects to find IOU of.
     * @param {THREE.Scene} scene - The scene where objects are stored inside.
     */
    constructor(objects, scene) {
        this.scene = scene; // scene where objects are stored inside
        this.objects = objects; // this is array of objects to find IOU of
        this.running = false;
        this.interval = undefined;
        this.spawning_area = undefined;
        this.inside = 0;
        this.total = 0;
        this.max_balls = 100; // maximum number of balls we can have for an instance of a calculation
        // This is the object that will be used for calculating volume.
        // Can adjust the radius at any time to change calculations.
        this.radius = 1;
        this.inside_mat = new THREE.MeshBasicMaterial({ color: 0x0000ff });
        this.outside_mat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    }
    /**
     * Starts the Monte Carlo simulation.
     *
     * @param {number} [interval=500] - The interval in milliseconds at which the calculation will be performed.
     * @param {Object} [xRange={min: -5, max:5}] - The range of x values for spawning.
     * @param {number} xRange.min - The minimum x value.
     * @param {number} xRange.max - The maximum x value.
     * @param {Object} [yRange={min: 0, max:5}] - The range of y values for spawning.
     * @param {number} yRange.min - The minimum y value.
     * @param {number} yRange.max - The maximum y value.
     * @param {Object} [zRange={min: -5, max:5}] - The range of z values for spawning.
     * @param {number} zRange.min - The minimum z value.
     * @param {number} zRange.max - The maximum z value.
     * @returns {void}
     */
    start(interval = 500, xRange = { min: -5, max: 5 }, yRange = { min: 0, max: 5 }, zRange = { min: -5, max: 5 }) {
        if (this.running) {
            // if we are already running, can't start running again
            console.error("MonteCarloManager is already running");
            return;
        }
        this.spawning_area = [xRange, yRange, zRange];
        this.running = true;
        // Will execute method once every interval (ms)
        this.interval = setInterval(() => {
            this.performCalculation();
        }, interval);
    }
    /**
     * Stops the MonteCarloManager if it is currently running.
     *
     * @returns {void}
     */
    stop() {
        if (!this.running) {
            // can't stop a task that isn't actually running
            console.error("MonteCarloManager is not running");
            return;
        }
        clearInterval(this.interval);
        this.running = false;
        console.log(this.estimateVolume());
    }
    /**
     * Performs a calculation for the Monte Carlo algorithm.
     *
     * @returns {void}
     */
    performCalculation() {
        // If we have reached the max balls we want, stop the calculations.
        if (this.total === this.max_balls) {
            this.stop();
            return;
        }
        // Get a random spawning location.
        const spawnPosition = getRandomPointInVolume(this.spawning_area[0], this.spawning_area[1], this.spawning_area[2]);
        this.total += 1;
        // Determine if random point is inside the objects
        const isInside = isInsideObjects(spawnPosition, this.objects, this.scene);
        // Update inside count and set material according to if the point was inside all the objects or not.
        var material;
        if (isInside) {
            this.inside += 1;
            material = this.inside_mat;
        }
        else {
            material = this.outside_mat;
        }
        this.spawnObject(material, spawnPosition);
    }
    /**
     * Spawns an object inside the scene at the specified position for visualization.
     *
     * @param {THREE.Material} material - The material to be applied to the object.
     * @param {THREE.Vector3} point - The position where the object will be spawned.
     * @returns {void}
     */
    spawnObject(material, point) {
        // spawn objects inside the scene at the specified position for visualization
        const sphere = new THREE.SphereGeometry(this.radius);
        const mesh = new THREE.Mesh(sphere, material);
        mesh.name = 'Monte Carlo Ball'; // this allows for these balls to be deleted later
        mesh.position.set(point.x, point.y, point.z);
        this.scene.add(mesh);
    }
    /**
     * Calculates the estimated volume using the Monte Carlo algorithm for this instance.
     *
     * @returns {number} The estimated volume.
     */
    estimateVolume() {
        return (this.inside / this.total) * 4 / 3 * Math.PI * (this.radius ** 3);
    }
    /**
     * Resets the state of the MonteCarlo algorithm.
     *
     * @returns {void}
     */
    reset() {
        this.removeObjects();
        this.total = 0;
        this.inside = 0;
    }
    /**
     * Removes all instances of created visualization balls.
     *
     * @returns {void}
     */
    removeObjects() {
        // Goes through all children in the scene and removes those with the name 'Monte Carlo Ball'
        for (var i = this.scene.children.length - 1; i >= 0; i--) {
            const object = this.scene.children[i];
            if (object.name === 'Monte Carlo Ball') {
                this.scene.remove(object);
            }
        }
    }
}