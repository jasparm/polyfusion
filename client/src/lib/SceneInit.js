import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';

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

        this.mesh = undefined

    }

    init() {

        

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            this.fov, 
            window.innerWidth / window.innerHeight, 
            1, 
            500);
        this.camera.position.set(0,0,10)
        
        // SPecify a canvas which is already in the HTML
        const canvas = document.getElementById(this.canvasId);
        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
        });
        this.renderer.shadowMap.enabled = true;
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        // Comment out to enable/disable performance tracker
        this.stats = Stats();
        document.body.appendChild(this.stats.dom);
        
        window.addEventListener('resize', () => this.onWindowResize(), false);
    }

    animate() {
        window.requestAnimationFrame(this.animate.bind(this));
        this.render();
        this.controls.update();
        this.stats.update();
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }    

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}