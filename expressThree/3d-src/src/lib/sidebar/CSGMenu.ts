import * as THREE from "three";

import { CSGManager } from "../algorithms/ConstructiveSolidGeometry.ts";
import SceneManager from "../scene/SceneManager.ts";
import { CustomShape } from "../shapes/CustomShape.ts";

export default class CSGMenu {
  manager: CSGManager;
  scene: SceneManager;
  div: HTMLElement;
  selectedShapes: CustomShape[];

  selectBtn!: HTMLButtonElement;
  mesh!: CustomShape;
  result!: string;

  constructor(scene: SceneManager) {
    this.manager = new CSGManager(scene);
    this.scene = scene;
    this.selectedShapes = [];

    this.div = document.getElementsByClassName("csg-area")[0] as HTMLElement;
    this.populateDiv();
    document.addEventListener("click", () => this.updateSelectButtonState());
  }

  populateDiv() {
    this.div.innerHTML = "";

    const innerTitle = document.createElement("h5");
    innerTitle.innerHTML = "Selected shapes: ";
    this.div.appendChild(innerTitle);

    this.selectedShapes.forEach((shape, index) => {
      const shapeBox = document.createElement("div");
      shapeBox.className =
        "btn selected-shapes-box d-flex flex-row align-items-center";
      shapeBox.id = `shape-${index}`;

      const iconBox = document.createElement("div");
      iconBox.className = "icon-box";
      // eventually change this to be png of the shape (if ever possible)
      const icon = document.createElement("i");
      icon.className = "fa-solid fa-cube fa-lg";
      iconBox.appendChild(icon);

      const shapeName = document.createElement("p");
      shapeName.textContent = shape.name;

      shapeBox.appendChild(iconBox);
      shapeBox.appendChild(shapeName);

      // Stuff that is unique to custom shapes
      iconBox.style.borderRightColor = shape.colour.getStyle();
      const deleteShapeBtn = document.createElement("i");
      deleteShapeBtn.className = "fa-solid fa-trash-can ml-auto p-2";
      deleteShapeBtn.id = "trash-icon";
      shapeBox.appendChild(deleteShapeBtn);

      deleteShapeBtn.addEventListener("click", (event) => {
        event.stopPropagation(); // prevent the shapeBox click event from firing
        this.selectedShapes.splice(this.selectedShapes.indexOf(shape), 1);
        this.populateDiv();
        this.updateSelectButtonState();
      });

      this.div.appendChild(shapeBox);
    });

    this.createButtons();

    const startMonteCarloBtn = document.createElement("button");
    startMonteCarloBtn.className = "btn btn-success mt-2";
    startMonteCarloBtn.innerHTML = "Calculate IoU";
    startMonteCarloBtn.setAttribute("style", "width: 156px");
    startMonteCarloBtn.disabled = this.selectedShapes.length < 2;
    startMonteCarloBtn.onclick = () => this.startCSG();
    this.div.appendChild(startMonteCarloBtn);

    const result = document.createElement("h5");
    result.innerHTML = `IoU = ${this.result ? this.result : 0}`;
    this.div.appendChild(result);

    

  }

  private createButtons() {
    const buttonsDiv = document.createElement("div");
    buttonsDiv.className = "algorithms-button";
    this.selectBtn = document.createElement("button");
    this.selectBtn.className = "btn btn-primary disabled";
    this.selectBtn.innerText = "Select shape";
    this.selectBtn.setAttribute("style", "width: 156px");
    this.selectBtn.onclick = () => this.addSelectedShape();
    buttonsDiv.appendChild(this.selectBtn);

    this.div.appendChild(buttonsDiv);
  }

  addSelectedShape() {
    if (!this.selectBtn.classList.contains("disabled")) {
      const selectedShape = this.scene.controller.getCustomShape();
      if (selectedShape && !this.selectedShapes.includes(selectedShape)) {
        this.selectedShapes.push(selectedShape);
        this.populateDiv();
      }
    }
  }

  updateSelectButtonState() {
    const shape = this.scene.controller.getCustomShape();

    if (shape && !this.selectedShapes.includes(shape) && shape.id !== "MonteBox") {
      this.selectBtn.classList.remove("disabled");
    } else {
      this.selectBtn.classList.add("disabled");
    }
  }

  startCSG() {
    this.reset();
    this.manager
      .start(this.selectedShapes)
      .then(({ intersectionVolume, customShape }) => {
        const volume = intersectionVolume;
        this.mesh = customShape;

        this.result = volume.toFixed(6).toString();
        this.populateDiv();

      })
      .catch((error) => {
        console.error("Error starting CSG:", error);
      });
  }

  reset() {
    if (this.mesh) {
        this.scene.controller.unselectShapes();
        this.scene.shapeManager.remove(this.mesh.id);
    }
    
  }
}
