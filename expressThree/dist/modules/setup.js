import { Shape } from "./Shape.js";
import { monteCarlo } from "./monteCarlo.js";
import { completeShape, rgbToHex, hexToRgb } from "./shapeUtils.js";
import { sutherlandHodgman, sortPoints } from "./intersection.js";
const DEFAULT_SHAPE_COLOUR = "rgb(180, 180, 180)"

// Initialising tooltips for bootstrap
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

export const state = {
    canvas: null,
    shapes: [],
    points: [],
    selectedShapes: [],
    savedShapes: [],
    movingShapes: [],
    moveOffset: null,
    createShapeMode: false,
    selectShapeMode: false,
    monteCarloMode: false,
    pauseMonte: false,
    savingMode: false,
    editMode: false,
    montePoints: [],
    monteInterval: setInterval(monteCarlo, 20),
    unionPoints: [],
    intersectPoints: [],
    intersectLines: [],
    enclosedLines: [],
    pointsOfIntersection: [],
    undoPoints: []
};
export let setup = () => {
    // Main Canvas Setup
    let container = document.getElementById('canvas-container');
    let containerWidth = container.offsetWidth;
    let containerHeight = container.offsetHeight;
    state.canvas = createCanvas(containerWidth, containerHeight);
    state.canvas.parent('canvas-container');
    // Disabling default context menu as we want right-clicking capability
    state.canvas.elt.oncontextmenu = (e) => {
        e.preventDefault();
    };

    // Adding event listeners for our buttons
    const createShapeButton = select('#create-shape-btn');
    // Getting the icon
    const createShapeIcon = select('#create-shape-icon')
    // Triggers shape creation
    createShapeButton.mousePressed(() => {
        // Ensuring we only save if shape has 3 points
        if (state.createShapeMode && state.points.length > 2) {
            completeShape();
            state.createShapeMode = false;
            // Toggling mode
        }
        else if (!state.createShapeMode) {
            state.createShapeMode = true;
            // Should reset
        }
        else {
            state.points = [];
            state.createShapeMode = false;
        };


        // HTML changes to the button depending on the mode
        createShapeIcon.class(state.createShapeMode ? "fa-solid fa-check fa-2xl" : "fa-solid fa-plus fa-2xl");
        if (state.createShapeMode) {
            createShapeIcon.style("color", "rgb(55, 254, 114)")
        } else {
            createShapeIcon.style("color", "rgb(0, 183, 255)")
        }
        // Updating the text on the tooltip
        let tooltip = tooltipList[0];
        if (state.createShapeMode && tooltip._config.title === "Create Shape") {
            tooltip._config.title = "Complete Shape"
        } else {
            tooltip._config.title = "Create Shape"
        }
    });
    // Event listener for select button
    const selectShapeButton = select('#select-shape-btn');
    selectShapeButton.mousePressed(() => {
        resetSelectShape();
    });

    //!!!!!! HELLO HELLO HELLO
    // Editing a shape
    const editShapeButton = select('#edit-shape-btn');
    editShapeButton.mousePressed(() => {
        // Toggling edit mode
        if (!document.getElementById("edit-shape-btn").classList.contains("disabled")) {
            state.editMode = !state.editMode
            console.log(state.editMode)
        }
        // Now, we need to flesh out the offcanvas element with our selected shape
        if (state.editMode) {
            // If I have coded correctly, we should only have 1 selected shape when we are able to edit.
            let selectedShape = state.selectedShapes[0];
            // Populating our offcanvas with the details:
            document.getElementById('shape-name-input').value = selectedShape.name || '';
            document.getElementById('shape-colour-input').value = rgbToHex(selectedShape.colour) || '#000000';
            document.getElementById('shape-points').textContent = `Points: ${selectedShape.points.map(p => `(${p.x}, ${p.y})`).join(', ')}`;
            document.getElementById('shape-vertices').textContent = `Vertices: ${selectedShape.numVertices}`;
            document.getElementById('shape-area').textContent = `Area: ${selectedShape.area}`;

        }
    })

    // Event listeners for the edit shape mode
    document.getElementById('shape-colour-input').addEventListener('input', (event) => {
        // We need to find what shape it is.
        let selectedShape = state.selectedShapes[0];
        // Now changing colour of the shape
        selectedShape.colour = hexToRgb(event.target.value);
    });

    // And for updating the shape.
    document.getElementById('update-shape').addEventListener("click", (event) => {
        let selectedShape = state.selectedShapes[0];

        selectedShape.name = document.getElementById('shape-name-input').value;
        selectedShape.colour = document.getElementById('shape-colour-input').value;
    })

    // Monte Carlo
    const monteCarloButton = select('#monte-btn');
    const monteCarloIcon = select('#monte-icon')
    monteCarloButton.mousePressed(() => {
        console.log(state.monteCarloMode);
        // Changing the icon
        // Toggle monte carlo mode
        if (!state.monteCarloMode) {
            state.monteCarloMode = true;
            state.monteInterval = setInterval(monteCarlo, 20);
            monteCarloIcon.class("fa-solid fa-pause fa-xl")
        } else {
            clearInterval(state.monteInterval);
            state.pauseMonte = !state.pauseMonte;
            if (state.pauseMonte) {
                monteCarloIcon.class("fa-solid fa-play fa-xl")
            } else {
                monteCarloIcon.class("fa-solid fa-pause fa-xl")
            }
        }
    });
    // Intersection algorithm
    const intersectBtn = select("#intersection-btn");
    // Now we do an event listener
    intersectBtn.mousePressed(() => {

        // Need to ensure it's not disabled.
        if (!document.getElementById("intersection-btn").classList.contains("disabled")) {
            // We should (if I have coded correctly) have two selected shapes
            // Let's send them to old mate sutherland
            let [shape1, shape2] = state.selectedShapes;
            // If button is pressed, we run sutherland now
            sutherlandHodgman(shape1, shape2);
        };
    });
    // Saving Shapes
    const saveButton = select('#save-shape-btn');
    // Showing button if a shape is selected
    // saveButton.hide();
    // testing
    saveButton.mousePressed(() => {
        // Need to ensure the button isn't disabled.
        if (!document.getElementById("save-shape-btn").classList.contains("disabled")) {
            console.log(state.savingMode)
            state.savingMode = !state.savingMode;
        };
    });

    // Before listening for submit, we need to ensure input is valid
    const shapeNameInput = document.getElementById("shape-name");
    const submitBtn = document.getElementById("save-shape");

    shapeNameInput.addEventListener("input", () => {
        // If there is no input, it's disabled
        if (shapeNameInput.value.trim() === "") {
            submitBtn.disabled = true;
        } else {
            submitBtn.disabled = false;
        }
    })

    // Getting our form
    const saveShapeForm = document.getElementById("saveShapeForm");

    // And now saving the shape
    saveShapeForm.addEventListener("submit", (event) => {
        console.log("Pressed submit");
        event.preventDefault();
        console.log(saveShapeForm.elements['shape-name'].value);
        // Getting shape name
        const shapeName = saveShapeForm.elements['shape-name'].value;
        // Now getting shape selected
        console.log(state.selectedShapes)
        let selectedShape = state.selectedShapes[0];
        // Updating shape name
        selectedShape.name = shapeName;
        const newShape = {
            points: extractPoints(selectedShape),
            colour: selectedShape.colour,
            isSelected: false,
            name: shapeName
        };

        //! Updating to Mongo
        // const token = localStorage.getItem("authToken");
        // if (token) {
        //     // Fetching current shapes
        //     const currNames = SaverLoader.getShapes(token);

        //     // And saving the shape
        //     if (newShape.name && !(newShape.name in currNames)) {
        //         SaverLoader.saveShape(newShape, token);
        //         updateSavedShapes();
        //         // Resetting our select shape mode.
        //         state.savingMode = false;
        //         state.selectShapeMode = true;
        //         resetSelectShape();
        //         submitBtn.disabled = true
        //         console.log("Saved Shape Successfully.");
        //         saveShapeForm.elements['shape-name'].value = '';
        //     }
        // } else {
        //     window.alert("Please sign in to save shapes.")
        // }


        // Now we send it to the app
        fetch("/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ shape: newShape }),
        }).then(response => response.json()).then(data => {
            if (data.success) {
                updateSavedShapes();
                // Resetting our select shape mode.
                state.savingMode = false;
                state.selectShapeMode = true;
                resetSelectShape();
                submitBtn.disabled = true
                console.log("Saved Shape Successfully.");
            }
            else {
                console.log("Error: Failed to save shape.");
            }
            ;
        }).catch(error => { console.log(error); });
        state.savedShapes.push(selectedShape);
        console.log(`Pushed shape: ${selectedShape.name}`);
        saveShapeForm.elements['shape-name'].value = '';
    });

    const closeButton = document.getElementById("close-btn");
    closeButton.addEventListener("click", () => {
        state.savingMode = false;
    })
    // This is for clearing the canvas
    const clearCanvasBtn = select("#clear-btn");
    clearCanvasBtn.mousePressed(() => {
        // Resets our points and shapes.
        state.shapes = [];
        state.points = [];
        state.pointsOfIntersection = []
        state.intersectLines = []
        state.enclosedLines = []
        state.undoPoints = []
        state.movingShapes = []
        if (state.selectShapeMode) {
            resetSelectShape();
        };
        // Clearing Monte Carlo
        if (state.monteCarloMode) {
            clearInterval(state.monteInterval);
            state.montePoints = [];
            state.unionPoints = [];
            state.intersectPoints = [];
            state.pauseMonte = false;
            monteCarloIcon.class("fa-solid fa-braille fa-lg");
            state.monteCarloMode = false;
        }
    });
    // Undoing
    const undoBtn = select("#undo-btn");
    undoBtn.mousePressed(() => {
        if (state.points.length > 0) {
            state.undoPoints.push(state.points.pop());
        }
    });
    // Redoing
    const redoBtn = select("#redo-btn");
    redoBtn.mousePressed(() => {
        if (state.undoPoints.length > 0) {
            state.points.push(state.undoPoints.pop());
        }
    });

    // runTests();

};

