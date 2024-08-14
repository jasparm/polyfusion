import * as THREE from "three";

import { getCentrePoint } from "../MeshHelper.ts";
import {
  checkForVerticesWithSameDistance,
  computeNormal,
  findClosestTwoVertices,
  generateCombinations,
} from "./ShapeHelpers.ts";
import { collidesWith } from "../Collision.ts";

export class CustomShape {
  scene: THREE.Scene;
  vertices: THREE.Vector3[]; // List of points in 3D space which will be the vertices
  connections: number[][]; // List of connections between vertices i, j, and k.
  // e.g., number[0] = [1, 0, 3] means there should be plane drawn connecting vertex 1, 0 and 3.

  geometry: THREE.PolyhedronGeometry; // Stores the geometry of the shape
  material: THREE.Material; // Stores the material used on the shape
  mesh: THREE.Mesh; // Stores the combined mesh which can be added to the scene.
  group: THREE.Group; // Stores all other shapes that are part of the mesh.
  userVertices: number[]; // Stores user defined vertex information.
  radius: number;

  constructor(
    scene: THREE.Scene,
    vertices: number[] = [],
    connections: number[][] = [],
    radius: number = 1
  ) {
    this.connections = connections;
    this.scene = scene;
    this.radius = radius;
    this.group = new THREE.Group();
    this.userVertices = vertices;

    this.init();

    // this.group.add(this.mesh);
  }

  private init() {
    this.geometry = new THREE.PolyhedronGeometry(
      this.userVertices,
      this.convertConnections(this.connections),
      this.radius,
      0
    );
    this.vertices = this.mapVerticesToVector3();

    this.material = new THREE.MeshStandardMaterial({
      color: 0xff00ff,
      side: THREE.DoubleSide,
    });
    // @ts-ignore Typescript does not like material being passed here even though it works.
    this.mesh = new THREE.Mesh(this.geometry, this.material);

    this.addSpheresToVertices();

    return;
  }

