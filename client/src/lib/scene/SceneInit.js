import * as THREE from 'three'
import { OrbitControls, ThreeMFLoader } from 'three/examples/jsm/Addons.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { collidesWith, isPartiallyInside } from '../Collision.js';
import { getCentrePoint } from '../MeshHelper.js';


// This is scuffed unless defined like this.
const pointer = new THREE.Vector2(-2, -1);
const raycaster = new THREE.Raycaster();

export default class SceneInit {
    constructor(canvasId) {
        // NOTE: Core components to initialize Three.js app.
        this.scene = undefined;
        this.camera = undefined;
        this.renderer = undefined;
    
        // NOTE: Camera params;
        this.fov = 45;
        this.nearPlane = 1;
        this.farPlane = 1000;
        this.canvasId = canvasId;

        this.controls = undefined;
        this.stats = undefined; // for tracking FPS and performance

        this.ambientLight = undefined;
        this.spotLight = undefined;

        this.box = undefined;
        this.mesh = undefined;
        this.sphere = undefined;

    }

    init() {
        this.scene = new THREE.Scene();

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            this.fov, 
            window.innerWidth / window.innerHeight, 
            1, 
            500);
        this.camera.position.set(0,0,10)
        
        // Specify a canvas which is already in the HTML
        const canvas = document.getElementById(this.canvasId);
        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
        });
        this.renderer.shadowMap.enabled = true;
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        // Add controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        // Comment out to enable/disable performance tracker
        this.stats = Stats();
        document.body.appendChild(this.stats.dom);
        
        // Event listeners
        window.addEventListener('resize', () => this.onWindowResize(), false);
        window.addEventListener('pointermove', this.onPointerMove);
    }

    animate() {
        window.requestAnimationFrame(this.animate.bind(this));
        this.render();
        this.controls.update();
        this.stats.update();
    }

    render() {
        this.scene.updateMatrixWorld(true);
        this.renderer.render(this.scene, this.camera);

        
        const inside = isPartiallyInside(getCentrePoint(this.sphere), this.box, this.scene);
        if (inside) {
            this.sphere.material = new THREE.MeshStandardMaterial({color: 0x00ff00})
        }
        else{
            this.sphere.material = new THREE.MeshStandardMaterial({color: 0xff0000})
        }

    }    

    onWindowResize() {
        // updates window/renderer aspect ratio when the window is resized.
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onPointerMove(event) {
        // Keeps track of mouse pointer position
        pointer.setX((event.clientX / window.innerWidth ) * 2 - 1);
        pointer.setY(- ( event.clientY / window.innerHeight ) * 2 + 1);
    }
}