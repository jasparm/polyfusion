import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 105, window.innerWidth / window.innerHeight, 0.1, 500 );
camera.position.set(0, 0, 100)
camera.lookAt(0, 0, 0)

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

function makeCube() {
    const geometry = new THREE.BoxGeometry(1, 1, 1, 1)
    const material = new THREE.MeshBasicMaterial( {color: 0x00ff00})
    let cube = new THREE.Mesh( geometry, material)
    return cube
}
const cubeShape = makeCube()
//scene.add(cubeShape)


function makeLine() {
    const material = new THREE.LineBasicMaterial( {color: 0xffffff})
    const points = []
    points.push(new THREE.Vector3(-10, 0, 0))
    points.push(new THREE.Vector3(0, 10, 0))
    points.push(new THREE.Vector3(10, 0, 0))
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const line = new THREE.Line(geometry, material)

    return line
}
let line = makeLine()
scene.add(line)
camera.position.z = 5


function animate() {
    //cubeShape.rotation.x += 0.01
    //cubeShape.rotation.y += 0.01
    renderer.render(scene, camera)
}
renderer.render(scene, camera)