  /**
   * Determines if the current shape is convex or not.
   * Ref: https://liam.flookes.com/cs/geo/
   *
   * @returns Boolean representing of the shape is convex or not.
   */
  isConvex(): boolean {
    const point = getCentrePoint(this.mesh);

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

  /**
   * Maps vertices array to array of Vector3. This is much easier to work with to distinguish between each vertex.
   * Takes the vertex positions from the geometry.
   *
   * @returns New array containing Vector3 elements that represent each vertex.
   */
  mapVerticesToVector3(): THREE.Vector3[] {
    var vertexes: THREE.Vector3[] = [];
    const vertices = this.geometry.attributes.position.array;

    for (let i = 0; i < vertices.length; i += 3) {
      vertexes.push(
        new THREE.Vector3(vertices[i], vertices[i + 1], vertices[i + 2])
      );
    }

    return vertexes;
  }

  /**
   * Converts array of Vector3 back to array of vertices.
   * This is needed as THREE.JS expects the array to be of this type and not to be of type Vector3.
   * NOTE: Might not actually be needed, will delete later if not needed.
   *
   * @returns Converted Vector3 array.
   */
  mapVector3ToVertices(vertexes: THREE.Vector3[]): number[] {
    var vertices: number[] = [];
    // use instances stored vertices array and create a new array.
    // this way we can maintain the instances vertices array.
    vertexes.forEach((vertex) => {
      vertices.push(vertex.x, vertex.y, vertex.z);
    });

    return vertices;
  }

  /**
   * Adds little spheres to the corners of the shape.
   *
   * @param radius Radius of the balls. Defaults to 0.1.
   * @param colour Colour of the balls. Defaults to black.
   */
  addSpheresToVertices(
    radius: number = 0.1,
    colour: THREE.Color = new THREE.Color(0x000000)
  ) {
    const ball = new THREE.SphereGeometry(radius);
    const ball_material = new THREE.MeshBasicMaterial({ color: colour });
    const ball_mesh = new THREE.Mesh(ball, ball_material);

    this.vertices.forEach((vertex) => {
      const newBall = ball_mesh.clone();
      this.group.add(newBall);
      // @ts-ignore Typescript keeps thinking that meshes do not have a position attribute when they simply just do.
      newBall.position.x = vertex.x;
      // @ts-ignore Typescript keeps thinking that meshes do not have a position attribute when they simply just do.
      newBall.position.y = vertex.y;
      // @ts-ignore Typescript keeps thinking that meshes do not have a position attribute when they simply just do.
      newBall.position.z = vertex.z;
    });
  }


  /**
   * Adds a vertex to the CustomShape.
   * 
   * @param point - The THREE.Vector3 representing the coordinates of the vertex to be added.
   */
  addVertex(point: THREE.Vector3) {
    // Find the two closest vertices to the point being added
    const closest = findClosestTwoVertices(this.vertices, point);

    // Convert user-defined vertex coordinates to THREE.Vector3 objects.
    const userVerticesVector3: THREE.Vector3[] = [];
    for (let i = 0; i < this.userVertices.length; i += 3) {
      const newVector = new THREE.Vector3(
        this.userVertices[i],
        this.userVertices[i + 1],
        this.userVertices[i + 2]
      );
      userVerticesVector3.push(newVector);
    }
    // Check if there are any other vertices with the same distance from the point being added.
    // This way we can connect more than 1 edge at a time.
    const validVertices = checkForVerticesWithSameDistance(
      userVerticesVector3,
      point
    );
    // Determine which vertices wil be used to form connections.
    var connections: number[];
    if (validVertices.length > 2) { // Use multiple edges if we can
      connections = validVertices;
    } else {
      connections = closest; //Otherwise just use the two closest vertices.
    }

    const oldGeometry = this.geometry; // if we need to revert back to the old geometry.

    const vertices = [...this.userVertices]; // Add the new vertex to the list of vertices
    vertices.push(point.x, point.y, point.z);

    // Validate that the connections are valid. Return if they are not.
    if (connections[0] === -Infinity || connections[1] === -Infinity) {
      console.error("No valid vertices to add to");
      return;
    }
    
    // Convert connections to a flat array
    const newConnections = this.convertConnections(this.connections);

    const newIndex = vertices.length / 3 - 1; // Index for the new vertex to take.

    const combinations = generateCombinations(validVertices, 2); // Generate all possible combinations of two valid vertices.

    for (let i = 0; i < combinations.length; i++) {
      newConnections.push(combinations[i][0], combinations[i][1], newIndex);
    }

    // Check connections and vertexes to make sure they are valid numbers.
    vertices.forEach((vertex) => {
      if (isNaN(vertex)) {
        console.error("Invalid vertex:", vertex);
        return;
      }
    });
    newConnections.forEach((connection) => {
      if (isNaN(connection)) {
        console.error("Invalid connection:", connection);
        return;
      }
    });

    // Create the new geometry with updated vertices and connections.
    const newGeometry = new THREE.PolyhedronGeometry(
      vertices,
      newConnections,
      this.radius,
      0
    );


    // @ts-ignore Typescript does not like material being passed here even though it works.
    this.mesh = new THREE.Mesh(newGeometry, this.material);

    // If the new shape is not convex, revert back to the old geometry.
    if (!this.isConvex()) {
      // If the newly created shape is not convex, do not change the shape.
      // @ts-ignore Typescript does not like material being passed here even though it works.
      this.mesh = new THREE.Mesh(oldGeometry, this.material);
      return;
    }

    // @ts-ignore Typescript does not like material being passed here even though it works.
    this.geometry = newGeometry;
    this.userVertices = vertices;
    this.connections = [];
    // Convert connections array to be right form factor.
    for (let j = 0; j < newConnections.length; j += 3) {
      this.connections.push([
        newConnections[j],
        newConnections[j + 1],
        newConnections[j + 2],
      ]);
    }

    // Add the mesh to the group and reinitialise the shape.
    this.init();
    this.group.add(this.mesh);
  }

  updateMesh() {}
}
