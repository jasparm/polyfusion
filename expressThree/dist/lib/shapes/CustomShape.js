import * as THREE from '/three/three.module.js';
// FIX BEN
import { ConvexGeometry } from "../geometries/ConvexGeometry.js";
import { VertexManager } from "./VertexManager.js";
/**
 * This class handles all aspects of CustomShape creation.
 * Also makes extensive use of the ShapeHelper.ts file.
 * Actual object which should be added to the scene is the *group* attribute.
 */
export class CustomShape {
    geometry; // Stores the geometry of the shape
    material; // Stores the material used on the shape
    mesh; // Stores the combined mesh which can be added to the scene.
    group; // Stores all other shapes that are part of the mesh.
    wireframe; // If the shape should be drawn as a wire frame.
    drawBalls; // If shape should have spheres on each vertex.
    colour; // Colour of all faces in the custom shape.
    scale; // Scale of the shape
    lineColour; // colour of the line
    vertexSize = 0.05; // radius of sphere to be added on vertices
    id; // this is used to uniquely identify a given custom shape.
    opacity;
    vertexManager;
    constructor(vertices = [], wireframe = false, drawBalls = true, colour = new THREE.Color(0xff00ff), scale = 1, lineColour = new THREE.Color(0x000000)) {
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
        console.log(this.opacity);
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
        }
        else {
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
     * Adds little spheres to the corners of the shape.
     *
     * @param radius Radius of the balls. Defaults to 0.1.
     * @param colour Colour of the balls. Defaults to black.
     */
    addSpheresToVertices(radius = 0.1, colour = new THREE.Color(0x000000)) {
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
                const inverseScale = new THREE.Vector3(1 / scale.x, 1 / scale.y, 1 / scale.z);
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
    addVertex(point) {
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
    addLinesToEdges(colour = this.lineColour) {
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
    setWireFrame(state) {
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
}