// Making a function to handle resetting our selected shape mode
export function resetSelectShape() {
    // Getting our html elements
    let selectIcon = select("#select-shape-icon");
    // let saveButton = select("#save-shape-btn");

    // And select shape and load shape tooltips
    let selectTip = tooltipList[1];

    // If toggled on we reset
    if (state.selectShapeMode) {
        // Reset selected shapes
        for (let shape of state.selectedShapes) {
            shape.isSelected = false;
        };
        // Hiding buttons
        state.selectedShapes = [];
        document.getElementById("intersection-btn").classList.add("disabled");
        document.getElementById("save-shape-btn").classList.add("disabled");
        document.getElementById("save-icon").classList.add("disabled");
        document.getElementById("edit-shape-btn").classList.add("disabled");
        document.getElementById("edit-shape-icon").classList.add("disabled");
        // Resetting intersection
        console.log("Resetting points of intersection")
        state.pointsOfIntersection = [];
        // Updating html canvas elements
        selectIcon.class("fa-solid fa-hand-pointer fa-xl");
        selectIcon.style("color", "rgb(255, 240, 104)")
        selectTip._config.title = "Select Shape";

        state.selectShapeMode = false;
        state.editMode = false;
    }
    else {
        // Updating html canvas elements
        selectIcon.class("fa-solid fa-xmark fa-2xl");
        selectIcon.style("color", "lightcoral")
        selectTip._config.title = "Complete Selection";
        state.selectShapeMode = true;
    };
};
// Helper function to extract points from p5 context
function extractPoints(shape) {
    let allPoints = [];
    // Adding all points
    for (let p of shape.points) {
        console.log(p);
        allPoints.push([p.x, p.y]);
    }
    ;
    console.log(allPoints);
    return allPoints;
}
;
// And a function to update our dropdown list of saved shapes
async function updateSavedShapes() {
    // const token = localStorage.getItem("authToken");

    // if (token === null) {
    //     console.log("Not Logged In");
    //     return;
    // }

    // try {
    //     let shapes = await SaverLoader.getShapes(token, "2d");
    //     console.log(shapes)
    // } catch (error) {
    //     console.log(error);
    // }
    // }).catch(error => {
    //     console.error('Error fetching shapes:', error);
    // });


    fetch("/shapes")
    .then(response => response.json())
    .then(shapes => {
        // Getting our shapes list container
        const shapesList = document.querySelector(".shapes-list");
        // Clearing the list
        shapesList.innerHTML = '';
        // Now adding a list item for each shape
        shapes.forEach((shape, index) => {
            const shapeBox = document.createElement('div');
            shapeBox.className = 'btn shape-box d-flex flex-row align-items-center';
            shapeBox.id = `shape-${index}`;

            const iconBox = document.createElement('div');
            iconBox.className = 'icon-box';
            const icon = document.createElement('i');
            icon.className = 'fa-solid fa-cube fa-lg';
            iconBox.appendChild(icon);

            const shapeName = document.createElement('p');
            shapeName.textContent = shape.name;

            shapeBox.appendChild(iconBox);
            shapeBox.appendChild(shapeName);

            // Adding click event listener to load the shape
            shapeBox.addEventListener('click', () => {
                handleShapeSelection(shape);
            });

            shapesList.appendChild(shapeBox);
        });
    })
};

