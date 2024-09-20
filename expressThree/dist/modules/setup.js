import { Shape } from "./Shape.js";
import { monteCarlo } from "./monteCarlo.js";
import { completeShape } from "./shapeUtils.js";
import { sutherlandHodgman } from "./intersection.js";

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
    // Canvas Setup
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
        createShapeIcon.class(state.createShapeMode ? "fa-solid fa-check fa-xl" : "fa-solid fa-plus fa-2xl");
        // Updating the text on the tooltip
        let tooltip = tooltipList[0];
        if (state.createShapeMode && tooltip._config.title === "Create Shape") {
            tooltip._config.title = "Complete Shape"
        } else {
            tooltip._config.title = "Create Shape"
        }
        console.log(tooltip);
    });
    // Event listener for select button
    const selectShapeButton = select('#select-shape-btn');
    selectShapeButton.mousePressed(() => {
        resetSelectShape();
    });
    // Monte Carlo
    const monteCarloButton = select('#monte-carlo-btn');
    const pauseMonteButton = select('#pause-monte-btn');
    pauseMonteButton.hide();
    monteCarloButton.mousePressed(() => {
        // Toggle monte carlo mode
        state.monteCarloMode = !state.monteCarloMode;
        monteCarloButton.html(state.monteCarloMode ? "Done" : "Monte Carlo");
        if (!state.monteCarloMode) {
            //! Turn this into a function that gets called
            //! Like a cleanup() function
            clearInterval(state.monteInterval);
            state.montePoints = [];
            state.unionPoints = [];
            state.intersectPoints = [];
            pauseMonteButton.hide();
            state.pauseMonte = false;
            pauseMonteButton.html("Pause");
        }
        else {
            state.monteInterval = setInterval(monteCarlo, 20);
            pauseMonteButton.show();
        }
        ;
    });
    // Pausing the monte carlo method
    pauseMonteButton.mousePressed(() => {
        clearInterval(state.monteInterval);
        state.pauseMonte = !state.pauseMonte;
        pauseMonteButton.html(state.pauseMonte ? "Resume" : "Pause");
    });
    // Sutherland-Hodgman
    const sutherlandButton = select('#sutherland-btn');
    // Initially hiding the button
    sutherlandButton.hide();
    // Now we do an event listener
    sutherlandButton.mousePressed(() => {
        // We should (if I have coded correctly) have two selected shapes
        // Let's send them to old mate sutherland
        let [shape1, shape2] = state.selectedShapes;
        // If button is pressed, we run sutherland now
        sutherlandHodgman(shape1, shape2);
        //! Leave here for now
    });
    // Saving Shapes
    const saveButton = select('#save-shape-btn');
    // Showing button if a shape is selected
    saveButton.hide();
    // testing
    saveButton.mousePressed(() => {
        // This means we can't delete any shapes.
        state.selectShapeMode = false;
    });
    // Getting our form
    const saveShapeForm = document.getElementById("saveShapeForm");
    // And now saving the shape
    saveShapeForm.addEventListener("submit", (event) => {
        console.log("Pressed submit");
        event.preventDefault();
        // Getting shape name
        const shapeName = saveShapeForm.elements['shape-name'].value;
        // Now getting shape selected
        let selectedShape = state.selectedShapes[0];
        // Updating shape name
        selectedShape.name = shapeName;
        const newShape = {
            points: extractPoints(selectedShape),
            colour: selectedShape.colour,
            isSelected: false,
            name: selectedShape.name
        };
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
                state.selectShapeMode = true;
                resetSelectShape();
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
    // This is for clearing the canvas
    const clearCanvasBtn = select("#clear-btn");
    clearCanvasBtn.mousePressed(() => {
        // Resets our points and shapes.
        state.shapes = [];
        state.points = [];
        resetSelectShape();
        
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
};
// Making a function to handle resetting our selected shape mode
export function resetSelectShape() {
    // Getting our html elements
    let selectIcon = select("#select-shape-icon");
    let sutherlandButton = select("#sutherland-btn");
    let saveButton = select("#save-shape-btn");

    // And select shape tooltips
    let selectTip = tooltipList[1];

    // If toggled on we reset
    if (state.selectShapeMode) {
        // Reset selected shapes
        for (let shape of state.selectedShapes) {
            shape.isSelected = false;
        }
        ;
        // Hiding buttons
        state.selectedShapes = [];
        sutherlandButton.hide();
        saveButton.hide();
        // Resetting intersection
        state.pointsOfIntersection = [];
        // Updating html canvas elements
        selectIcon.class("fa-solid fa-hand-pointer fa-xl");
        selectTip._config.title = "Select Shape";
        state.selectShapeMode = false;
    }
    else {
        // Updating html canvas elements
        selectIcon.class("fa-solid fa-xmark fa-2xl");
        selectTip._config.title = "Complete Selection";
        state.selectShapeMode = true;
    }
    ;
}
;
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
function updateSavedShapes() {
    fetch("/shapes")
        .then(response => response.json())
        .then(shapes => {
        // Getting our dropdown menu
        const shapeDropDown = document.getElementById("shapesDropdown");
        // Clearing the menu
        shapeDropDown.innerHTML = '';
        // Now adding a dropdown element for each shape
        shapes.forEach(shape => {
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.className = 'dropdown-item';
            link.textContent = shape.name;
            // And this allows us to place a shape
            link.addEventListener('click', () => {
                handleShapeSelection(shape);
            });
            listItem.appendChild(link);
            shapesDropdown.appendChild(listItem);
        });
    }).catch(error => {
        console.error('Error fetching shapes:', error);
    });
}
;
// Will handle what happens when we select a saved shape
function handleShapeSelection(shape) {
    // Need to convert points back to a p5 context
    // Let's do that first
    let newPoints = [];
    for (let p of shape.points) {
        newPoints.push(createVector(p[0], p[1]));
    }
    ;
    let selectedShape = new Shape(newPoints);
    state.shapes.push(selectedShape);
}
;
// Initial load of shapes when the page loads
document.addEventListener('DOMContentLoaded', updateSavedShapes);
