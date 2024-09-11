# Custom Shapes
The ```CustomShape``` class manages the creation and rendering of all custom convex shapes. This class allows for generation of shapes with specific geometry, material, and other visual elements.

A CustomShape object should be added to any scene using its group attribute. However, they can also be added directly using the [SceneManager](./scene_manager.md)

## Creating a Custom Shape
```javascript
const vertices = [/* array of vertex positions*/];
const customShape = new CustomShape(vertices);
```
This shape can then be added
```javascript
var scene: SceneManager;
scene.add(customShape);
```
The constructor takes many optional parameters:
- ```vertices```: an array of vertex coordinates. Format expected is [x1, y1, z1, x2, y2, z2, ... xn, yn, zn] (default: ```[]```)
- ```wireframe```: boolean to enable wireframe mode (default: ```false```)
- ```drawBalls```: boolean to draw spheres on vertices (default: ```true```)
- ```colour```: the colour of the shape (default: ```0xff00ff```)
- ```scale```: the scale of the shape (default: ```1```)
- lineColour: the colour of the edge lines (default ```0x000000```)
## Attributes
### geometry
The geometry of the shape which is created using the threeJS class ```ConvexGeometry``` which ensures the shape is convex.
### material
The material which is applied to the shape. This changes depending on which colour is used and if wireframe is enabled.
### mesh
A ```THREE.MESH``` which takes the geometry and material to create a shape. This is added to the ```group``` and is the main visual representation of the shape.
### group
A ```THREE.Group``` containing the shape's mesh, vertex spheres, and edge lines. This is what should be added to a scene (if need to be done so manually)
```javascript
scene.add(customShape.group)
```
## Methods
### init()
Initialises or resets the shape. This method recreates the geometry, material, and mesh and then adds them back into the group. It also adds vertex spheres and edge lines if they are enabled.
```javascript
customShape.init();
```
### addSpheresToVertices(radius, colour)
Adds spheres to the vertices of the shape. The radius of the spheres and their colour can be customized.
```javascript
customShape.addSpheresToVertices(0.05, new THREE.Color(0x000000));
```
### addVertex(point)
Adds a new vertex to the shape at the provided point and reinitialises the mesh
```javascript
customShape.addVertex(new THREE.Vector3(1, 1, 1));
```
### addLinesToEdges(colour)
Adds lines connecting the edges of the shape. The colour of these lines can be customised.
```javascript
customShape.addLinesToEdges(new THREE.Color(0x00ff00));
```
### setWireFrame(state)
Enables or disables wireframe rendering. It will also re-render the shape to ensure effects are performed immediately.
```javascript
customShape.setWireFrame(true);
```