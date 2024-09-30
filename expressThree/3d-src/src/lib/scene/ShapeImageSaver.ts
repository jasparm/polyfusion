import * as THREE from "three";
import { CustomShape } from "../shapes/CustomShape.ts";

type imageSize  = {
    width: number,
    height: number
}

export default class ShapeImageShaver {
    scene: THREE.Scene;
    rendererExport: THREE.WebGLRenderer;
    imageSize: imageSize;
    camera: THREE.PerspectiveCamera;
    shape: CustomShape | null = null;

    constructor(imageSize: imageSize = { width: window.innerWidth, height: window.innerHeight }) {
        this.scene = new THREE.Scene();
        this.rendererExport = new THREE.WebGLRenderer( {antialias: true, alpha: true} );
        this.imageSize = imageSize;
        this.camera = new THREE.PerspectiveCamera(45, imageSize.width / imageSize.height, 0.01, 10000);
        this.camera.layers.enable(1); // this is the layer for lines on meshes
        this.camera.layers.enable(2); // this is the layer for balls on vertices

        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        this.scene.add(ambientLight);

        this.rendererExport.setSize(imageSize.width, imageSize.height);
        // this.rendererExport.setClearColor(0x000000, 0); // black will appear transparent
    }

    fitShapeToView() {
        if (!this.shape) {
            return;
        }

        const shapeGroup = this.shape.clone().group;
        this.scene.add(shapeGroup);

        // get bounding box of the shape
        const boundingBox = new THREE.Box3().setFromObject(shapeGroup);
        const center = boundingBox.getCenter(new THREE.Vector3());
        const size = boundingBox.getSize(new THREE.Vector3());

        // calculate the size and distance needed to fit the shape in view
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = this.camera.fov * (Math.PI / 180); // convert vertical FOV to radians
        const distance = maxDim / (2 * Math.tan(fov / 2)); // distance to fit object in view

        const offsetDistance = distance;
        this.camera.position.set(center.x + offsetDistance * 0.5, center.y + offsetDistance * 0.2, center.z + offsetDistance);
        this.camera.lookAt(center);

        // update camera aspect ratio
        this.camera.aspect = this.imageSize.width / this.imageSize.height;
        this.camera.updateProjectionMatrix();
    }

    /**
     * Takes a picture of a render of the shape an exports it.
     * @returns 
     */
    exportImage(): string | null {
        // if there is no shape to export, do not export it
        if (this.shape === null) {
            return null;
        }
        this.fitShapeToView();
        
        // Render scene with the shape and camera
        this.rendererExport.render(this.scene, this.camera);

        const dataURL = this.rendererExport.domElement.toDataURL('image/png');
        return dataURL;
        
    }
}