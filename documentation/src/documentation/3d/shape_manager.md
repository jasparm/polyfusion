# Shape Manager
The ```ShapeManager``` class is responsible for managing and tracking custom shapes within a scene. It allows for addition, retrieval, and overall management of instances of [CustomShape](./custom_shape.md) objects, providing a way organise and keep track of shapes within a scene.

## Creating a Shape Manager
To use the ```ShapeManager```, create an instance by passing a reference to the threeJS scene which the shapes occupy.
```javascript
const shapeManager = new ShapeManager(scene);
```
The constructor takes a single argument:
- ```scene```: the threeJS scene where the shapes will be added.

## Attributes
### shapesMap
A private map that stores instances of ```CustomShape```, indexed by their unique ```id```. This allows for easy retrieval and manipulation of shapes.
### scene
Stores the threeJS ```Scene``` object passed in the constructor. This is the scene where all custom shapes managed by the ```ShapeManager``` will be added.

See [SceneManager](./scene_manager.md/#scene-manager)

## Methods
### insert(shape)
Inserts a ```CustomShape``` object into the shape manager which adds it to the scene. Each shape is stored in [shapesMap](#shapesmap) using its unique ```id``` as the key.
```javascript
shapeManager.insert(customShape);
```
- ```shape```: an instance of [CustomShape](./custom_shape.md) to be added.

### getShapeFromID(id)
Retrieves a shape from the shape manager using the shapes unique ```id```. If the shape is not found, undefined is returned.
```javascript
const shape = shapeManager.getShapeFromID("shapeID");
if (shape) {
    // Do something with the shape
}
```
- ```id```: a string representing the unique identifier of the shape.

Returns:
- The [CustomShape](./custom_shape.md) instance corresponding to the given ```id```, or ```undefined``` if not found.

### getShapes()
Returns an array of all shapes currently managed by the ShapeManager. This includes all shapes that have been inserted using the [insert()](#insertshape) method.
```javascript
const allShapes = shapeManager.getShapes();
```
Returns:
- An array of ```CustomShape``` objects which were stored in the [shapesMap](#shapesmap).