import * as THREE from 'three';
import './App.css';
import './lib/context-menu/contextmenu.css'

import SceneManager from "./lib/scene/SceneManager.ts";
import { MonteCarloManager } from "./lib/algorithms/MonteCarlo.js";

import { CustomShape } from "./lib/shapes/CustomShape.ts";
import { CustomBox } from "./lib/shapes/prefabs/CustomBox.ts";
import { CustomTetrahedron } from "./lib/shapes/prefabs/Tetrahedron.ts";
import { CustomOctahedron } from "./lib/shapes/prefabs/Octahedron.ts";
import { CustomDodecahedron } from "./lib/shapes/prefabs/Dodecahedron.ts";
import { CustomIcosahedron } from "./lib/shapes/prefabs/Icosahedron.ts";
import { SaverLoader } from "./lib/scene/SaverLoader.ts";


const test = new SceneManager("threeJsCanvas");
test.init();


// Box
const boxTexture = new THREE.TextureLoader().load("./assets/texture01.png"); // creates texture and loads them in

const box = new THREE.BoxGeometry(2, 2, 2);
const mat = new THREE.MeshStandardMaterial({
  map: boxTexture,
  side: THREE.DoubleSide,
}); // instead of choosing colour, we can choose a texture to map
const mesh = new THREE.Mesh(box, mat);
mesh.castShadow = true;

// test.scene.add(mesh);
test.box = mesh;
test.mesh = mesh;

const ball = new THREE.SphereGeometry(0.25);
const ball_mat = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const ball_mesh = new THREE.Mesh(ball, ball_mat);
ball_mesh.position.x = 3;
ball_mesh.castShadow = true;

test.sphere = ball_mesh;


// test.scene.add(octahedron_mesh);

const shape = new CustomOctahedron();
shape.group.position.z = -5;

test.add(shape);
// shape.group.position.y = 2
// shape.wireframe = true
// shape.addVertex(new THREE.Vector3(1, 1, 2));
// shape.addVertex(new THREE.Vector3(-1, 1, 2));
// shape.addVertex(new THREE.Vector3(-3, 1, -1));

const cube = new CustomBox(5, 5, 5, new THREE.Color(0x0000ff));
const tet = new CustomTetrahedron(2);
test.add(tet);

cube.group.position.z = 5;
// test.scene.add(cube.group);
test.add(cube);

const doc = new CustomDodecahedron(0.5);
doc.group.position.x = 5;
test.add(doc);

const iso = new CustomIcosahedron();
iso.group.position.x = -5;
test.add(iso);

const MonteCarlo = new MonteCarloManager([cube, tet], test.scene);
MonteCarlo.radius = 0.25;


test.animate();

SaverLoader.saveScene(test);
// fetch("/api")
//   .then((res) => res.json())
//   .then((data) => setData(data.message))
