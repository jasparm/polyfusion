import * as three from 'three';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import WebGL from 'three/addons/capabilities/WebGL.js';
import { AxesHelper } from 'three';

// the scene is where all three.js objects will live
const scene = new three.Scene();

// camera for viewing our 3d scene
const cam = new three.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
cam.position.set(0,0,10)
cam.lookAt(0, 0, 0);


// renderer is what actually renders a 3d environment
const renderer = new three.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight); // set the size to be the size of the current browser window
document.body.appendChild(renderer.domElement);

// camera controller for moving camera around
// const cam_controls = new FlyControls(cam, renderer.domElement)
// cam_controls.dragToLook = true
// cam_controls.rollSpeed = 0.01
// cam_controls.movementSpeed = 0.5

// material which will be used for rendering
const mat = new three.MeshBasicMaterial({color: 0xfcba03})
// geometry which will be drawn
var geometry = new three.SphereGeometry(2, 10, 6)
// here we define a line which will give us a wire-frame effect when drawing the geometry
var line = new three.Line(geometry, mat)

// controller for moving the object around
const object_controls = new TransformControls(cam, renderer.domElement)

object_controls.attach(line) // attach the controls to the object being drawn

const axesHelper = new three.AxesHelper(10);
axesHelper.setColors(new three.Color(1,0,0), new three.Color(0,1,0), new three.Color(0,0,1))


// add objects to the scene
// scene.add(line);
// scene.add(object_controls);
scene.add(cam)

function animate() {
    // animate current scene
    requestAnimationFrame(animate);
    renderer.render(scene, cam);

    if (rotationAnimation) {
        line.rotation.x += 0.01
        line.rotation.y += 0.01
    }

    // could also update render size in here so if the window size has changed it will be updated accordingly

}

document.addEventListener("keydown", onDocumentKeyDown, false);
// document.addEventListener("mousedown", onMouseDown, false)
var axesEnabled = false;
var rotationAnimation = false;
var showControls = false;

function onDocumentKeyDown(event) {
    const keyCode = event.which;
    console.log(keyCode)
    if (keyCode == 82) {
        object_controls.setMode("rotate")
    }
    if (keyCode == 84) {
        object_controls.setMode("translate")
    }
    if (keyCode == 88) {
        if (axesEnabled == false){
            scene.add(axesHelper)
            axesEnabled = true
        }
        else {
            scene.remove(axesHelper)
            axesEnabled = false
        }
    }
    if (keyCode == 49) {
        object_controls.detach(line)
        scene.remove(line)
        geometry = new three.BoxGeometry(2, 2, 2)
        line = new three.Line(geometry, mat)
        
        object_controls.attach(line)
        scene.add(line)
    }

    if (keyCode == 50) {
        // add a sphere
        object_controls.detach(line)
        scene.remove(line)
        geometry = new three.SphereGeometry(2, 10, 6)
        line = new three.Line(geometry, mat)
        
        object_controls.attach(line)
        scene.add(line)
    }

    if (keyCode == 51) {
        object_controls.detach(line)
        scene.remove(line)
        geometry = new three.ConeGeometry(1, 2, 16)
        line = new three.Line(geometry, mat)
        
        object_controls.attach(line)
        scene.add(line)
    }

    if (keyCode == 52) {
        object_controls.detach(line)
        scene.remove(line)
        geometry = new three.CapsuleGeometry(1,2, 5, 16)
        line = new three.Line(geometry, mat)
        
        object_controls.attach(line);
        scene.add(line);    
    }

    if (keyCode == 38 && !rotationAnimation) {
        const mode = object_controls.getMode()
        if (mode == "rotate"){ line.rotation.x -= 0.1 }
        else if (mode == "translate") { line.translateY(0.1)}
        
    }

    if (keyCode == 40 && !rotationAnimation) {
        const mode = object_controls.getMode()
        if (mode == "rotate"){ line.rotation.x += 0.1 }
        else if (mode == "translate") { line.translateY(-0.1)}
    }

    if (keyCode == 37 && !rotationAnimation) {
        const mode = object_controls.getMode()
        if (mode == "rotate"){ line.rotation.y -= 0.1 }
        else if (mode == "translate") { line.translateX(-0.1)}
    }

    if (keyCode == 39 && !rotationAnimation) {
        const mode = object_controls.getMode()
        if (mode == "rotate"){ line.rotation.y += 0.1 }
        else if (mode == "translate") { line.translateX(0.1)}
    }

    if (keyCode == 32) {
        rotationAnimation = !rotationAnimation
    }

    if (keyCode == 81) {
        if (showControls) {
            showControls = false;
            scene.remove(object_controls)
        }
        else{
            showControls = true;
            object_controls.attach(line)
            scene.add(object_controls);
        }
    }


}



animate();