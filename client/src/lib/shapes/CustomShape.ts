import * as THREE from "three";

import { getCentrePoint } from "../MeshHelper.ts";
import {
  checkForVerticesWithSameDistance,
  computeNormal,
  findClosestThreeVertices,
  findGroupOfThreeIndices,
  generateCombinations,
} from "./ShapeHelpers.ts";
import { collidesWith } from "../Collision.ts";

/**
 * This class handles all aspects of CustomShape creation.
 * Also makes extensive use of the ShapeHelper.ts file.
 * Actual object which should be added to the scene is the *group* attribute.
 */
export class CustomShape {
  scene: THREE.Scene;
  vertices: THREE.Vector3[]; // List of points in 3D space which will be the vertices
  connections: number[][]; // List of connections between vertices i, j, and k.
  // e.g., number[0] = [1, 0, 3] means there should be plane drawn connecting vertex 1, 0 and 3.

  geometry: THREE.BufferGeometry; // Stores the geometry of the shape
  material: THREE.Material; // Stores the material used on the shape
  mesh: THREE.Mesh; // Stores the combined mesh which can be added to the scene.
  group: THREE.Group; // Stores all other shapes that are part of the mesh.
  wireframe: boolean; // If the shape should be drawn as a wire frame.
  drawBalls: boolean; // If shape should have spheres on each vertex.

  colour: THREE.Color; // Colour of all faces in the custom shape.
  scale: number; // Scale of the shape
  lineColour: THREE.Color // colour of the line

  constructor(
    scene: THREE.Scene,
    vertices: number[] = [],
    connections: number[][] = [],
    wireframe: boolean = false,
    drawBalls: boolean = true,
    colour: THREE.Color = new THREE.Color(0xff00ff),
    scale: number = 1,
    lineColour: THREE.Color = new THREE.Color(0x000000)
  ) {
    this.connections = connections;
    this.scene = scene;
    this.group = new THREE.Group();
    this.wireframe = wireframe;
    this.drawBalls = drawBalls;
    this.colour = colour;
    this.scale = scale;
    this.lineColour = lineColour;

    this.vertices = this.mapVerticesToVector3(vertices);
    this.init();

    this.group.add(this.mesh);
  }

  /**
   * Initialises/Resets the current shape.
   */
  init() {
    var temp: number[] = [];
    for (let i = 0; i < this.connections.length; i++) {
      for (let j = 0; j < this.connections[i].length; j++) {
        temp.push(this.vertices[this.connections[i][j]].x);
        temp.push(this.vertices[this.connections[i][j]].y);
        temp.push(this.vertices[this.connections[i][j]].z);
      }
    }

    const vertices = new Float32Array(this.connections.length * 9); // Buffer geometry wants a typed array so we convert
    for (let k = 0; k < temp.length; k++) {
      vertices[k] = temp[k];
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));

    this.geometry = geometry;

    this.material = new THREE.MeshStandardMaterial({
      color: this.colour,
      side: THREE.DoubleSide,
    });
    // @ts-ignore Typescript does not like material being passed here even though it works.
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.castShadow = true;

    if (!this.wireframe) {
      this.group.add(this.mesh);
    }
    // Add additional details to the shape.
    if (this.drawBalls) {
      this.addSpheresToVertices(0.05);
    }

    this.addLinesToEdges();

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

