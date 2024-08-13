import * as THREE from "three";

import { getCentrePoint } from "../MeshHelper.ts";
import { computeNormal } from "./ShapeHelpers.ts";
import { collidesWith } from "../Collision.ts";

export class CustomShape {
  scene: THREE.Scene;
  vertices: THREE.Vector3[]; // List of points in 3D space which will be the vertices
  connections: number[][]; // List of connections between vertices i, j, and k.
  // e.g., number[0] = [1, 0, 3] means there should be plane drawn connecting vertex 1, 0 and 3.

  geometry: THREE.PolyhedronGeometry; // Stores the geometry of the shape
  material: THREE.Material; // Stores the material used on the shape
  mesh: THREE.Mesh; // Stores the combined mesh which can be added to the scene.

  radius: number;

  constructor(
    scene: THREE.Scene,
    vertices: number[] = [],
    connections: number[][] = [],
    radius: number = 1
  ) {
    this.vertices = this.mapVerticesToVector3(vertices);
    this.connections = connections;
    this.scene = scene;
    this.radius = radius;

    this.geometry = new THREE.PolyhedronGeometry(
      vertices,
      this.convertConnections(this.connections),
      this.radius,
      0
    );
    this.material = new THREE.MeshStandardMaterial({
      color: 0xff00ff,
      side: THREE.DoubleSide,
    });
    // @ts-ignore Typescript does not like material being passed here even though it works.
    this.mesh = new THREE.Mesh(this.geometry, this.material);

  }

  /**
   * Determines if the current shape is convex or not.
   * Ref: https://liam.flookes.com/cs/geo/
   *
   * @returns Boolean representing of the shape is convex or not.
   */
  isConvex(): boolean {
    const point = getCentrePoint(this.mesh);
    console.log(this.connections);

    this.connections.forEach((connection) => {
      const vertex1 = this.vertices[connection[0]];
      const vertex2 = this.vertices[connection[1]];
      const vertex3 = this.vertices[connection[2]];

      const normal = computeNormal(vertex1, vertex2, vertex3);

      const collisions = collidesWith(
        point,
        normal,
        this.scene,
        0,
        this.radius * 2
      );
      // Check if we collide with more than 1 face. If this is convex, it should only collide with 1 face.
      if (collisions.length > 1) {
        return false;
      }
    });

    return true;
  }

  /**
   * Converts connections array to array useable for Three.JS
   *
   * @param connections - The connections between elements.
   * @returns An array of faces.
   */
  convertConnections(connections: number[][]): number[] {
    var faces: number[] = [];

    connections.forEach((connection) => {
      connection.forEach((element) => {
        faces.push(element);
      });
    });

    return faces;
  }

  mapVerticesToVector3(vertices: number[]): THREE.Vector3[] {
    console.log(vertices);
    var vertexes: THREE.Vector3[] = [];

    for (let i = 0; i < vertices.length; i += 3) {
      console.log(vertices[i]);
      vertexes.push(new THREE.Vector3(vertices[0], vertices[1], vertices[2]));
    }

    return vertexes;
  }

  mapVector3ToVertices() {
    var vertices: number[] = [];

    this.vertices.forEach((vertex) => {
      vertices.push(vertex.x, vertex.y, vertex.z);
    });

    return vertices;
  }

  addVertex(point: THREE.Vector3) {}

  updateMesh() {}
}
