import SceneManager from "./lib/scene/SceneManager.ts";

import { CustomTetrahedron } from "./lib/shapes/prefabs/Tetrahedron.ts";
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
    localStorage.setItem('authToken', token);
    // localStorage.removeItem('authToken')
}

execute();


const tet = new CustomTetrahedron(2);
test.add(tet);


// const MonteCarlo = new MonteCarloManager([cube, tet], test.scene);
// MonteCarlo.radius = 0.25;

test.animate();
