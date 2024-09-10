import * as THREE from "three";

export class VertexManager {
  vertexMap: Map<number, THREE.Vector3>;
  selectedVertices: number[]; // this stores a list of all the currently selected vertices

  id: number;
  groupID: string;
  constructor(groupID: string) {
    this.groupID = groupID;
    this.vertexMap = new Map();
    this.id = 0;
    this.selectedVertices = [];
  }

  init(vertices: number[]) {
    for (let i = 0; i < vertices.length; i += 3) {
      this.vertexMap.set(
        this.id,
        new THREE.Vector3(vertices[i], vertices[i + 1], vertices[i + 2])
      );
      this.id++;
    }
  }

  getVerticesInfo(): THREE.Vector3[] {
    let temp2: THREE.Vector3[] = [];
    // return vertices;
    this.vertexMap.forEach((key, value) => {
      temp2.push(key)
    })

    return temp2;
  }

  add(vertex: THREE.Vector3) {
    this.vertexMap.set(this.id, vertex);
    this.id++;
  }

  getVertexFromID(vertexID: number) {
    return this.vertexMap.get(vertexID);
  }

  /**
   * Selects a new vertex - unselects all previously selected vertices.
   * @param vertexID
   */
  selectVertex(vertexID: number) {
    if (this.checkVertexPresence(vertexID)) {
      this.selectedVertices = [vertexID];
    }
  }

  /**
   * Adds a new vertex to the list of selected vertices.
   * @param vertexID
   */
  addSelectedVertex(vertexID: number) {
    if (this.checkVertexPresence(vertexID)) {
      this.selectedVertices.push(vertexID);
    }
  }

  /**
   * Returns true if this vertex manager has that vertex ID, else return false.
   * @param vertexID
   * @returns
   */
  checkVertexPresence(vertexID: number): boolean {
    if (!this.vertexMap.has(vertexID)) {
      // do nothing, this error is not part of this shape/vertex manager
      console.warn(vertexID + " is not found in vertex manager " + this.id);
      return false;
    }

    return true;
  }

  colourSelectedVertices() {
    this.selectedVertices.forEach((vertexID) => {
      const vertex = this.getVertexFromID(vertexID);
      console.log(vertex);

      // vertex.material.color = new THREE.Color(100, 100, 100);
    });
  }
}
