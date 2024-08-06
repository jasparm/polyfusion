import React from "react";

import * as THREE from 'three';
import { GUI } from 'dat.gui';

import SceneInit from './lib/SceneInit';
import CustomGui from "./lib/Gui";

function App() {
  const [data, setData] = React.useState(null);

  React.useEffect(() => {

    const test = new SceneInit("threeJsCanvas");
    test.init();
    test.animate();

    // add settings GUI
    const gui = new CustomGui();

    test.scene.background = new THREE.Color(0x2e3359);

    // set up ground
    const groundGeometry = new THREE.BoxGeometry(8, 0.5, 8);
    const groundMaterial = new THREE.MeshPhongMaterial({ color: 0xfafafa });

    // phone material
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.receiveShadow = true;
    groundMesh.position.y = -2;

    test.scene.add(groundMesh);

    const boxTexture = new THREE.TextureLoader().load('./assets/texture01.png'); // creates texture and loads them in

    const box = new THREE.BoxGeometry(2, 2, 2)
    const mat= new THREE.MeshStandardMaterial({map: boxTexture}) // instead of choosing colour, we can choose a texture to map
    const mesh = new THREE.Mesh(box, mat)
    mesh.castShadow = true;

    test.scene.add(mesh);
    test.mesh = mesh;

    gui.init_mesh(test.mesh);

    const al = new THREE.AmbientLight(0xffffff, 0.5); // ambient light

    test.scene.add(al)

    const dl = new THREE.DirectionalLight(0xff0000, 0.5)// directional light
    dl.position.set(0, 2, 2);
    dl.castShadow = true;

    test.scene.add(dl);
    gui.init_light(dl,al);


    fetch("/api")
      .then((res) => res.json())
      .then((data) => setData(data.message))

    return () => {
      gui.destroy();
    };
      
  }, []);

  return (
    <div className="App">
      <canvas id="threeJsCanvas"></canvas>
        <p>
          {!data ? "Loading..." : data}
        </p>
    </div>
  );
}

export default App;
