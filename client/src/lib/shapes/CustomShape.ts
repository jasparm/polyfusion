import * as THREE from "three";
import { ConvexGeometry } from "three/addons/geometries/ConvexGeometry.js";


import { VertexManager } from "./VertexManager.ts";

/**
 * This class handles all aspects of CustomShape creation.
 * Also makes extensive use of the ShapeHelper.ts file.
 * Actual object which should be added to the scene is the *group* attribute.
 */
export class CustomShape {
  geometry: THREE.BufferGeometry; // Stores the geometry of the shape
  material: THREE.Material; // Stores the material used on the shape
  mesh: THREE.Mesh; // Stores the combined mesh which can be added to the scene.
  group: THREE.Group; // Stores all other shapes that are part of the mesh.
  wireframe: boolean; // If the shape should be drawn as a wire frame.
  drawBalls: boolean; // If shape should have spheres on each vertex.

  colour: THREE.Color; // Colour of all faces in the custom shape.
  scale: number; // Scale of the shape
  lineColour: THREE.Color; // colour of the line

  vertexSize: number = 0.05; // radius of sphere to be added on vertices
  id: string; // this is used to uniquely identify a given custom shape.

  vertexManager: VertexManager;

  constructor(
    vertices: number[] = [],
    wireframe: boolean = false,
    drawBalls: boolean = true,
    colour: THREE.Color = new THREE.Color(0xff00ff),
    scale: number = 1,
    lineColour: THREE.Color = new THREE.Color(0x000000)
  ) {
    const time = `${Date.now()}`;
    this.group = new THREE.Group();
    this.wireframe = wireframe;
    this.drawBalls = drawBalls;
    this.colour = colour;
    this.scale = scale;
    this.lineColour = lineColour;

    this.vertexManager = new VertexManager(time);
    this.vertexManager.init(vertices);

    this.init();

    this.id = time;
    this.mesh.name = time;

    this.group.add(this.mesh);
  }

  /**
   * Initialises/Resets the current shape.
   */
  init() {
    const vertices = this.vertexManager.getVerticesInfo();
    const geometry = new ConvexGeometry(vertices); // This ensures a shape is always convex
    this.geometry = geometry;

    this.material = new THREE.MeshStandardMaterial({
      color: this.colour,
      flatShading: true
    });

    // @ts-ignore Typescript does not like material being passed here even though it works.
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    if (!this.wireframe) {
      this.group.add(this.mesh);
    }
    // Add additional details to the shape.
    if (this.drawBalls) {
      this.addSpheresToVertices(this.vertexSize);
    }

    this.addLinesToEdges();

    this.mesh.layers.set(0);
    this.group.children.forEach((child) => {
      if (child instanceof THREE.Line) {
        child.layers.set(1);
      }
    });

    if (this.id !== undefined) {
      this.mesh.name = this.id;
    }

    return;
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
        new THREE.Vector3(
          vertices[i] * this.scale,
          vertices[i + 1] * this.scale,
          vertices[i + 2] * this.scale
        )
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
    const vertices = this.vertexManager.vertexMap;
    // Create a new ball and place it at the position of each vertex.
    vertices.forEach((vertex, id) => {
      const ball = new THREE.SphereGeometry(radius);
      const ball_material = new THREE.MeshBasicMaterial({ color: colour });
      const ball_mesh = new THREE.Mesh(ball, ball_material);
      // @ts-ignore
      ball_mesh.position.x = vertex.x; // @ts-ignore
      ball_mesh.position.y = vertex.y; // @ts-ignore
      ball_mesh.position.z = vertex.z;
      ball_mesh.name = id.toString();
      ball_mesh.layers.set(2);

      this.group.add(ball_mesh);
    });
  }

  /**
   * Adds a vertex to the CustomShape.
   *
   * @param point - The THREE.Vector3 representing the coordinates of the vertex to be added.
   */
  addVertex(point: THREE.Vector3) {
    this.vertexManager.add(point);

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
    if (!this.geometry) {
      return;
    }
    //@ts-ignore edges geometry has broken as types
    const edgeGeometry = new THREE.EdgesGeometry(this.geometry);
    const lineMat = new THREE.LineBasicMaterial({color: colour});

    const lineSegments = new THREE.LineSegments(edgeGeometry, lineMat);

    this.group.add(lineSegments);
  }


  updateMesh() {}
}
