import * as THREE from 'three';
import { CustomShape } from "../CustomShape.ts";

/**
 * This defines a prefab shape for a tetrahedron.
 * This makes it simple for a tetrahedron to be created without needing to define vertices each time.
 */
export class CustomTetrahedron extends CustomShape {
  size: number;

  constructor(size = 1, colour: THREE.Color = new THREE.Color(0x00ff00)) {
    super();
    this.size = size;
    this.colour = colour;
    this.vertexManager.init(this.createVertices());
    this.name = "Tetrahedron"

    this.init();
  }

  /**
   * Creates the vertices for the tetrahedron based on its size.
   * @returns An array of vertices in the form of a number array.
   */
  private createVertices(): number[] {
    const h = Math.sqrt(2 / 3) * this.size; // Height of the tetrahedron
    const a = this.size / Math.sqrt(3);     // Base edge length

    return [
      0, 0, h,      // Vertex 0 (top vertex)
      -a, -this.size / 2, 0,  // Vertex 1 
      a, -this.size / 2, 0,   // Vertex 2
      0, this.size, 0         // Vertex 3
    ];
  }
}
