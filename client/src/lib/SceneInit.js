import * as THREE from 'three'

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

        this.line = undefined

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
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
    
    }

    animate() {
        window.requestAnimationFrame(this.animate.bind(this));
        this.render();
    }

    render() {
        if (this.line) {
            this.line.rotation.x += 0.01;
            this.line.rotation.y += 0.01;
        }
        this.renderer.render(this.scene, this.camera);
    }    
}