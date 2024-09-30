import * as THREE from 'three';
import { CustomShape } from "../CustomShape.ts";

export class CustomOctahedron extends CustomShape {
    length: number;
    width: number;
    height: number;


    constructor(length=1, width=1, height=1, colour: THREE.Color = new THREE.Color(0xeb4034)) {
        super()
        this.length = length;
        this.width = width;
        this.height = height;
        this.colour = colour;
        this.vertexManager.init(this.createVertices());
        this.name = "Octahedron"
        
        this.init()
    }

  /**
   * Creates the vertices for the octahedron based on the length, width, and height.
   * @returns An array of vertices in the form of a number array.
   */
  private createVertices(): number[] {
    const halfLength = this.length / 2;
    const halfWidth = this.width / 2;
    const halfHeight = this.height / 2;

    return [
      0, halfHeight, 0,       // Top vertex
      -halfLength, 0, -halfWidth, // Bottom-left-front
      halfLength, 0, -halfWidth,  // Bottom-right-front
      halfLength, 0, halfWidth,   // Bottom-right-back
      -halfLength, 0, halfWidth,  // Bottom-left-back
      0, -halfHeight, 0       // Bottom vertex
    ];
  }
}