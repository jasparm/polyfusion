# Scene Manager
The scene manager manages the scene created within a canvas. It is best to have at most one scene manager to be associated with any one canvas.

A scene manager is created using the SceneManager class.
```javascript
const scene = new SceneManager("threeJsCanvas");
scene.init();
```
The constructor takes a single argument which is the ID of the canvas which for which the scene will be placed.
## Attributes
The scene manager stores a lot of crucial information about the scene. For changes to any of these attributes, the ```init()``` method must be called.
### Camera
The camera is what gives a few into the 3D environment. By default this is a default threeJS perspective camera.
```javascript
this.camera = new THREE.PerspectiveCamera(
    this.fov,
    window.innerWidth / window.innerHeight,
    1,
    500
);
```
#### Camera FOV
FOV of the camera is by default 75. This can be changed to any non-negative number.
```javascript
scene.fov = 40; // this would update the FOV from 40 to 75.
```
### Renderer
The renderer is the element which is responsible for rendering the scene. Modifiable properties include:

- Enable/disable antialiasing
- Enable/disable shadows

### Performance tracker
The performance tracker can be enabled/disabled directly through code only by appending the ```Stats()``` function to the document.
```javascript
this.stats = Stats();
document.body.appendChild(this.stats.dom);
```

### Shape Manager
The shape manager looks after all custom shapes in the scene.

See: [Shape Manager](shape_manager.md)

### Controller
The controller looks after all user interaction. It is instantiated and looked after by the SceneManager.

See: [Controller](controller.md)

## Methods
These are the methods build into the SceneManager class.

### add(object)
The add method adds an object to the scene.
Object must be of type Object3D and be able to be added to a scene.
Example:
```javascript
const scene = new SceneManager("threeJsCanvas");
scene.init();

const shape = new CustomShape(
    scene.scene,
    verticesOfPyramid,
    indicesOfPyramid2,
    false,
    true,
    new THREE.Color(0x0000ff),
    1,
    new THREE.Color(0xffffffff)
);

scene.add(shape);
```
See: [CustomShape](custom_shape.md)
