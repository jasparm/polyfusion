import { Controller } from "../controls/Controller.ts";
import { ControllerState, MovementState } from "../controls/ControllerStates.ts";
import SceneManager from "../scene/SceneManager.ts";
import { SaverLoader } from "../scene/SaverLoader.ts";
import { CustomShape } from "../shapes/CustomShape.ts";
import { CustomBox } from '../shapes/prefabs/CustomBox.ts';
import { CustomDodecahedron } from "../shapes/prefabs/Dodecahedron.ts";
import { CustomIcosahedron } from "../shapes/prefabs/Icosahedron.ts";
import { CustomOctahedron } from "../shapes/prefabs/Octahedron.ts";
import { CustomTetrahedron } from "../shapes/prefabs/Tetrahedron.ts";
import { ConfirmClearModal } from "../modals/ConfirmClearModal.ts";

import MonteMenu from "./MonteMenu.ts";
import CSGMenu from "./CSGMenu.ts";

// type expected adding shapes to menu
type shapeData = {
    shape: CustomShape,
    name: string,
    image: string | null, 
    custom: boolean
}

export class ButtonHandler {
    movementButtons: Map<MovementState, HTMLElement>;
    controller: Controller;
    scene: SceneManager;

    constructor(scene: SceneManager) {
        const controller = scene.controller;
        this.scene = scene;
        this.controller = controller;
        this.movementButtons = new Map();

        const transformButton = document.getElementById("transform-btn");
        const rotateButton = document.getElementById("rotate-btn");
        const scaleButton = document.getElementById("scale-btn");

        const loadButton = document.getElementById("create-shape-btn");
        const closeButton = document.getElementById("close-btn");
        const algoClose = document.getElementById("close-btn-algo");

        const algorithmsButton = document.getElementById("algorithm-btn");

        const clearButton = document.getElementById("clear-btn");

        this.populateDefaultShapes();

        if (!transformButton || !rotateButton || !scaleButton) {
            return;
        }

        this.movementButtons.set(MovementState.Transform, transformButton);
        this.movementButtons.set(MovementState.Rotate, rotateButton);
        this.movementButtons.set(MovementState.Scale, scaleButton);

        transformButton.addEventListener("click", () => {
            if (this.controller.state === ControllerState.Normal) { return; }

            if (this.controller.movementState === MovementState.Transform) {
                this.controller.unselectShapes();
                transformButton.classList.remove('toggled')
                return;
            }

            this.controller.setMovementState(MovementState.Transform);
            
        })

        rotateButton.addEventListener("click", () => {
            if (this.controller.state === ControllerState.Normal) { return; }

            if (this.controller.movementState === MovementState.Rotate) {
                transformButton.classList.remove('toggled')
                this.controller.unselectShapes();
                return;
            }
            this.controller.setMovementState(MovementState.Rotate);
        })

        scaleButton.addEventListener("click", () => {
            if (this.controller.state === ControllerState.Normal) { return; }

            if (this.controller.movementState === MovementState.Scale) {
                transformButton.classList.remove('toggled')
                this.controller.unselectShapes();
                return;
            }
            this.controller.setMovementState(MovementState.Scale);
        })

        loadButton?.addEventListener("click", () => {
            const status = loadButton.classList.toggle("toggled");
            algorithmsButton?.classList.toggle("toggled", false)
            if (status) {
                this.populateSavedShapes();
                document.getElementById("offcanvasAlgo")?.classList.remove("show");
                document.getElementById("offcanvasLoad")?.classList.add("show");
            }
            else {
                document.getElementById("offcanvasLoad")?.classList.remove("show");
            }
            
        })

        closeButton?.addEventListener("click", () => {
            loadButton?.classList.toggle("toggled", false);
            document.getElementById("offcanvasLoad")?.classList.remove("show");
        })

        algoClose?.addEventListener("click", () => {
            algorithmsButton?.classList.toggle("toggled", false);
            document.getElementById("offcanvasAlgo")?.classList.remove("show");
        })

        algorithmsButton?.addEventListener("click", () => {
            const status = algorithmsButton.classList.toggle("toggled");
            loadButton?.classList.toggle("toggled", false)
            if (status) {
                this.populateSavedShapes();
                document.getElementById("offcanvasLoad")?.classList.remove("show");
                document.getElementById("offcanvasAlgo")?.classList.add("show");
            }
            else {
                document.getElementById("offcanvasAlgo")?.classList.remove("show");
            }
        })

        const insertMonteBtn = document.getElementById("insert-monte-btn");
        insertMonteBtn?.addEventListener("click", () => {
            this.loadAlgorithms(scene, true);
        })

        const insertCsgBtn = document.getElementById("insert-csg-btn");
        insertCsgBtn?.addEventListener("click", () => {
            this.loadAlgorithms(scene, false);
        })

        clearButton?.addEventListener("click", () => {
            const modal = new ConfirmClearModal(this.scene);

            modal.openModal();

        })

        
    }

