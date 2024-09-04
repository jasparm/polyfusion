# 3D Canvas
The 3D canvas is what contains all the information regarding the 3D environment. It is simply an element on the page which has all Three.JS content within it.

## Setup
A 3D scene is created using the SceneInit class.
This class takes a canvas HTML element and initialises a scene to fit in that canvas.
```html
<canvas id="threeJsCanvas"></canvas>
```
This canvas is then used to initialise a scene using the [SceneManger](scene_manager.md) class.
```javascript
const scene = new SceneManger("threeJsCanvas");
scene.init();
```
This will initialise a blank scene with no elements in it and will initially render just a blank scene. Don't panic if you see just this black screen now, that is correct.

More information about scenes can be found int he at [SceneManger](scene_manager.md).