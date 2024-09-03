import * as THREE from "three";
import { OrbitControls, TransformControls } from "three/examples/jsm/Addons.js";
import { ControllerState, MovementState } from "./ControllerStates.ts";

/**
 * Controller class looks after all player controls including their interaction with other objects.
 */
export class Controller {
  scene: THREE.Scene;
  camera: THREE.Camera;
  mouse: THREE.Vector2;
  selectedGroup: THREE.Group;
  renderer: THREE.WebGLRenderer;

  // different types of controls we have in our scene at any given time.
  orbitControls: OrbitControls; // controls that are used to move the camera
  transformControls: TransformControls; // controls that are used to move shapes within the scene

  state: ControllerState;
  movementState: MovementState;

  raycaster: THREE.Raycaster;

  constructor(
    scene: THREE.Scene,
    camera: THREE.Camera,
    renderer: THREE.WebGLRenderer
  ) {
    this.scene = scene;
    this.camera = camera;
    this.mouse = new THREE.Vector2();
    this.state = ControllerState.Normal;
    this.renderer = renderer;
    this.initControls();

    this.movementState = MovementState.Transform; // default selection state is transform

    this.raycaster = new THREE.Raycaster();
    this.raycaster.layers.enable(0); // this is the layer that custom shape meshes live on.
    this.raycaster.layers.enable(2); // this is the layer that vertex spheres live on
  }

  private initControls() {
    // Orbit controls are the default controls for the environment when nothing is selected.
    this.orbitControls = new OrbitControls(
      this.camera,
      this.renderer.domElement
    );
    this.transformControls = new TransformControls(
      this.camera,
      this.renderer.domElement
    );

    this.scene.add(this.transformControls);
  }

  getControls() {
    switch (this.state) {
      case ControllerState.Normal:
        return this.orbitControls;

      default:
        break;
    }
  }

  /**
   * Selects a shape and sets the appropriate transformation mode for the shape.
   * This method is used to select a shape and update the transformation controls accordingly.
   * The transformation mode is determined based on the current movement state.
   */
  selectShape() {
    const state = this.movementState;
    // we could add options here for changing controls depending on what is selected
    this.transformControls.attach(this.selectedGroup);
    if (state === MovementState.Transform) {
      this.transformControls.setMode("translate");
    } else if (state === MovementState.Rotate) {
      this.transformControls.setMode("rotate");
    }

    this.state = ControllerState.ShapeSelected;
  }

  /**
   * Detaches the transform controls and enables orbit controls.
   * Sets the controller state to normal.
   */
  unselectShapes() {
    this.transformControls.detach();
    this.orbitControls.enabled = true;

    this.state = ControllerState.Normal;
  }

  /**
   * Gets the current position of the mouse within the screen.
   * Best to be added as an event listener for pointer/mouse movements.
   * Mouse coordinates are normalised from -1 to +1
   * @param event
   * @param renderer
   */
  getMousePosition(event, renderer: THREE.WebGLRenderer): void {
    const canvas = renderer.domElement;
    const rect = canvas.getBoundingClientRect();

    const mouse = new THREE.Vector2();
    mouse.setX(((event.clientX - rect.left) / rect.width) * 2 - 1);
    mouse.setY(-((event.clientY - rect.top) / rect.height) * 2 + 1);

    this.mouse = mouse;
  }

  checkForSelection(): void {
    const intersects = this.listIntersections();
    // for some reason when nothing is selected, there are still 3 intersections
    if (intersects.length <= 3) {
      this.unselectShapes();
    }

    let foundGroup = false;
    var parentGroup;
    intersects.forEach((intersect) => {
      const object: THREE.Object3D = intersect.object;

      parentGroup = object.parent;
      while (parentGroup && !(parentGroup instanceof THREE.Group)) {
        parentGroup = parentGroup.parent;
      }

      // We have selected a custom shape
      if (parentGroup && !foundGroup) {
        this.selectedGroup = parentGroup;
        this.orbitControls.enabled = false;
        this.selectShape();
        foundGroup = true;
        return;
      }
    });
  }

  /**
   * Lists the objects which the raycaster interacts with at the current mouse position.
   * @returns
   */
  listIntersections() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children);

    return intersects;
  }
}
