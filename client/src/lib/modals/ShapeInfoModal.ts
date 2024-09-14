import { CustomShape } from "../shapes/CustomShape.ts";

export class ShapeInfoModal {
  shapeSettingsModal!: HTMLElement;
  closeModalButton!: Element;
  selectedShape: CustomShape;

  constructor(selectedShape: CustomShape) {
    const shapeSettingsModal = document.getElementById(
      "shapeSettingsProperties"
    );
    const closeModalButton = document.querySelector(".close");
    this.selectedShape = selectedShape;

    if (!shapeSettingsModal || !closeModalButton) {
      return;
    }

    this.shapeSettingsModal = shapeSettingsModal;
    this.closeModalButton = closeModalButton;

    this.closeModalButton.addEventListener("click", () => {
      this.shapeSettingsModal.style.display = "none";
    });

    window.addEventListener("click", (event) => {
      if (event.target === this.shapeSettingsModal) {
        this.shapeSettingsModal.style.display = "none";
        
      }
    });

  }

  // Method to open the modal and populate with shape data
  openModal(shape: CustomShape) {
    if (shape) {
      // Populate the modal with the selected shape's properties
      const infoElement = document.getElementById("infoID");
      if (infoElement) {
        infoElement.innerText = "ID: " + shape.id;
      }

      const numberVertices = document.getElementById("infoNumVertices");
      if (numberVertices) {
        numberVertices.innerText =
          "Number of vertices: " + shape.vertexManager.vertexMap.size.toString();
      }

      const numberFaces = document.getElementById("infoNumFaces");
      if (numberFaces) {
        if (shape.geometry.attributes.position) {
          numberFaces.innerText = "Number of faces: " + shape.geometry.attributes.position.count / shape.geometry.attributes.position.itemSize;
        } else {
          numberFaces.innerText = "Number of faces: N/A";
        }
      }
    }
    this.shapeSettingsModal.style.display = "block";
  }
}
