import SceneManager from "../scene/SceneManager.ts";
import { Modal } from "./Modal.ts";

export class ConfirmClearModal implements Modal {
    modalElement: HTMLElement;
    closeModalButton: Element;
    applyButton: HTMLElement;

    scene: SceneManager;

    constructor(scene: SceneManager) {
        const confirmModal = document.getElementById("clearSceneWarning");
        const apply = document.getElementById("applyClear");
        const cancel = document.getElementById("cancelClear")

        if (!confirmModal || !apply || ! cancel) {
            throw new Error("Missing modal elements in page.");
        }

        this.modalElement = confirmModal;
        this.closeModalButton = cancel;
        this.applyButton = apply;

        this.scene = scene;


        this.closeModalButton.addEventListener("click", () => {
            this.modalElement.style.display = "none";
        });

        this.applyButton.addEventListener("click", () => {
            this.scene.clear();
            this.modalElement.style.display = "none";
        });
    }

    openModal(): void {
        this.modalElement.style.display = "block";
    }
}
