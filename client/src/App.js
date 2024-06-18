import React from "react";
import * as THREE from 'three';

import SceneInit from './lib/SceneInit';


function App() {
  const [data, setData] = React.useState(null);

  React.useEffect(() => {

    const test = new SceneInit("threeJsCanvas");
    test.init();
    test.animate();

    const box = new THREE.BoxGeometry(2, 2, 2)
    const mat= new THREE.MeshBasicMaterial({color: 0xfcba03})
    const line = new THREE.Line(box, mat)

    test.scene.add(line);
    test.line = line;

    fetch("/api")
      .then((res) => res.json())
      .then((data) => setData(data.message))
  })

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
