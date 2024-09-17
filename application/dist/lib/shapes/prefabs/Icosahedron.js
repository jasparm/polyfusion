import * as THREE from '/three/three.module.js';
import { CustomShape } from "../CustomShape.js";
export class CustomIcosahedron extends CustomShape {
    radius;
    constructor(radius = 1, colour = new THREE.Color(0xfae71b)) {
        super();
        this.radius = radius;
        this.colour = colour;
        this.vertexManager.init(this.createVertices());
        this.init();
    }
    /**
     * Creates the vertices for the icosahedron by stealing the inbuilt geometry.
     * @returns Array of vertices to build a mesh from.
     */
    createVertices() {
        const icosahedronGeometry = new THREE.IcosahedronGeometry(this.radius);
        const vertices = icosahedronGeometry.getAttribute('position').array;
        return Array.from(vertices);
    }
}
