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

    // convert the intersection back into a mesh
    const mesh = CSG.toMesh(resultShape, objects[0].mesh.matrix);
    const intersectionWorldPosition = mesh.getWorldPosition(new THREE.Vector3());

    console.log(intersectionWorldPosition);
    // Set the mesh position to the intersection world position

    const intersectionVolume = calculateVolume(mesh);
    const customShape = this.createCustomShapeFromMesh(mesh, objects[0].group.position);

    // Add the custom shape to the scene
    this.scene.add(customShape);
    const pos = objects[0].group.position
    customShape.group.position.set(pos.x, pos.y, pos.z)
   

    return { intersectionVolume, customShape };
    }

    createCustomShapeFromMesh(mesh: THREE.Mesh, position: THREE.Vector3) {
      const vertices = Array.from(mesh.geometry.getAttribute('position').array);
      const negatedVertices = [];

      if (vertices) {
        for (let i = 0; i < vertices.length; i += 3) {
          negatedVertices.push(//@ts-ignore
            vertices[i] - position.x,//@ts-ignore
            vertices[i + 1] - position.y,//@ts-ignore
            vertices[i + 2] - position.z
          );
        }
      }

      return new CustomShape(negatedVertices, false, false, new THREE.Color(0x000000));
    }

}
