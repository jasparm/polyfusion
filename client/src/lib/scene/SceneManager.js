import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { isInsideObjects } from "../Collision.ts";
import { getCentrePoint } from "../MeshHelper.ts";
import { Controller } from "../controls/Controller.ts";
import {
  onMouseDown,
  onMouseWheelEvent,
  onMouseMove,
} from "../controls/MouseActions.ts";
import { onKeyDown, onKeyUp } from "../controls/KeyboardActions.ts";
import { ShapeManger } from "../shapes/CustomShapeManager.ts";
import { CustomShape } from "../shapes/CustomShape.ts";

export default class SceneManager {
  constructor(canvasId) {
    // NOTE: Core components to initialize Three.js app.
    this.scene = undefined;
    this.camera = undefined;
    this.renderer = undefined;

    // NOTE: Camera params;
    this.fov = 75;
    this.nearPlane = 1;
    this.farPlane = 1000;
    this.canvasId = canvasId;

    this.controls = undefined;
    this.stats = undefined; // for tracking FPS and performance

    this.shapeManger = undefined; // manages shapes for us
  }

  init() {
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      this.fov,
      window.innerWidth / window.innerHeight,
      1,
      500
    );
    this.camera.position.set(0, 0, 10);
    this.camera.layers.enable(0); // default layer for meshes
    this.camera.layers.enable(1); // this is the layer for lines on meshes
    this.camera.layers.enable(2); // this is the layer for balls on vertices

    // Specify a canvas which is already in the HTML
    const canvas = document.getElementById(this.canvasId);
    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
    });
    this.renderer.shadowMap.enabled = true;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    // Add controls
    // this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    // Comment out to enable/disable performance tracker
    this.stats = Stats();
    document.body.appendChild(this.stats.dom);

    this.shapeManger = new ShapeManger(this.scene);
    const controller = new Controller(
      this.scene,
      this.camera,
      this.renderer,
      this.shapeManger
    );

    // Event listeners
    window.addEventListener("resize", () => this.onWindowResize(), false);
    this.renderer.domElement.addEventListener("pointermove", (e) =>
      onMouseMove(e, controller)
    );
    this.renderer.domElement.addEventListener("mousedown", (e) =>
      onMouseDown(e, controller)
    );
    this.renderer.domElement.addEventListener("wheel", (e) =>
      onMouseWheelEvent(e, controller)
    );

    const keyStates = {};
    // Keyboard related events
    window.addEventListener("keydown", (e) => {
      const key = e.key;
      // CHeck if the key is already pressed,this ensures it will only be called once.
      if (!keyStates[key]) {
        keyStates[key] = true;
        onKeyDown(e, controller);
      }
    });

    window.addEventListener("keyup", (e) => {
      const key = e.key;
      // Check if the key was previously pressed
      if (keyStates[key]) {
        keyStates[key] = false;
        onKeyUp(e, controller);
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

    const inside = isInsideObjects(
      getCentrePoint(this.sphere),
      [this.octahedron],
      this.scene
    );
    if (inside) {
      this.sphere.material = new THREE.MeshStandardMaterial({
        color: 0x00ff00,
      });
    } else {
      this.sphere.material = new THREE.MeshStandardMaterial({
        color: 0xff0000,
      });
    }
  }

  onWindowResize() {
    // updates window/renderer aspect ratio when the window is resized.
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  add(object) {
    if (object instanceof CustomShape) {
      this.shapeManger.insert(object);
      return;
    }
    this.scene.add(object);
  }
}
