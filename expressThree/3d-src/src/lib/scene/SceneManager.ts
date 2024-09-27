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
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { ButtonHandler } from "../sidebar/ButtonHandler.ts";


export default class SceneManager {
  // NOTE: Core components to initialize Three.js app.
  private scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  renderer!: THREE.WebGLRenderer;

  fov: number;
  nearPlane: number;
  farPlane: number;
  canvasId: string;

  controls!: OrbitControls;
  stats: any;

  controller!: Controller;

  buttonHandler!: ButtonHandler;

  private width: number = 0;
  private height: number = 0;

  // Lights
  ambientLight: THREE.AmbientLight | undefined;
  directionalLight: THREE.DirectionalLight | undefined;

  private parent!: HTMLElement

  shapeManager!: ShapeManager; // this manages shapes for this scene

  constructor(canvasId: string) {
    // NOTE: Camera params;
    this.fov = 45;
    this.nearPlane = 1;
    this.farPlane = 10000;
    this.canvasId = canvasId;

  }

  init() {
    this.scene = new THREE.Scene();

    const backColor = getComputedStyle(document.documentElement).getPropertyValue('--background-colour');
    this.scene.background = new THREE.Color(backColor.trim());

    const gridHelper = new THREE.GridHelper(100, 50);
    gridHelper.layers.set(3); // make this object visible, but not found by ray casts
    this.scene.add(gridHelper);

    // Specify a canvas which is already in the HTML
    const canvas = document.getElementById(this.canvasId);
    if (!canvas) {
      return;
    }
    const parent = canvas.parentElement;
    if (!parent) {
      return;
    }

    this.parent = parent;

    if (canvas === null) {
      // @TODO
      // deal with this
      return;
    }
    const width = parent.parentElement?.clientWidth ?? window.innerWidth;
    this.width = width;
    const height = window.innerHeight - parent.offsetHeight  || window.innerHeight;
    this.height = height;
    // Camera
    this.camera = new THREE.PerspectiveCamera(
      this.fov,
      width / height,
      this.nearPlane,
      this.farPlane
    );

    this.camera.position.set(10, 5, -10);
    this.camera.layers.enable(0); // default layer for meshes
    this.camera.layers.enable(1); // this is the layer for lines on meshes
    this.camera.layers.enable(2); // this is the layer for balls on vertices
    this.camera.layers.enable(3); // this is the layer for everything that should be visible in the scene but not intractable
    this.camera.layers.disable(4); // this is the layer for everything monte carlo related;
    this.camera.lookAt(0, 0, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
    });
    
    this.renderer.shadowMap.enabled = true;
    this.renderer.setSize(width, height);
    parent.appendChild(this.renderer.domElement);

    // Comment out to enable/disable performance tracker
    // this.stats = new Stats();
    // document.body.appendChild(this.stats.dom);
    this.buttonHandler = new ButtonHandler(this);
    this.shapeManager = new ShapeManager(this.scene);

    const controller = new Controller(
      this.scene,
      this.camera,
      this.renderer,
      this.shapeManager,
      this.buttonHandler
    );
    
    this.buttonHandler.controller = controller;

    this.controller = controller;


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
      onMouseMove(e, controller)
    );
    this.renderer.domElement.addEventListener("mousedown", (e) =>
      onMouseDown(e, controller)
    );
    this.renderer.domElement.addEventListener("wheel", (e) =>
      onMouseWheelEvent(e, controller)
    );
    this.renderer.domElement.addEventListener('contextmenu', function(event) {
      event.preventDefault(); // prevent the default right-click menu from appearing
    })

    const keyStates: { [key: string]: boolean } = {};
    // Keyboard related events
    window.addEventListener("keydown", (e) => {
      const key: string = e.key;
      // Check if the key is already pressed,this ensures it will only be called once.
      if (!keyStates[key]) {
        keyStates[key] = true;
        onKeyDown(e, controller);
      }
      whileKeyDown(e, controller);
    });

    window.addEventListener("keyup", (e: KeyboardEvent) => {
      const key: string = e.key;
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
    // this.stats.update();
  }

  render() {
    this.scene.updateMatrixWorld(true);
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    const width = this.parent.parentElement?.clientWidth ?? window.innerWidth;
    this.width = width;
    const height = this.parent.parentElement?.clientHeight ?? window.innerHeight;
    this.height = height
    // updates window/renderer aspect ratio when the window is resized.
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  add(object: THREE.Object3D | CustomShape) {
    if (object instanceof CustomShape) {
      this.shapeManager.insert(object);
      return;
    }
    this.scene.add(object);
  } 

  // Returns the private scene element.
  getScene() : THREE.Scene {
    return this.scene
  }
  
}
