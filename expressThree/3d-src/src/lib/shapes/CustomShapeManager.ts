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
   * Removes a shape from the shape manager and the scene.
   * @param id
   */
  remove(id: string): boolean {
    const shape = this.shapesMap.get(id);
    if (shape) {
      this.scene.remove(shape.group);
      this.shapesMap.delete(id);
      return true;
    }
    return false;
  }

  /**
   * Given an ID, returns the instance of that shape in the scene.
   * If the shape is not in the scene, returns undefined.
   * @param id
   */
  getShapeFromID(id: string): CustomShape | undefined {
    return this.shapesMap.get(id);
  }

  /**
   * Returns an array of all shapes currently managed by
   * this shape manager.
   * @returns 
   */
  getShapes(): CustomShape[] {
    let shapes: CustomShape[] = [];
    this.shapesMap.forEach((value, key) => {
      shapes.push(value)
    });
    return shapes;
  }

  /**
   * Clears all shapes from the shape manager and the scene.
   */
  clearAllShapes() {
    this.shapesMap.forEach((shape) => {
      this.scene.remove(shape.group);
    });
    this.shapesMap.clear();
  }
}
