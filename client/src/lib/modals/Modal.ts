import { CustomShape } from "../shapes/CustomShape.ts";


/**
 * Represents a modal interface.
 */
export interface Modal {
    /**
     * The HTML element representing the modal.
     */
    modalElement: HTMLElement;

    /**
     * The element that, when interacted with, will close the modal.
     */
    closeModalButton: Element;

    /**
     * Opens the modal with a given shape.
     * 
     * @param shape - The custom shape to be used when opening the modal.
     */
    openModal(shape: CustomShape): void;

}