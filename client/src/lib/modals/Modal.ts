import { CustomShape } from "../shapes/CustomShape.ts";

export interface Modal {
    modalElement: HTMLElement;
    closeModalButton: Element;

    openModal(shape: CustomShape): void;

}