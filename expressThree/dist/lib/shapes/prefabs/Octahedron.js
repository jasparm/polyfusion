import * as THREE from '/three/three.module.js';
import { CustomShape } from "../CustomShape.js";
export class CustomOctahedron extends CustomShape {
    length;
    width;
    height;
    constructor(length = 1, width = 1, height = 1, colour = new THREE.Color(0xeb4034)) {
        super();
        this.length = length;
        this.width = width;
        this.height = height;
        this.colour = colour;
        this.vertexManager.init(this.createVertices());
        this.init();
    }
    /**
     * Creates the vertices for the octahedron based on the length, width, and height.
     * @returns An array of vertices in the form of a number array.
     */
    createVertices() {
        const halfLength = this.length / 2;
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;
        return [
            0, halfHeight, 0, // Top vertex
            -halfLength, 0, -halfWidth, // Bottom-left-front
            halfLength, 0, -halfWidth, // Bottom-right-front
            halfLength, 0, halfWidth, // Bottom-right-back
            -halfLength, 0, halfWidth, // Bottom-left-back
            0, -halfHeight, 0 // Bottom vertex
        ];
    }
}
