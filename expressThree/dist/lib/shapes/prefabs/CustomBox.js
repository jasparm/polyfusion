import * as THREE from '/three/three.module.js';
import { CustomShape } from "../CustomShape.js";
/**
 * This defines a prefab shape for a rectangular prism.
 * This makes it really simple for a box to be created without needing to define vertices each time.
 */
export class CustomBox extends CustomShape {
    length;
    width;
    height;
    constructor(length = 1, width = 1, height = 1, colour = new THREE.Color(0x0000ff)) {
        super();
        this.length = length;
        this.width = width;
        this.height = height;
        this.colour = colour;
        this.vertexManager.init(this.createVertices());
        this.init();
    }
    /**
     * Creates the vertices for the cube based on the length, width, and height.
     * @returns An array of vertices in the form of a number array.
     */
    createVertices() {
        const halfLength = this.length / 2;
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;
        return [
            -halfLength, -halfWidth, -halfHeight, // Vertex 0
            halfLength, -halfWidth, -halfHeight, // Vertex 1
            halfLength, halfWidth, -halfHeight, // Vertex 2
            -halfLength, halfWidth, -halfHeight, // Vertex 3
            -halfLength, -halfWidth, halfHeight, // Vertex 4
            halfLength, -halfWidth, halfHeight, // Vertex 5
            halfLength, halfWidth, halfHeight, // Vertex 6
            -halfLength, halfWidth, halfHeight // Vertex 7
        ];
    }
}
