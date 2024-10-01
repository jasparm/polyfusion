import * as THREE from 'three';
import { CustomShape } from "../CustomShape.ts";


export class CustomIcosahedron extends CustomShape {
    radius: number;

    constructor(radius = 1, colour: THREE.Color = new THREE.Color(0xfae71b)) {
        super();
        this.radius = radius;
        this.colour = colour;
        this.vertexManager.init(this.createVertices());
        this.name = "Icosahedron";

        this.init();
    }

    /**
     * Creates the vertices for the icosahedron by stealing the inbuilt geometry.
     * @returns Array of vertices to build a mesh from.
     */
    private createVertices(): number[] {
        const icosahedronGeometry = new THREE.IcosahedronGeometry(this.radius);
        const vertices = icosahedronGeometry.getAttribute('position').array;

        return Array.from(vertices);
    }
}
