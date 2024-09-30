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
        // remove all event listeners on the button.
        // if we don't do this then every time we open the modal, a new EL is added
        const newApplyButton = this.applyButton.cloneNode(true) as HTMLElement;
        this.applyButton.parentNode?.replaceChild(newApplyButton, this.applyButton);
        this.applyButton = newApplyButton;
        const nameForm = document.getElementById("savedName");
        (nameForm as HTMLInputElement).value = "";

        setTimeout(() => {
            nameForm?.focus();
        }, 200) // delay slightly to ensure that modal is fully visible


        // Event listener for the apply button
        const token = localStorage.getItem('authToken');
        if (token) {
            this.applyButton.addEventListener("click", (event) => {      
                const nameString = (nameForm as HTMLInputElement).value;
                const savedName = nameForm ? nameString : null;

                this.saveShape(shape, savedName, token);
                this.modalElement.style.display = "none";
                
            });
            this.modalElement.style.display = "block";
        }
        else {
            window.alert("Please sign in to save shapes.");
        }
    }

    saveShape(shape: CustomShape, name: string | null, token: string): void {
        const names = SaverLoader.loadShapes(token);

        if (name && !(name in names)) {
            SaverLoader.saveShape(shape, token, name);
        }
        
    }
}