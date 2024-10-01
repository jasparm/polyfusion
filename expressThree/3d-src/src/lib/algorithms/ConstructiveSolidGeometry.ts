import * as THREE from "three";

import { CustomShape } from "../shapes/CustomShape.ts";
import SceneManager from "../scene/SceneManager.ts";
import { calculateVolume } from "../shapes/ShapeHelpers.ts";

export class CSGManager {
  scene: SceneManager;

  constructor(scene: SceneManager) {
    this.scene = scene;
  }

  async start(objects: CustomShape[]) {
    // have to use dynamic imports here because this library is kind of huge
    const { CSG } = await import("three-csg-ts");

    function convertShapes(shapes: CustomShape[]): ReturnType<typeof CSG.fromMesh>[] {
      let convertedShapes: ReturnType<typeof CSG.fromMesh>[] = [];
  
      // convert each custom shape mesh into a CSG
      shapes.forEach((shape) => {
        // apply world matrix to the mesh
        shape.mesh.updateMatrixWorld(true);
        const matrix = shape.mesh.matrixWorld.clone();
        shape.mesh.applyMatrix4(matrix);

        const csg = CSG.fromMesh(shape.mesh);
        
        // reset the mesh to original pos
        shape.mesh.applyMatrix4(matrix.clone().invert());

        convertedShapes.push(csg);
      });
      return convertedShapes;
    }

    const shapes = convertShapes(objects);

    // create the resultant shape from the intersection of these shapes
    let resultShape = shapes[0];

    if (!resultShape || !objects[0]) {
        throw Error("Error starting CSG calculation");
        
    }

    shapes.forEach((shape) => {
        const intersection = resultShape?.intersect(shape);

        if (intersection) {
            resultShape = intersection;
        }
    });

    const mat = new THREE.MeshBasicMaterial({color: 0xffffff})

    // convert the intersection back into a mesh
    const mesh = CSG.toMesh(resultShape, objects[0].mesh.matrix, mat);
    const intersectionVolume = calculateVolume(mesh);
    const customShape = this.createCustomShapeFromMesh(mesh);

    this.scene.add(customShape);

    return {intersectionVolume, customShape}
  }

  createCustomShapeFromMesh(mesh: THREE.Mesh) {
    const vertices = Array.from(mesh.geometry.getAttribute('position').array);

    return new CustomShape(vertices, false, false, new THREE.Color(0x000000))
    
  }

}
