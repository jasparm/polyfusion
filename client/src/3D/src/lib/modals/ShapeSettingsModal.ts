import * as THREE from "three";

import { CustomShape } from "../shapes/CustomShape.ts";
import type { Modal } from "./Modal.ts";

export class ShapeSettingsModal implements Modal {
  modalElement!: HTMLElement;
  closeModalButton!: Element;

  colourPicker!: HTMLElement | null;
  wireframeBox!: HTMLInputElement | null;
  opacityValue!: HTMLInputElement | null;

  selectedShape: CustomShape | undefined;

  constructor(shape: CustomShape) {
    const shapeSettingsModal = document.getElementById("shapeSettingsModal");

    const close = document.getElementById("closeSettings");

    if (!shapeSettingsModal || !close) {
      return;
    }

    this.modalElement = shapeSettingsModal;
    this.closeModalButton = close;

    const applyButton = document.getElementById("applySettings");

    applyButton?.addEventListener("click", () => {
      this.applySettings();
    });

    this.closeModalButton.addEventListener("click", () => {
      this.modalElement.style.display = "none";
    });

    const value = document.getElementById("opacityValue");
    const input = document.getElementById("opacity");
    

    window.addEventListener("click", (event) => {
      if (event.target === this.modalElement) {
        this.modalElement.style.display = "none";
      }
    });
  }

  openModal(shape: CustomShape): void {
    if (shape) {
      this.colourPicker = document.getElementById("colourPicker");
      if (this.colourPicker) {
        const hex = "#" + shape.colour.getHexString().padStart(6, "0");
        (this.colourPicker as HTMLInputElement).value = hex;
      }
      this.wireframeBox = document.getElementById("wireframe") as HTMLInputElement;
      if (this.wireframeBox) {
        this.wireframeBox.checked = shape.wireframe;
      }

      this.opacityValue = document.getElementById("opacity") as HTMLInputElement | null;
      const value = document.getElementById("opacityValue");
      if (this.opacityValue && value) {
        // Set initial opacity value on elements
        this.opacityValue.value = shape.opacity.toString();
        value.textContent = shape.opacity.toString();
        // add event listener to update whenever the opacity value changes.
        this.opacityValue.addEventListener("input", (e) => {
            value.textContent = (e.target as HTMLInputElement).value;
        })
      }

      this.selectedShape = shape;
    }
    this.modalElement.style.display = "block";
  }

  applySettings() {
    this.applyColourSettings();
    this.applyWireFrameSettings();
    this.applyOpacitySettings();
    this.modalElement.style.display = "none";
  }

  private applyColourSettings() {
    const selectedColour = this.colourPicker
      ? (this.colourPicker as HTMLInputElement).value
      : null;
    if (!selectedColour) {
      return;
    }
    const newColour = new THREE.Color(selectedColour);

    if (this.selectedShape) {
      this.selectedShape.colour = newColour;
      this.selectedShape.update();
    }
  }

  private applyWireFrameSettings() {
    const wireframeState = this.wireframeBox as HTMLInputElement
    if (this.selectedShape) {
        this.selectedShape.setWireFrame(wireframeState.checked);
    }
  }

  private applyOpacitySettings() {
    if (this.selectedShape && this.opacityValue) {
        this.selectedShape.opacity = parseFloat(this.opacityValue.value);
        this.selectedShape.update();
    }
  }
}