// Generating our default shapes.
function generateDefaultShapes() {
    let defaultShapes = [];
    // For a square
    const squarePoints = [
        [300, 150],
        [600, 150],
        [600, 450],
        [300, 450]];

    let aSquare = new Shape(squarePoints, DEFAULT_SHAPE_COLOUR);
    aSquare.name = "Square";
    defaultShapes.push(aSquare);


    const trianglePoints = [
        [450,150],
        [600,450],
        [300,450]
    ];

    let aTriangle = new Shape(trianglePoints, DEFAULT_SHAPE_COLOUR);
    aTriangle.name = "Triangle";
    defaultShapes.push(aTriangle);

    return defaultShapes;
}
const defaultShapes = generateDefaultShapes();

function setupDefaultShapes() {
    // Getting our shapes list container
    const shapesList = document.querySelector(".default-shapes-list");
    // Clearing the list
    shapesList.innerHTML = '';
    // Now adding a list item for each shape
    defaultShapes.forEach((shape, index) => {
        const shapeBox = document.createElement('div');
        shapeBox.className = 'btn shape-box d-flex flex-row align-items-center';
        shapeBox.id = `shape-${index}`;

        const iconBox = document.createElement('div');
        iconBox.className = 'icon-box';
        const icon = document.createElement('i');
        icon.className = 'fa-solid fa-cube fa-lg';
        iconBox.appendChild(icon);

        const shapeName = document.createElement('p');
        shapeName.textContent = shape.name;

        shapeBox.appendChild(iconBox);
        shapeBox.appendChild(shapeName);

        // Adding click event listener to load the shape
        shapeBox.addEventListener('click', () => {
            handleShapeSelection(shape);
        });

        shapesList.appendChild(shapeBox);
    });

}

