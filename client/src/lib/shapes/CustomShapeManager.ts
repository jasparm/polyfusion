import { CustomShape } from "./CustomShape.ts";
import * as THREE from "three";

/**
 * This class is very important for keeping track of custom shapes.
 * Otherwise there is no real way of getting an instance of a custom shape.
 */
export class ShapeManager {
  private shapesMap: Map<string, CustomShape>;
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.shapesMap = new Map();
  }

  /**
   * Inserts a shape into the shape manager.
   * @param shape
   */
  insert(shape: CustomShape) {
    this.shapesMap.set(shape.id, shape);
    this.scene.add(shape.group);
  }

  /**
   * Given an ID, returns the instance of that shape in the scene.
   * If the shape is not in the scene, returns undefined.
   * @param id
   */
  getShapeFromID(id: string): CustomShape | undefined {
    return this.shapesMap.get(id);
  }
}
