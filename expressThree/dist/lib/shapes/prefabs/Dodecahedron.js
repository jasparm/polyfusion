import * as THREE from '/three/three.module.js';
import { CustomShape } from "../CustomShape.js";
export class CustomDodecahedron extends CustomShape {
    radius;
    constructor(radius = 1, colour = new THREE.Color(0xff00ff)) {
        super();
        this.radius = radius;
        this.colour = colour;
        this.vertexManager.init(this.createVertices());
        this.init();
    }
    /**
     * Creates the vertices for the dodecahedron based on its radius.
     * @returns An array of vertices in the form of a number array.
     */
    createVertices() {
        // Cheat and get the vertices from the built in shape.
        const dodecahedronGeometry = new THREE.DodecahedronGeometry(this.radius);
        const vertices = dodecahedronGeometry.getAttribute('position').array;
        return Array.from(vertices);
    }
}
