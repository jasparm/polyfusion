import * as THREE from 'three';
import { CustomShape } from "./CustomShape.ts";

/**
 * This defines a prefab shape for a rectangular prism.
 * This makes it really simple for a box to be created without needing to define vertices each time.
 */
export class CustomBox extends CustomShape {
  length: number;
  width: number;
  height: number;

  constructor(scene, length=1, width=1, height=1, colour: THREE.Color = new THREE.Color(0xff00ff)) {
    super(scene);
    this.length = length;
    this.width = width;
    this.height = height;
    this.colour = colour
    this.wireframe = true

    // Get vertices and connections for a box.
    this.vertices = this.mapVerticesToVector3(this.createVertices());
    this.connections = this.createConnections();

    this.init();
    this.group.add(this.mesh);

  }

  /**
   * Creates the vertices for the cube based on the length, width, and height.
   * @returns An array of vertices in the form of a number array.
   */
  private createVertices(): number[] {
    const halfLength = this.length / 2;
    const halfWidth = this.width / 2;
    const halfHeight = this.height / 2;

    return [
      -halfLength, -halfWidth, -halfHeight, // Vertex 0
       halfLength, -halfWidth, -halfHeight, // Vertex 1
       halfLength,  halfWidth, -halfHeight, // Vertex 2
      -halfLength,  halfWidth, -halfHeight, // Vertex 3
      -halfLength, -halfWidth,  halfHeight, // Vertex 4
       halfLength, -halfWidth,  halfHeight, // Vertex 5
       halfLength,  halfWidth,  halfHeight, // Vertex 6
      -halfLength,  halfWidth,  halfHeight  // Vertex 7
    ];
  }

  /**
   * Creates the connections (faces) for the cube.
   * @returns An array of connections where each connection is an array of three vertex indices.
   */
  private createConnections(): number[][] {
    return [
      [0, 1, 2], [0, 2, 3], // Front face
      [1, 5, 6], [1, 6, 2], // Right face
      [5, 4, 7], [5, 7, 6], // Back face
      [4, 0, 3], [4, 3, 7], // Left face
      [3, 2, 6], [3, 6, 7], // Top face
      [0, 4, 5], [0, 5, 1]  // Bottom face
    ];
  }

}
