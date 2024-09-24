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


const tet = new CustomTetrahedron(2);
test.add(tet);


// const MonteCarlo = new MonteCarloManager([cube, tet], test.scene);
// MonteCarlo.radius = 0.25;

test.animate();

SaverLoader.saveScene(test);
// fetch("/api")
//   .then((res) => res.json())
//   .then((data) => setData(data.message))
