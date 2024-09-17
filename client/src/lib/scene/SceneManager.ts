import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { Controller } from "../controls/Controller.ts";
import {
  onMouseDown,
  onMouseWheelEvent,
  onMouseMove,
} from "../controls/MouseActions.ts";
import {
  onKeyDown,
  onKeyUp,
  whileKeyDown,
} from "../controls/KeyboardActions.ts";
import { ShapeManager } from "../shapes/CustomShapeManager.ts";
import { CustomShape } from "../shapes/CustomShape.ts";
import { OrbitControls, TransformControls } from "three/examples/jsm/Addons.js";
import { UndoManager } from "./UndoManager.ts";

export default class SceneManager {
  // NOTE: Core components to initialize Three.js app.
  private scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  renderer!: THREE.WebGLRenderer;

  fov: number;
  nearPlane: number;
  farPlane: number;
  canvasId: string;

  controller!: Controller;
  stats: any;

  // Lights
  ambientLight: THREE.AmbientLight | undefined;
  directionalLight: THREE.DirectionalLight | undefined;

  shapeManager!: ShapeManager; // this manages shapes for this scene
  undoManager: UndoManager;

  constructor(canvasId: string) {
    // NOTE: Camera params;
    this.fov = 45;
    this.nearPlane = 1;
    this.farPlane = 1000;
    this.canvasId = canvasId;

    this.undoManager = new UndoManager(this);
  }

  init() {
    this.scene = new THREE.Scene();

    // Specify a canvas which is already in the HTML
    const canvas = document.getElementById(this.canvasId);

    if (canvas === null) {
      // @TODO
      // deal with this
      return;
    }

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      this.fov,
      window.innerWidth / window.innerHeight,
      this.nearPlane,
      this.farPlane
    );

    this.camera.position.set(0, 10, 0);
    this.camera.layers.enable(0); // default layer for meshes
    this.camera.layers.enable(1); // this is the layer for lines on meshes
    this.camera.layers.enable(2); // this is the layer for balls on vertices

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
    });

    this.renderer.shadowMap.enabled = true;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    // Comment out to enable/disable performance tracker
    this.stats = new Stats();
    document.body.appendChild(this.stats.dom);

    this.shapeManager = new ShapeManager(this.scene);
    this.controller = new Controller(
      this.scene,
      this.camera,
      this.renderer,
      this.shapeManager,
      this.undoManager
    );

    // Lights
    const al = new THREE.AmbientLight(0xffffff, 0.7); // ambient light
    this.ambientLight = al;
    this.scene.add(al);

    const dl: any = new THREE.DirectionalLight(0xffffff, 1); // directional light
    dl.position.set(0, 10, 0);
    dl.castShadow = true;
    this.directionalLight = dl;
    this.scene.add(dl);

    // Event listeners
    window.addEventListener("resize", () => this.onWindowResize(), false);
    this.renderer.domElement.addEventListener("pointermove", (e) =>
      onMouseMove(e, this.controller)
    );
    this.renderer.domElement.addEventListener("mousedown", (e) =>
      onMouseDown(e, this.controller)
    );
    this.renderer.domElement.addEventListener("wheel", (e) =>
      onMouseWheelEvent(e, this.controller)
    );
    this.renderer.domElement.addEventListener("contextmenu", function (event) {
      event.preventDefault(); // prevent the default right-click menu from appearing
    });

    const keyStates: { [key: string]: boolean } = {};
    // Keyboard related events
    window.addEventListener("keydown", (e) => {
      const key: string = e.key;
      // Check if the key is already pressed,this ensures it will only be called once.
      if (!keyStates[key]) {
        keyStates[key] = true;
        onKeyDown(e, this.controller);
      }
      whileKeyDown(e, this.controller);
    });

    window.addEventListener("keyup", (e: KeyboardEvent) => {
      const key: string = e.key;
      // Check if the key was previously pressed
      if (keyStates[key]) {
        keyStates[key] = false;
        onKeyUp(e, this.controller);
      }
    });
  }

  animate() {
    window.requestAnimationFrame(this.animate.bind(this));
    this.render();
    this.stats.update();
  }

  render() {
    this.scene.updateMatrixWorld(true);
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    // updates window/renderer aspect ratio when the window is resized.
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  add(object: THREE.Object3D | CustomShape, save = true) {
    if (object instanceof CustomShape) {
      this.shapeManager.insert(object);
      if (save) {
        this.undoManager.saveState();
      }

      return;
    }
    this.scene.add(object);
  }

  // Removes all custom shapes from the scene
  removeAll() {
    this.shapeManager.getShapes().forEach((shape) => {
      const object = this.scene.getObjectByName(shape.id)?.parent;
      if (object) {
        this.scene.remove(object);
      }
    });
  }

  cloneScene(): THREE.Scene {
    const scene = this.scene;
    const clone = new THREE.Scene();

    // Clone all objects in the scene
    scene.children.forEach((child) => {
      if (child instanceof CustomShape) {
        clone.add(child.clone());
      }
      
    });

    return clone;
  }

  public get sceneInfo(): THREE.Scene {
    return this.scene;
  }

  public set sceneInfo(scene: THREE.Scene) {
    this.scene = scene;
  }
}