      const collisions = collidesWith(point, normal, this.scene, 0);
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
  mapVerticesToVector3(vertices): THREE.Vector3[] {
    var vertexes: THREE.Vector3[] = [];
    // const vertices = this.geometry.attributes.position.array;

    for (let i = 0; i < vertices.length; i += 3) {
      vertexes.push(
        new THREE.Vector3(vertices[i] * this.scale, vertices[i + 1] * this.scale, vertices[i + 2] * this.scale)
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
    const ball_material = new THREE.MeshStandardMaterial({ color: colour });
    // @ts-ignore TypeScript has a whine about the material type when it does not matter.
    const ball_mesh = new THREE.Mesh(ball, ball_material);

    // Create a new ball and place it at the position of each vertex.
    this.vertices.forEach((vertex) => {
      const newBall = ball_mesh.clone();
      newBall.position.x = vertex.x;
      newBall.position.y = vertex.y;
      newBall.position.z = vertex.z;
      this.group.add(newBall);
    });
  }

  /**
   * Adds a vertex to the CustomShape.
   *
   * @param point - The THREE.Vector3 representing the coordinates of the vertex to be added.
   */
  addVertex(point: THREE.Vector3) {
    // Find the two closest vertices to the point being added
    const closest = findClosestThreeVertices(this.vertices, point);

    // Check if there are any other vertices with the same distance from the point being added.
    // This way we can connect more than 1 edge at a time.
    const validVertices = checkForVerticesWithSameDistance(
      this.vertices,
      point
    );

    const oldGeometry = this.geometry; // if we need to revert back to the old geometry.

    const vertices = [...this.vertices]; // Add the new vertex to the list of vertices

    // Convert connections to a flat array
    const newConnections = this.convertConnections(this.connections);
    const newIndex = vertices.length; // Index for the new vertex to take.

    // Determine which vertices wil be used to form connections.
    var connections: number[];
    var combinations: any;
    if (validVertices.length > 2) {
      // Use multiple edges if we can
      connections = validVertices;
      combinations = generateCombinations(validVertices, 2); // Generate all possible combinations of two valid vertices.

      for (let i = 0; i < combinations.length; i++) {
        newConnections.push(combinations[i][0], combinations[i][1], newIndex);
      }
    } else {
      connections = closest; //Otherwise just use the two closest vertices.
      combinations = generateCombinations(closest, 2);
      for (let i = 0; i < combinations.length; i++) {
        newConnections.push(combinations[i][0], combinations[i][1], newIndex);
      }
    }

    // Validate that the connections are valid. Return if they are not.
    if (connections[0] === -Infinity || connections[1] === -Infinity) {
      console.error("No valid vertices to add to");
      return;
    }

    // Check connections and vertexes to make sure they are valid numbers.
    newConnections.forEach((connection) => {
      if (isNaN(connection)) {
        console.error("Invalid connection:", connection);
        return;
      }
    });

    // If the new shape is not convex, revert back to the old geometry.
    if (!this.isConvex()) {
      // If the newly created shape is not convex, do not change the shape.
      console.log("Not convex");
      // @ts-ignore Typescript does not like material being passed here even though it works.
      this.mesh = new THREE.Mesh(oldGeometry, this.material);
      return;
    }

    vertices.push(point); // add point to the list of vertices

    this.removeCoveredEdge(connections); // remove connecting edges from vertices we have just covered.

    this.vertices = vertices;
    this.connections = [];
    // Convert connections array to be right form factor.
    for (let j = 0; j < newConnections.length; j += 3) {
      this.connections.push([
        newConnections[j],
        newConnections[j + 1],
        newConnections[j + 2],
      ]);
    }
    // Remove all objects from the group
    this.group.remove(...this.group.children);
    this.group.matrixAutoUpdate = true; // no idea what this does but three.js docs says its a good thing.

    // Add the mesh to the group and reinitialise the shape.
    this.init();
  }

  /**
   * Adds line to the edges of the shape.
   * Can also be used to display a shape in wife frame.
   *
   * @param colour Colour of the line. Defaults to pure black.
   */
  addLinesToEdges(colour: THREE.Color = this.lineColour) {
    const points: THREE.Vector3[] = [];

    // Go over all connections and push the vertices associated with them into the points array.
    for (let i = 0; i < this.connections.length; i++) {
      points.push(
        this.vertices[this.connections[i][0]],
        this.vertices[this.connections[i][1]],
        this.vertices[this.connections[i][2]]
      );
    }

    const material = new THREE.LineBasicMaterial({ color: colour });
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

    const line = new THREE.Line(lineGeometry, material);

    this.group.add(line);
  }

  /**
   * Removes the covered edges from the given vertices.
   * This optimising the shape as covered edges are not drawn.
   *
   * @param vertices - The vertices to remove covered edges from.
   */
  private removeCoveredEdge(vertices) {
    const covered = findGroupOfThreeIndices(this.connections, vertices);

    covered.forEach((index) => {
      this.connections.splice(index, 1);
    });
  }

  updateMesh() {}
}