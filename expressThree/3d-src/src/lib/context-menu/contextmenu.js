import { SaveShapesModal } from "../modals/SaveShapesModal.ts";
import { ShapeInfoModal } from "../modals/ShapeInfoModal.ts";
import { ShapeSettingsModal } from "../modals/ShapeSettingsModal.ts";

// This class handles the context menu in 3D. Should behave differently depending on what is selected in the scene.
// Init context menu

export class ContextMenu {
  constructor() {
    this.contextMenu = document.querySelector(".context");
    this.selectedShape = null;

    this.shapeInfo = new ShapeInfoModal(this.selectedShape);
    this.shapeSettings = new ShapeSettingsModal(this.selectedShape);
    this.saveShape = new SaveShapesModal();

    document.addEventListener("click", () => {
      this.hideMenu();
    });
    // add listeners for context menu items
    this.addMenuEventListeners();
  }

  addMenuEventListeners() {
    const shapeSettings = document.getElementById("shapeSettings");
    const shapeProperties = document.getElementById("shapeProperties");
    const saveShape = document.getElementById("saveShape");

    // Event listener for Shape Settings
    shapeSettings.addEventListener("click", (event) => {
      this.handleShapeSettings();
    });

    // Event listener for Shape Info
    shapeProperties.addEventListener("click", (event) => {
      this.handleShapeInfo();
    });

    saveShape.addEventListener("click", () => {
      this.handleSaveShape();
    })
  }

  updateMenuPosition = (x, y) => {
    const maxLeftValue = window.innerWidth - this.contextMenu.offsetWidth;
    const maxTopValue = window.innerHeight - this.contextMenu.offsetHeight;

    this.contextMenu.style.left = `${Math.min(x, maxLeftValue)}px`;
    this.contextMenu.style.top = `${Math.min(y, maxTopValue)}px`;
  };

  enableMenu(event) {
    // Update menu to be at mouse position.
    this.updateMenuPosition(event.clientX, event.clientY);
    this.contextMenu.style.opacity = 1;
    this.contextMenu.style.visibility = "visible";
    this.contextMenu.style.pointerEvents = "auto";
  }

  // Method to handle Shape Settings click
  handleShapeSettings() {
    this.shapeSettings.openModal(this.selectedShape);
    
  }

  // Method to handle Shape Info click
  handleShapeInfo() {
    this.shapeInfo.openModal(this.selectedShape);
  }

  handleSaveShape() {
    if (this.selectedShape.id == "MonteBox") {
      return;
    }
    this.saveShape.openModal(this.selectedShape);
  }

  hideMenu() {
    this.contextMenu.style.opacity = 0;
    this.contextMenu.style.pointerEvents = "none";
  }
}
