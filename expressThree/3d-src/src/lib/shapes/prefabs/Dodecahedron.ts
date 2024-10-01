import * as THREE from 'three';
import { CustomShape } from "../CustomShape.ts";

export class CustomDodecahedron extends CustomShape {
    radius: number;

    constructor(radius = 1, colour: THREE.Color = new THREE.Color(0xff00ff)) {
        super();
        this.radius = radius;
        this.colour = colour;
        this.vertexManager.init(this.createVertices());
        this.name = "Dodecahedron"

        this.init();
    }

    /**
     * Creates the vertices for the dodecahedron based on its radius.
     * @returns An array of vertices in the form of a number array.
     */
    private createVertices(): number[] {
        // Cheat and get the vertices from the built in shape.
        const dodecahedronGeometry = new THREE.DodecahedronGeometry(this.radius);
        const vertices = dodecahedronGeometry.getAttribute('position').array;
        
        return Array.from(vertices);
    }
}
