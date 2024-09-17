/**
 * This class is very important for keeping track of custom shapes.
 * Otherwise there is no real way of getting an instance of a custom shape.
 */
export class ShapeManager {
    shapesMap;
    scene;
    constructor(scene) {
        this.scene = scene;
        this.shapesMap = new Map();
    }
    /**
     * Inserts a shape into the shape manager.
     * @param shape
     */
    insert(shape) {
        this.shapesMap.set(shape.id, shape);
        this.scene.add(shape.group);
    }
    /**
     * Given an ID, returns the instance of that shape in the scene.
     * If the shape is not in the scene, returns undefined.
     * @param id
     */
    getShapeFromID(id) {
        return this.shapesMap.get(id);
    }
    /**
     * Returns an array of all shapes currently managed by
     * this shape manager.
     * @returns
     */
    getShapes() {
        let shapes = [];
        this.shapesMap.forEach((value, key) => {
            shapes.push(value);
        });
        return shapes;
    }
}
