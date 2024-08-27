import React from "react";

import * as THREE from 'three';

import SceneInit from './lib/scene/SceneInit';
import CustomGui from "./lib/Gui";
import { MonteCarloManager } from "./lib/algorithms/MonteCarlo";

function App() {
  const [data, setData] = React.useState(null);

  React.useEffect(() => {

    const expressLayouts = require('express-ejs-layouts')

    const test = new SceneInit("threeJsCanvas");
    test.init();

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

    // Box
    const boxTexture = new THREE.TextureLoader().load('./assets/texture01.png'); // creates texture and loads them in

    const box = new THREE.BoxGeometry(2, 2, 2);
    const mat= new THREE.MeshStandardMaterial({
      map: boxTexture,
      side: THREE.DoubleSide
    }); // instead of choosing colour, we can choose a texture to map
    const mesh = new THREE.Mesh(box, mat);
    mesh.castShadow = true;

    test.scene.add(mesh);
    test.box = mesh;
    test.mesh = mesh;

    const ball = new THREE.SphereGeometry(0.25);
    const ball_mat = new THREE.MeshStandardMaterial({color: 0x00ff00})
    const ball_mesh = new THREE.Mesh(ball, ball_mat);
    ball_mesh.position.x = 3
    ball_mesh.castShadow = true;

    test.sphere = ball_mesh;

    test.scene.add(ball_mesh)

    gui.init_mesh(test.mesh);
    gui.init_ball(ball_mesh);

    const al = new THREE.AmbientLight(0xffffff, 0.5); // ambient light

    test.scene.add(al)

    const dl = new THREE.DirectionalLight(0xff0000, 0.5)// directional light
    dl.position.set(0, 2, 2);
    dl.castShadow = true;

    test.scene.add(dl);
    gui.init_light(dl,al);

    // // Custom mesh
    // const custom_geometry = new THREE.BufferGeometry();

    // const vertices = new Float32Array( [
    //   -1.0, -1.0,  -1.0, // v0
    //    1.0, -1.0,  -1.0, // v1
    //    1.0,  1.0,  -1.0, // v2
    
    //    1.0,  1.0,  -1.0, // v3
    //   -1.0,  1.0,  -1.0, // v4
    //   -1.0, -1.0,  -1.0  // v5
    // ] );

    // const vertices2 = new Float32Array( [
    //   -1.0, -1.0,  1.0, // v0
    //    1.0, -1.0,  1.0, // v1
    //    1.0,  1.0,  1.0, // v2
    
    //    1.0,  1.0,  1.0, // v3
    //   -1.0,  1.0,  1.0, // v4
    //   -1.0, -1.0,  1.0  // v5
    // ] );

    // custom_geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    // const custom_mat = new THREE.MeshBasicMaterial( {color: 0xff0000, side: THREE.DoubleSide} );
    // const custom_mesh = new THREE.Mesh( custom_geometry, custom_mat );

    // const custom_mesh2 = new THREE.Mesh()

    // custom_mesh.castShadow = true;

    // test.scene.add(custom_mesh);

    const octahedron = new THREE.OctahedronGeometry(2, 0);
    const octahedron_mat = new THREE.MeshStandardMaterial({color: 0xff00ff, wireframe: true, side: THREE.DoubleSide});
    const octahedron_mesh = new THREE.Mesh(octahedron, octahedron_mat);

    octahedron_mesh.castShadow = true;
    test.octahedron = octahedron_mesh;

    test.scene.add(octahedron_mesh);

    const MonteCarlo = new MonteCarloManager([mesh, octahedron_mesh], test.scene);
    MonteCarlo.radius = 0.25;

    gui.init_monte(MonteCarlo);
  

    test.animate();


    // fetch("/api")
    //   .then((res) => res.json())
    //   .then((data) => setData(data.message))

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
