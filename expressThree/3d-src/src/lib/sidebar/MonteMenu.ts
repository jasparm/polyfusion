import * as THREE from "three";

import { MonteCarloManager } from "../algorithms/MonteCarlo.js";
import SceneManager from "../scene/SceneManager.ts";
import { CustomShape } from "../shapes/CustomShape.ts";

export default class MonteMenu {
  scene: SceneManager;
  monteManager: MonteCarloManager;
  enabled: boolean = false;
  div: HTMLElement;
  selectedShapes: CustomShape[];
  selectBtn!: HTMLButtonElement;

  define: boolean = true;
  maxMonteCarloBalls: number = 100;
  result: string = "0";

  constructor(scene: SceneManager) {
    this.scene = scene;
    this.selectedShapes = [];

    this.monteManager = new MonteCarloManager(this.scene);

    this.div = document.getElementsByClassName("monte-area")[0] as HTMLElement;

    this.populateDiv();
    this.updateSelectButtonState();
    document.addEventListener("click", () => this.updateSelectButtonState());
  }

  populateDiv() {
    this.div.innerHTML = "";

    const innerTitle = document.createElement("h5");
    innerTitle.innerHTML = "Selected shapes:";
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

    this.createButtonsDiv();

    const maxBallsLabel = document.createElement("h5");
    maxBallsLabel.innerHTML = "Max Monte-Carlo Balls:";
    maxBallsLabel.setAttribute("style", "margin-top: 10px; display: block;");
    this.div.appendChild(maxBallsLabel);

    const maxBallsInput = document.createElement("input");
    maxBallsInput.type = "number";
    maxBallsInput.value = "100"; // default value
    maxBallsInput.setAttribute("style", "width: 156px; margin-top: 5px;");
    maxBallsInput.onchange = () => {
      this.maxMonteCarloBalls = parseInt(maxBallsInput.value);
    };
    this.div.appendChild(maxBallsInput);

    this.maxMonteCarloBalls = parseInt(maxBallsInput.value);

    const startMonteCarloBtn = document.createElement("button");
    startMonteCarloBtn.className = "btn btn-success mt-2";
    startMonteCarloBtn.innerHTML = "Start Monte Carlo";
    startMonteCarloBtn.setAttribute("style", "width: 156px");
    startMonteCarloBtn.disabled = this.selectedShapes.length < 2;
    startMonteCarloBtn.onclick = () => this.startMonteCarlo();
    this.div.appendChild(startMonteCarloBtn);

    const result = document.createElement("h5");
    result.innerHTML = `IoU estimate = ${this.result}`;
    this.div.appendChild(result);

    const resetBtn = document.createElement("button");
    resetBtn.className = "btn btn-primary mr-2"
    resetBtn.innerHTML = "Reset"
    resetBtn.setAttribute("style", "margin-top: 10px");
    resetBtn.onclick = (ev: MouseEvent) =>  {
      this.monteManager.reset();
      this.enabled = true;
      this.updateSelectButtonState();
    }
    this.div.appendChild(resetBtn);


  }

  private createButtonsDiv() {
    const buttonsDiv = document.createElement("div");
    buttonsDiv.className = "algorithms-buttons";

    const finaliseBtn = document.createElement("button");
    finaliseBtn.className = "btn btn-primary mr-2";
    finaliseBtn.innerHTML = "Move boundaries";
    finaliseBtn.setAttribute("style", "width: 156px");
    if (this.define) {
      finaliseBtn.innerHTML = "Define boundaries";
      finaliseBtn.onclick = () => this.defineBoundaries(finaliseBtn);
    } else {
      finaliseBtn.onclick = () => this.moveBoundaries(finaliseBtn);
    }

    buttonsDiv.appendChild(finaliseBtn);

    this.selectBtn = document.createElement("button");
    this.selectBtn.className = "btn btn-primary disabled";
    this.selectBtn.innerText = "Select shape";
    this.selectBtn.setAttribute("style", "margin-left: 10px; width: 156px");
    this.selectBtn.onclick = () => this.addSelectedShape();
    buttonsDiv.appendChild(this.selectBtn);

    this.div.appendChild(buttonsDiv);
  }

  defineBoundaries(finaliseBtn: HTMLElement) {
    this.monteManager.toggleMonteBox();
    this.scene.controller.unselectShapes();
    this.define = true;
    finaliseBtn.innerHTML = "Move boundaries";
    finaliseBtn.onclick = () => this.toggleBoundaries(finaliseBtn);
    this.updateSelectButtonState();
  }

  moveBoundaries(finaliseBtn: HTMLElement) {
    this.monteManager.toggleMonteBox();

    this.selectBtn.classList.add("disabled");
    finaliseBtn.innerHTML = "Define boundaries";
    finaliseBtn.onclick = () => this.toggleBoundaries(finaliseBtn);
    this.updateSelectButtonState();
  }

  toggleBoundaries(finaliseBtn: HTMLElement) {
    this.monteManager.reset();
    if (finaliseBtn.innerHTML === "Define boundaries") {
      this.defineBoundaries(finaliseBtn);
    } else {
      this.moveBoundaries(finaliseBtn);
    }
  }

  updateSelectButtonState() {
    const isMoveBoundariesEnabled = this.monteManager.box.layer !== 0;
    const isShapeSelected = this.scene.controller.selectedGroup !== null;
    const shape = this.scene.controller.getCustomShape();

    if (
      isMoveBoundariesEnabled &&
      isShapeSelected &&
      shape &&
      !this.selectedShapes.includes(shape)
    ) {
      this.selectBtn.classList.remove("disabled");
    } else {
      this.selectBtn.classList.add("disabled");
    }
  }

  addSelectedShape() {
    if (!this.selectBtn.classList.contains("disabled")) {
      const selectedShape = this.scene.controller.getCustomShape();
      if (selectedShape && !this.selectedShapes.includes(selectedShape)) {
        this.selectedShapes.push(selectedShape);
        this.define = false;
        this.populateDiv();
      }
    }
  }

  startMonteCarlo() {
    const { xRange, yRange, zRange } = this.monteManager.getMonteBoxBounds();

    this.monteManager.max_balls = this.maxMonteCarloBalls;
    const interval = 5000 / this.maxMonteCarloBalls
    this.monteManager.start(this.selectedShapes, interval, xRange, yRange, zRange);

    this.result = this.monteManager.storeResult;
    this.monteManager.menu = this;
  }
}