    onChange(state: MovementState | null) {
        this.movementButtons.forEach(button => {
            button.classList.remove('toggled');
        })
        if (state === null) {
            return;
        }
        const button = this.movementButtons.get(state);
        button?.classList.add("toggled");
    }

    populateDefaultShapes() {
        const shapes: CustomShape[] = []
        shapes.push(new CustomBox());
        shapes.push(new CustomDodecahedron());
        shapes.push(new CustomIcosahedron());
        shapes.push(new CustomTetrahedron());
        shapes.push(new CustomOctahedron());

        const shapesList = document.querySelector(".default-shapes-list");

        if (!shapesList) { return; }

        const shapeDataArray: shapeData[] = shapes.map((shape, index) => ({
            shape: shape,
            name: shape.name,
            image: null,
            custom: false,
        }));
        this.populateShapeList(shapesList, shapeDataArray);
    }

    async populateSavedShapes() {
        const token = localStorage.getItem('authToken');

        if (token === null) {
            this.notLoggedIn();
            return;
        }

        try {
            let shapes: string[] = await SaverLoader.loadShapes(token);
            if (!shapes) {
                return;
            }
            // shapes = shapes.map(shape => shape.trim());
            // this gets all the shape data need from the backend
            const loadedShapes: shapeData[] = (await Promise.all(
                shapes.map(async (name) => {
                    // internal try-catch to deal with null returns from undefined names
                    // this way it will populate other shapes even if one is undefined.
                    try {
                        // modify name if it ends with a white space - shouldn't be able to be set but just in case
                        if (name.trim() !== name) {
                            name = name.trim();
                            name = `${name}%20`
                        }
                        const shapeData = await SaverLoader.getShapeData(token, name);
                        return {
                            shape: CustomShape.fromJSON(shapeData.data),
                            name: name,
                            image: shapeData.image,
                            custom: true
                        };
                    } catch (error) {
                        console.warn(`Could not fetch shape: ${name}`, error);
                        return null; // Return null to filter it out later
                    }
                })
            )).filter((shape): shape is shapeData => shape !== null);

            const shapesList = document.querySelector(".shapes-list");
            if (!shapesList) {
                return;
            }

            this.populateShapeList(shapesList, loadedShapes);

        }
        // if error from logging in, just display not logged in information.
        catch(e){
            console.error(e);
            this.notLoggedIn();
        }
        
    }

    /**
     * Populates a shapes list element with shapes provided in the shapes array.
     * @param shapesList HTML element where the shapes should be added.
     * @param shapes List of shapes to be added to the list.
     */
    private populateShapeList(shapesList: Element, shapes: shapeData[]) {
        shapesList.innerHTML = "";

        shapes.forEach((element, index) => {
            const shapeBox = document.createElement('div');
            shapeBox.className = 'btn shape-box d-flex flex-row align-items-center';
            shapeBox.id = `shape-${index}`;

            const iconBox = document.createElement('div');
            iconBox.className = 'icon-box';
            // eventually change this to be png of the shape (if ever possible)
            if (element.image != null) {
                const img = document.createElement('img');
                img.src = element.image as string;
                img.alt = `Shape ${index}`;
                img.className = 'shape-icon';

                iconBox.appendChild(img);
            } else {
                // if no image, just use generic icon
                const icon = document.createElement('i');
                icon.className = 'fa-solid fa-cube fa-lg';
                iconBox.appendChild(icon);
            }
            
            const shapeName = document.createElement('p');
            shapeName.textContent = element.name;

            shapeBox.appendChild(iconBox);
            shapeBox.appendChild(shapeName);

            // Stuff that is unique to custom shapes
            if (element.custom) {
                iconBox.style.borderRightColor = element.shape.colour.getStyle();
                const deleteShapeBtn = document.createElement('i');
                deleteShapeBtn.className = "fa-solid fa-trash-can ml-auto p-2";
                deleteShapeBtn.id = "trash-icon"
                shapeBox.appendChild(deleteShapeBtn);

                deleteShapeBtn.addEventListener("click", (event) => {
                    event.stopPropagation(); // prevent the shapeBox click event from firing
                    this.deleteShape(shapeBox, element.name);
                });
            }

            // Event listener that adds the shape to the scene if it is clicked.
            shapeBox.addEventListener('click', () => {
                const clonedShape = element.shape.clone();
                clonedShape.name = element.name;

                this.scene.add(clonedShape);
            });

            shapesList.appendChild(shapeBox);
        });
    }

    // this changes the saved shapes menu to be different when there is no logged in user.
    notLoggedIn() {
        console.log("not logged in");
    }

    deleteShape(shapeBox: HTMLDivElement, name: string) {
        const token = localStorage.getItem('authToken');

        if (!token) {
            return;
        }
        
        shapeBox.remove();
        SaverLoader.deleteShape(token, name);
        return;
    }

    loadAlgorithms(scene: SceneManager, monte: boolean) {
        if (monte) {
            const monteCarlo = new MonteMenu(scene);
        }
        else {
            const csg = new CSGMenu(scene);
        }
        
    }
}