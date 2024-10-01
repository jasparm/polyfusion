import * as THREE from "three";
import { ConvexGeometry } from "three/examples/jsm/geometries/ConvexGeometry.js";

import { VertexManager } from "./VertexManager.ts";
import { calculateVolume } from "./ShapeHelpers.ts";

/**
 * This class handles all aspects of CustomShape creation.
 * Also makes extensive use of the ShapeHelper.ts file.
 * Actual object which should be added to the scene is the *group* attribute.
 */
export class CustomShape {
  geometry!: THREE.BufferGeometry; // Stores the geometry of the shape
  material!: THREE.Material; // Stores the material used on the shape
  mesh!: THREE.Mesh; // Stores the combined mesh which can be added to the scene.
  group: THREE.Group; // Stores all other shapes that are part of the mesh.
  wireframe: boolean; // If the shape should be drawn as a wire frame.
  drawBalls: boolean; // If shape should have spheres on each vertex.

  layer: number = 0;

  colour: THREE.Color; // Colour of all faces in the custom shape.
  scale: number; // Scale of the shape
  lineColour: THREE.Color; // colour of the line

  vertexSize: number = 0.05; // radius of sphere to be added on vertices
  id: string; // this is used to uniquely identify a given custom shape.
  opacity: number;
  name: string = "";

  vertexManager: VertexManager;

  constructor(
    vertices: number[] = [],
    wireframe: boolean = false,
    drawBalls: boolean = true,
    colour: THREE.Color = new THREE.Color(0xff00ff),
    scale: number = 1,
    lineColour: THREE.Color = new THREE.Color(
      getComputedStyle(document.documentElement)
        .getPropertyValue("--line-colour")
        .trim()
    )
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
    this.opacity = 1;

    this.init();

    this.id = time;
    this.mesh.name = time;
  }

  /**
   * Initialises the current shape.
   */
  init() {
    const vertices = this.vertexManager.getVerticesInfo();
    const geometry = new ConvexGeometry(vertices); // This ensures a shape is always convex
    this.geometry = geometry;

    if (this.wireframe) {
      // invisible material
      this.material = new THREE.MeshBasicMaterial({
        color: this.colour,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
      });
    } else {
      this.material = new THREE.MeshStandardMaterial({
        color: this.colour,
        flatShading: true,
        side: THREE.DoubleSide,
        opacity: this.opacity,
        transparent: true ? this.opacity < 1 : false,
      });
    }

    // create a new mesh from the geometry and material
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.receiveShadow = true;

    this.group.add(this.mesh);
    // Add additional details to the shape.
    if (this.drawBalls) {
      this.addSpheresToVertices(this.vertexSize);
    }

    this.addLinesToEdges();

    this.mesh.layers.set(this.layer);
    this.group.children.forEach((child) => {
      if (child instanceof THREE.Line) {
        if (this.layer === 0) {child.layers.set(1);}
        else {
          child.layers.set(this.layer);
        }
      }
    });

    if (this.id !== undefined) {
      this.mesh.name = this.id;
    }

    return;
  }

  /**
   * Adds little spheres to the corners of the shape.
   *
   * @param radius Radius of the balls. Defaults to 0.1.
   * @param colour Colour of the balls. Defaults to black.
   */
  addSpheresToVertices(
    radius: number = 0.1,
    colour: THREE.Color = this.lineColour
  ) {
    const vertices = this.vertexManager.vertexMap;
    // Create a new ball and place it at the position of each vertex.
    vertices.forEach((vertex, id) => {
      const ball = new THREE.SphereGeometry(radius);
      const ball_material = new THREE.MeshBasicMaterial({ color: colour });
      const ball_mesh = new THREE.Mesh(ball, ball_material);
      ball_mesh.position.set(vertex.x, vertex.y, vertex.z);

      // this ensures that a ball maintains its scale by scaling by the inverse of any group scaling
      ball_mesh.onBeforeRender = () => {
        const scale = this.group.scale;
        const inverseScale = new THREE.Vector3(
          1 / scale.x,
          1 / scale.y,
          1 / scale.z
        );
        ball_mesh.scale.copy(inverseScale); // Prevent the ball from scaling with the group
      };

      ball_mesh.name = id.toString();
      ball_mesh.layers.set(2);
      this.group.add(ball_mesh);
    });
  }

  /**
   * Adds a vertex to the CustomShape.
   *
   * @param point The THREE.Vector3 representing the coordinates of the vertex to be added.
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
    // This geometry adds edges to our current shape.
    const edgeGeometry = new THREE.EdgesGeometry(this.geometry);
    const lineMat = new THREE.LineBasicMaterial({ color: colour });

    const lineSegments = new THREE.LineSegments(edgeGeometry, lineMat);

    this.group.add(lineSegments);
  }

  /**
   * Updates the wireframe status and re-draws the shape.
   * @param state
   */
  setWireFrame(state: boolean) {
    this.group.remove(...this.group.children);
    this.wireframe = state;
    this.init();
  }

  /**
   * Updates the current shape. This should be called whenever any changes are applied to the shape.
   */
  update() {
    this.group.remove(...this.group.children);
    this.group.matrixAutoUpdate = true; // no idea what this does but three.js docs says its a good thing.
    this.init();
  }

  /**
   * Creates a clone of the current CustomShape.
   * @returns A new CustomShape instance that is a copy of the current shape.
   */
  clone(): CustomShape {
    const clonedVertices = this.vertexManager
      .getVerticesInfo()
      .map((vertex) => vertex.clone());
    const clonedShape = new CustomShape(
      clonedVertices.flatMap((vertex) => [vertex.x, vertex.y, vertex.z]),
      this.wireframe,
      this.drawBalls,
      this.colour.clone(),
      this.scale,
      this.lineColour.clone()
    );
    clonedShape.vertexSize = this.vertexSize;
    clonedShape.opacity = this.opacity;
    clonedShape.name = this.name;

    clonedShape.group.scale.copy(this.group.scale);
    clonedShape.group.rotation.copy(this.group.rotation);

    clonedShape.update();

    return clonedShape;
  }

  static fromJSON(data: any): CustomShape {
    // convert vertices into flat array
    const vertices = data.vertices.flatMap((vertex: THREE.Vector3) => [
      vertex.x,
      vertex.y,
      vertex.z,
    ]);
    
    // create new CustomShape instance
    const shape = new CustomShape(
      vertices,
      data.wireframe,
      data.drawBalls,
      new THREE.Color(data.colour),
      data.scale,
      new THREE.Color(data.lineColour)
    );

    shape.id = data.id;
    shape.vertexSize = data.vertexSize;
    
    // Set shape's position
    shape.group.position.set(data.position.x, data.position.y, data.position.z);
    shape.group.rotation.set(data.rotation._x, data.rotation._y, data.rotation._z, data.rotation._order);
    shape.group.scale.copy(data.scale);
    

    shape.opacity = data.opacity;

    return shape;
  }

  /**
   * Calculates the exact volume of a custom shape.
   * Based on the Divergence Theorem: https://en.wikipedia.org/wiki/Divergence_theorem
   * For meshes, this basically just simplifies to calculating the signed volume of each triangle in the mesh.
   * 
   * @returns volume of the shape.
   *
   */
  calculateVolume() {
    return calculateVolume(this.mesh, this.group.scale);
  }
}