// Will handle what happens when we select a saved shape
function handleShapeSelection(shape) {
    // Need to convert points back to a p5 context
    // Let's do that first
    let newPoints = [];
    for (let p of shape.points) {
        newPoints.push(createVector(p[0], p[1]));
    };
    let selectedShape = new Shape(newPoints, shape.colour);

    // for (let s in state.shapes) {
    //     console.log(selectedShape.points);
    //     console.log(s);
    //     if (`${sortPoints(selectedShape.points)}` === `${sortPoints(s.points)}`) {
    //         return;
    //     }
    // }

    state.shapes.push(selectedShape);
};

function loadShapes() {
    updateSavedShapes();
    setupDefaultShapes();
}


// const login = async (user, pass) => {
//     try {
//         const url = "http://127:0.0.0.1:3000/login";

//         const data = {
//             user: user,
//             pass: pass
//         }

//         const headers = {
//             "Content-Type": "application/json"
//         };

//         const response = await axios.post(url, data, { headers });

//         const token = response.data.token;
//         if (token) return token;
//     } catch (error) {
//         console.log(error)
//     }
// };

// const signup = async (user, pass) => {
//     try {
//         const url = "http://127:0.0.0.1:3000/signup";

//         const data = {
//             user: user,
//             pass: pass
//         }

//         const headers = {
//             "Content-Type": "application/json"
//         };

//         const response = await axios.post(url, data, { headers });

//         // const token = response.data.token;
//         // if (token) return token;
//     } catch (error) {
//         console.log(error)
//     }
// };

// async function signin() {
//     // await signup("oskar", "password")
//     const token = await login("oskar", "password");
//     localStorage.setItem("authToken", token)
// }

// signin();



// Initial load of shapes when the page loads
document.addEventListener('DOMContentLoaded', loadShapes());
