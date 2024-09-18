import * as THREE from '/three/three.module.js';
export class ShapeSettingsModal {
    modalElement;
    closeModalButton;
    colourPicker;
    wireframeBox;
    opacityValue;
    selectedShape;
    constructor(shape) {
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
    openModal(shape) {
        if (shape) {
            this.colourPicker = document.getElementById("colourPicker");
            if (this.colourPicker) {
                const hex = "#" + shape.colour.getHexString().padStart(6, "0");
                this.colourPicker.value = hex;
            }
            this.wireframeBox = document.getElementById("wireframe");
            if (this.wireframeBox) {
                this.wireframeBox.checked = shape.wireframe;
            }
            this.opacityValue = document.getElementById("opacity");
            const value = document.getElementById("opacityValue");
            if (this.opacityValue && value) {
                // Set initial opacity value on elements
                this.opacityValue.value = shape.opacity.toString();
                value.textContent = shape.opacity.toString();
                // add event listener to update whenever the opacity value changes.
                this.opacityValue.addEventListener("input", (e) => {
                    value.textContent = e.target.value;
                });
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
    applyColourSettings() {
        const selectedColour = this.colourPicker
            ? this.colourPicker.value
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
    applyWireFrameSettings() {
        const wireframeState = this.wireframeBox;
        if (this.selectedShape) {
            this.selectedShape.setWireFrame(wireframeState.checked);
        }
    }
    applyOpacitySettings() {
        if (this.selectedShape && this.opacityValue) {
            this.selectedShape.opacity = parseFloat(this.opacityValue.value);
            this.selectedShape.update();
        }
    }
}
