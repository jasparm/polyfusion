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

// type expected adding shapes to menu
type shapeData = {
    shape: CustomShape,
    name: string,
    db_id: string | null,
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
            if (this.controller.movementState === MovementState.Rotate) {
                transformButton.classList.remove('toggled')
                this.controller.unselectShapes();
                return;
            }
            this.controller.setMovementState(MovementState.Rotate);
        })

        scaleButton.addEventListener("click", () => {
            if (this.controller.movementState === MovementState.Scale) {
                transformButton.classList.remove('toggled')
                this.controller.unselectShapes();
                return;
            }
            this.controller.setMovementState(MovementState.Scale);
        })

        loadButton?.addEventListener("click", () => {
            loadButton.classList.toggle("toggled");
            this.populateSavedShapes();
        })

        closeButton?.addEventListener("click", () => {
            loadButton?.classList.toggle("toggled");
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
            db_id: null, // not part of the database, cannot be deleted
        }));
        this.populateShapeList(shapesList, shapeDataArray);
    }

    async populateSavedShapes() {
        const token = localStorage.getItem('authToken');

        if (!token) {
            this.notLoggedIn();
            return;
        }

        try {
            const loadedShapes: shapeData[] = []
            const shapes: any[] = await SaverLoader.loadShapes(token);
            shapes.forEach(element => {
                const data = element.data;
                const name = element.name;
                const id = element._id;

                const shape = CustomShape.fromJSON(data);
                loadedShapes.push({
                    shape: shape,
                    name: name,
                    db_id: id
                });
            });

            const shapesList = document.querySelector(".shapes-list");
            if (!shapesList) {
                return;
            }

            this.populateShapeList(shapesList, loadedShapes);

        }
        // if error from logging in, just display not logged in information.
        catch {
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

        shapes.forEach((shape, index) => {
            const shapeBox = document.createElement('div');
            shapeBox.className = 'btn shape-box d-flex flex-row align-items-center';
            shapeBox.id = `shape-${index}`;

            const iconBox = document.createElement('div');
            iconBox.className = 'icon-box';
            // eventually change this to be png of the shape (if ever possible)
            const icon = document.createElement('i');
            icon.className = 'fa-solid fa-cube fa-lg';
            iconBox.appendChild(icon);

            const shapeName = document.createElement('p');
            shapeName.textContent = shape.name;

            shapeBox.appendChild(iconBox);
            shapeBox.appendChild(shapeName);

            if (shape.db_id) {
                const deleteShapeBtn = document.createElement('i');
                deleteShapeBtn.className = "fa-solid fa-trash-can ml-auto p-2";
                deleteShapeBtn.id = "trash-icon"
                shapeBox.appendChild(deleteShapeBtn);

                deleteShapeBtn.addEventListener("click", (event) => {
                    event.stopPropagation(); // prevent the shapeBox click event from firing
                    if (shape.db_id) {
                        this.deleteShape(shapeBox, shape.db_id);
                        return;
                    }
                });
            }

            // Event listener that adds the shape to the scene if it is clicked.
            shapeBox.addEventListener('click', () => {
                this.scene.add(shape.shape.clone());
            });

            shapesList.appendChild(shapeBox);
        });
    }

    // this changes the saved shapes menu to be different when there is no logged in user.
    notLoggedIn() {

    }

    deleteShape(shapeBox: HTMLDivElement, id: string) {
        shapeBox.remove();
        // deal with removing shape from database
    }
}