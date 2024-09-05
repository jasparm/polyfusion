import * as THREE from "three";

export class VertexManager {
  vertexMap: Map<number, THREE.Vector3>;
  connections: number[][];

  id: number;
  groupID: string;
  constructor(groupID: string) {
    this.groupID = groupID;
    this.vertexMap = new Map();
    this.id = 0
  }

  init(vertices: number[], connections: number[][]) {
    for (let i = 0; i < vertices.length; i += 3) {
      this.vertexMap.set(
        this.id,
        new THREE.Vector3(vertices[i], vertices[i + 1], vertices[i + 2])
      );
      this.id++;
    }
    this.connections = connections;
  }

  getVerticesInfo(): Float32Array {
    var temp: number[] = [];
    for (let i = 0; i < this.connections.length; i++) {
      for (let j = 0; j < this.connections[i].length; j++) {
        const vertex = this.vertexMap.get(this.connections[i][j]);
        if (vertex) {
          temp.push(vertex.x);
          temp.push(vertex.y);
          temp.push(vertex.z);
        }
      }
    }
    const vertices = new Float32Array(this.connections.length * 9); // Buffer geometry wants a typed array so we convert
    for (let k = 0; k < temp.length; k++) {
      vertices[k] = temp[k];
    }
    return vertices;
  }

  add(vertex: THREE.Vector3) {
    this.vertexMap.set(this.id, vertex);
    this.id ++;
  }

}
