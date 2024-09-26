import { Modal } from "./Modal.ts";
import { CustomShape } from "../shapes/CustomShape.ts";
import { SaverLoader } from "../scene/SaverLoader.ts";

export class SaveShapesModal implements Modal {
    modalElement: HTMLElement;
    closeModalButton: Element;

    applyButton: HTMLElement;

    constructor() {
        const saveModal = document.getElementById("saveShapeModal");
        const close = document.getElementById("closeSave");
        const button = document.getElementById("applySave");

        if (!saveModal || !close || !button) {
            throw new Error("Missing modal elements in page.")
        }

        this.modalElement = saveModal;
        this.closeModalButton = close;
        this.applyButton = button;

        this.closeModalButton.addEventListener("click", () => {
            this.modalElement.style.display = "none";
          });

        window.addEventListener("click", (event) => {
            if (event.target === this.modalElement) {
                this.modalElement.style.display = "none";
            }
        });
    }

    openModal(shape: CustomShape): void {
        // Event listener for the apply button
        this.applyButton.addEventListener("click", () => {          
            const name = document.getElementById("savedName");
            const nameString = (name as HTMLInputElement).value;
            const savedName = name ? nameString : null;

            // Save shape and close window
            this.saveShape(shape, savedName);
            this.modalElement.style.display = "none";
        });

        this.modalElement.style.display = "block";
        console.log(this.modalElement);
    }

    saveShape(shape: CustomShape, name: string | null): void {
        const token = localStorage.getItem('authToken');
        if (token) {
            SaverLoader.saveShape(shape, token, name);
        }
        
    }
}