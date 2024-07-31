import React from "react";

import * as THREE from 'three';
import { GUI } from 'dat.gui';

import SceneInit from './lib/SceneInit';


function App() {
  const [data, setData] = React.useState(null);

  React.useEffect(() => {

    const test = new SceneInit("threeJsCanvas");
    test.init();
    test.animate();

    const box = new THREE.BoxGeometry(2, 2, 2)
    const mat= new THREE.MeshBasicMaterial({color: 0xfcba03})
    const mesh = new THREE.Mesh(box, mat)

    test.scene.add(mesh);
    test.mesh = mesh;

    const gui = new GUI();

    const geometryFolder = gui.addFolder('Mesh Geometry');
    geometryFolder.open();

    const rotationFolder = geometryFolder.addFolder('Rotation');
    rotationFolder.add(mesh.rotation, 'x', 0, Math.PI).name('Rotate X Axis');
    rotationFolder.add(mesh.rotation, 'y', 0, Math.PI).name('Rotate Y Axis');
    rotationFolder.add(mesh.rotation, 'z', 0, Math.PI).name('Rotate Z Axis');
    
    const scaleFolder = geometryFolder.addFolder('Scale');
    scaleFolder.add(mesh.scale, 'x', 0, 2).name("Scale X Axis")
    scaleFolder.add(mesh.scale, 'y', 0, 2).name("Scale Y Axis")
    scaleFolder.add(mesh.scale, 'z', 0, 2).name("Scale Z Axis")

    const materialFolder = gui.addFolder('Mesh Material')
    const materialParams = {
      meshColor:  mesh.material.color.getHex(),
    };
    materialFolder.add(mesh.material, 'wireframe');

    materialFolder.addColor(materialParams, 'meshColor').onChange((value) => mesh.material.color.set(value));

    const lightingGui = new GUI();
    const ambient_light_folder = lightingGui.addFolder("Ambient Light");
    ambient_light_folder.open();

    const al = new THREE.AmbientLight(0xffffff, 0.5); // ambient light
    ambient_light_folder.add(al, 'visible')
    ambient_light_folder.add(al, 'intensity', 0, 1, 0.1)

    const dl = new THREE.DirectionalLight(0xff0000, 0.5)// directional light
    dl.position.set(0, 2, 0);

   test.scene.add(al)
  

    fetch("/api")
      .then((res) => res.json())
      .then((data) => setData(data.message))

    return () => {
      gui.destroy();
      lightingGui.destroy();
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
