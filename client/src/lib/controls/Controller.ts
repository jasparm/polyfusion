import * as THREE from "three";
import { OrbitControls, TransformControls } from "three/examples/jsm/Addons.js";
import { ControllerState, MovementState } from "./ControllerStates.ts";
import { ShapeManager } from "../shapes/CustomShapeManager.ts";
import { CustomShape } from "../shapes/CustomShape.ts";

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
  checkForShapes: Boolean; // this can be disabled if we want to temporarily disable shape checking

  raycaster: THREE.Raycaster;

  insertingSphere: THREE.Mesh;
  insertDistance: number = 1;

  shapeManager: ShapeManager;

  constructor(
    scene: THREE.Scene,
    camera: THREE.Camera,
    renderer: THREE.WebGLRenderer,
    shapeManager: ShapeManager
  ) {
    this.scene = scene;
    this.camera = camera;
    this.mouse = new THREE.Vector2();
    this.state = ControllerState.Normal;
    this.renderer = renderer;
    this.initControls();

    this.shapeManager = shapeManager;

    this.movementState = MovementState.Transform; // default selection state is transform

    this.raycaster = new THREE.Raycaster();
    this.raycaster.layers.enable(0); // this is the layer that custom shape meshes live on.
    this.raycaster.layers.enable(2); // this is the layer that vertex spheres live on

    this.checkForShapes = true;
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

  /**
   * Given the current state, return the controls which are in use.
   * @returns 
   */
  getControls() {
    switch (this.state) {
      case ControllerState.Normal:
        return this.orbitControls;

      default:
        break;
    }
  }

  getCustomShape() {
    var selected = false;
    var selectedShape;
    this.selectedGroup.children.forEach((child) => {
      const shape = this.shapeManager.getShapeFromID(child.name);

      if (shape instanceof CustomShape && !selected) {
        selectedShape = shape;
        selected = true;
      }
    });
    return selectedShape;
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
    event.preventDefault();

    const mouse = new THREE.Vector2();
    mouse.setX((event.clientX / window.innerWidth) * 2 - 1);
    mouse.setY(-(event.clientY / window.innerHeight) * 2 + 1);

    this.mouse = mouse;
  }

  checkForSelection(): void {
    if (!this.checkForShapes) {
      return;
    }

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

  /**
   * Begins the insert vertex step.
   * Sets the control start to insert and instantiates the sphere.
   */
  insertVertex() {
    this.unselectShapes();
    this.state = ControllerState.Insert;
    this.orbitControls.enabled = false;

    var sphere;
    this.selectedGroup.children.forEach((child) => {
      if (child.geometry instanceof THREE.SphereGeometry) {
        sphere = child.clone();
      }
    });
    this.scene.add(sphere);
    sphere.castShadow = true;
    this.insertingSphere = sphere;
  }

  /**
   * Looks after the position of the temporary sphere when inserting vertices
   */
  moveInsert() {
    if (this.state !== ControllerState.Insert) {
      return;
    }

    this.raycaster.setFromCamera(this.mouse, this.camera);

    var vector = new THREE.Vector3(this.mouse.x, this.mouse.y, 0.5);
    vector.unproject(this.camera);
    // @ts-ignore
    const camera_pos: THREE.Vector3 = this.camera.position;

    var dir = vector.sub(camera_pos);
    var distance = this.insertDistance;
    var pos = camera_pos.clone().add(dir.multiplyScalar(distance));

    // @ts-ignore
    this.insertingSphere.position.set(pos.x, pos.y, pos.z);
  }

  /**
   * Called when the vertex to be inserted is now ready to be inserted. By default this is done when mouse0 is pressed.
   */
  finaliseInsertion() {
    const position = new THREE.Vector3();
    this.insertingSphere.getWorldPosition(position);

    const shape: CustomShape | undefined = this.getCustomShape();
    if (!shape) {
      return;
    }
    const localPosition = shape.group.worldToLocal(position);

    shape.addVertex(localPosition);

    this.cleanupInsertion();
    
    return;
  }

  /**
   * Cleans up after inserting a new vertex.
   */
  cleanupInsertion() {
    this.orbitControls.enabled = true;
    this.scene.remove(this.insertingSphere);
    this.state = ControllerState.Normal;
  }
}
