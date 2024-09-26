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
import axios from 'axios';


const test = new SceneManager("threeJsCanvas");
test.init();
const signup = async (user, pass) => {
    try {
        const url = "http://127.0.0.1:3000/signup";

        const data = {
            user: user,
            pass: pass,
        };

        const headers = {
            "Content-Type": "application/json",
        };

        const response = await axios.post(url, data, { headers });

        console.log(response);
    } catch (error) {
        console.error("Error during POST request:", error);
    }
};

const login = async (user , pass) => {
    try {
        const url = "http://127.0.0.1:3000/login";

        const data = {
            user: user,
            pass: pass,
        };

        const headers = {
            "Content-Type": "application/json",
        };

        const response = await axios.post(url, data, { headers });

        const token = response.data.token;
        if (token) return token;
    } catch (error) {
        console.error("Error during POST request:", error);
    }
};

async function execute() {
    // await signup("shannon", "test")
    const token = await login("shannon", "test");
    console.log(token)
    test.token = token;
    localStorage.setItem('authToken', token);
}

execute();


const tet = new CustomTetrahedron(2);
test.add(tet);


// const MonteCarlo = new MonteCarloManager([cube, tet], test.scene);
// MonteCarlo.radius = 0.25;

test.animate();

SaverLoader.saveScene(test);
// fetch("/api")
//   .then((res) => res.json())
//   .then((data) => setData(data.message))
