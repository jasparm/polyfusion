# 3D Canvas
A 3D scene is created using the SceneInit class.
This class takes a canvas HTML element and initialises a scene to fit in that canvas.
```html
<canvas id="threeJsCanvas"></canvas>
```
This canvas is then used to initialise a scene using the SceneInit class.
```javascript
const scene = new SceneInit("threeJsCanvas");
scene.init();
```