import * as THREE from '/three/three.module.js';
import { OrbitControls, TransformControls } from "three/examples/jsm/Addons.js";
import { ControllerState, MovementState } from "./ControllerStates.js";
import { CustomShape } from "../shapes/CustomShape.js";
import { ContextMenu } from "../context-menu/contextmenu.js";
/**
 * Controller class looks after all player controls including their interaction with other objects.
 */
export class Controller {
    scene;
    camera;
    mouse;
    selectedGroup;
    selectedVertex;
    renderer;
    // different types of controls we have in our scene at any given time.
    orbitControls; // controls that are used to move the camera
    transformControls; // controls that are used to move shapes within the scene
    state;
    movementState;
    checkForShapes; // this can be disabled if we want to temporarily disable shape checking
    raycaster;
    insertingSphere;
    insertDistance = 1;
    multiSelection = false;
    shapeManager;
    contextMenu;
    undoManager;
    constructor(scene, camera, renderer, shapeManager) {
        this.scene = scene;
        this.camera = camera;
        this.mouse = new THREE.Vector2();
        this.state = ControllerState.Normal;
        this.renderer = renderer;
        this.initControls();
        this.selectedVertex = null;
        this.contextMenu = new ContextMenu();
        this.shapeManager = shapeManager;
        this.movementState = MovementState.Transform; // default selection state is transform
        this.raycaster = new THREE.Raycaster();
        this.raycaster.layers.enable(0); // this is the layer that custom shape meshes live on.
        this.raycaster.layers.enable(2); // this is the layer that vertex spheres live on
        this.checkForShapes = true;
        // this.undoManager = undoManager;
    }
    initControls() {
        // Orbit controls are the default controls for the environment when nothing is selected.
        this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
        this.transformControls = new TransformControls(this.camera, this.renderer.domElement);
        this.scene.add(this.transformControls);
        this.transformControls.addEventListener('mouseUp', (event) => {
            this.undoManager.saveState();
        });
    }
    /**
     * Given the current state, return the controls which are in use.
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
        this.selectedGroup?.children.forEach((child) => {
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
        if (this.selectedGroup) {
            this.transformControls.attach(this.selectedGroup);
        }
        if (state === MovementState.Transform) {
            this.transformControls.setMode("translate");
        }
        else if (state === MovementState.Rotate) {
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
    getMousePosition(event, renderer) {
        event.preventDefault();
        const canvasBounds = renderer.domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2();
        mouse.setX(((event.clientX - canvasBounds.left) / canvasBounds.width) * 2 - 1);
        mouse.setY(-((event.clientY - canvasBounds.top) / canvasBounds.height) * 2 + 1);
        this.mouse = mouse;
    }
    checkForSelection(performSelection) {
        if (!this.checkForShapes) {
            return;
        }
        const intersects = this.listIntersections();
        // for some reason when nothing is selected, there are still 3 intersections
        if (intersects.length <= 3) {
            this.unselectShapes();
        }
        let foundGroup = false;
        let selectedVertex = false;
        var parentGroup;
        for (let i = 0; i < intersects.length; i++) {
            const intersect = intersects[i];
            if (!intersect)
                continue; // if there are no intersects, skip this iteration
            const object = intersect.object;
            parentGroup = object.parent;
            while (parentGroup && !(parentGroup instanceof THREE.Group)) {
                parentGroup = parentGroup.parent;
            }
            if (object instanceof THREE.Mesh &&
                !selectedVertex &&
                object.geometry instanceof THREE.SphereGeometry &&
                parentGroup && performSelection) {
                if (!performSelection) {
                    return parentGroup;
                }
                selectedVertex = true;
                this.selectedVertex = object;
                this.selectedGroup = parentGroup;
                this.selectVertex(object);
                return;
            }
            // We have selected a custom shape
            if (parentGroup && !foundGroup) {
                if (!performSelection) {
                    return parentGroup;
                }
                this.selectedGroup = parentGroup;
                this.orbitControls.enabled = false;
                this.selectShape();
                foundGroup = true;
                return;
            }
        }
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
        this.selectedGroup?.children.forEach((child) => {
            if (!(child instanceof THREE.Mesh)) {
                // if selected child is not a mesh, ignore it
                return;
            }
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
        const camera_pos = this.camera.position;
        var dir = vector.sub(camera_pos);
        var distance = this.insertDistance;
        var pos = camera_pos.clone().add(dir.multiplyScalar(distance));
        if (this.insertingSphere) {
            this.insertingSphere.position.set(pos.x, pos.y, pos.z);
        }
    }
    /**
     * Called when the vertex to be inserted is now ready to be inserted. By default this is done when mouse0 is pressed.
     */
    finaliseInsertion() {
        const position = new THREE.Vector3();
        if (this.insertingSphere) {
            this.insertingSphere.getWorldPosition(position);
        }
        const shape = this.getCustomShape();
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
        if (this.insertingSphere) {
            this.scene.remove(this.insertingSphere);
        }
        this.state = ControllerState.Normal;
        this.undoManager.saveState();
    }
    selectVertex(object) {
        const id = Number(object.name);
        const customShape = this.getCustomShape();
        if (!customShape) {
            return;
        }
        const shapeID = customShape.mesh.name;
        // with above information, we can get the information of the correct vertex.
        const shape = this.shapeManager.getShapeFromID(shapeID);
        if (!shape) {
            return;
        }
        const vertex = shape.vertexManager.getVertexFromID(id); // this is the vertex instance.
        shape.vertexManager.selectVertex(id);
        shape.vertexManager.colourSelectedVertices();
        // console.log(object.material.color = new THREE.Color(100, 100, 100));
        // console.log(vertex);
    }
}
