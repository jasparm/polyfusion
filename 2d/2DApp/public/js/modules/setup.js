import { Shape } from "./Shape.js";
import { monteCarlo } from "./monteCarlo.js";
import { completeShape } from "./shapeUtils.js";
import { sutherlandHodgman } from "./intersection.js";

export const state = {
    canvas: null,
    shapes: [],
    points: [],
    selectedShapes: [],
    moveShapeIndex: -1,
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
    savedShapes: []
};

export let setup = () => {
    // Canvas Setup
    state.canvas = createCanvas(windowWidth, windowHeight);
    state.canvas.parent('canvas-container');

    // Disabling default context menu as we want right-clicking capability
    state.canvas.elt.oncontextmenu = (e) => {
        e.preventDefault();
    }

    // Adding event listeners for our buttons
    const createShapeButton = select('#create-shape-btn');

    // Triggers shape creation
    createShapeButton.mousePressed(() => {
        // Ensuring we only save if shape has 3 points
        if (state.createShapeMode && state.points.length > 2) {
            completeShape();
            state.createShapeMode = false;
        // Toggling mode
        } else if (!state.createShapeMode) {
            state.createShapeMode = true;
        // Should reset
        } else {
            state.points = [];
            state.createShapeMode = false;
        }
        // HTML changes to the button depending on the mode
        createShapeButton.html(state.createShapeMode ? "Complete Shape" : "Create Shape");
        createShapeButton.class(state.createShapeMode ? "btn btn-success" : "btn btn-primary");
    });

    // Event listener for select button
    const selectShapeButton = select('#select-shape-btn');

    selectShapeButton.mousePressed(() => {
        // Toggling select shape mode
        // state.selectShapeMode = !state.selectShapeMode;

        selectShapeButton.html(state.selectShapeMode ? "Complete Selection" : "Select Shape");
        selectShapeButton.class(state.selectShapeMode ? "btn btn-success" : "btn btn-primary");
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
        } else {
            state.monteInterval = setInterval(monteCarlo, 20);
            pauseMonteButton.show();
        };
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
            selected: false,
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
                console.log("Saved Shape Successfully.");
            } else {
                console.log("Error: Failed to save shape.")
            };
        }).catch(error => { console.log(error) });


        state.savedShapes.push(selectedShape);
        console.log(`Pushed shape: ${selectedShape.name}`);

        saveShapeForm.elements['shape-name'].value = '';
    });
};


// Making a function to handle resetting our selected shape mode
export function resetSelectShape() {
    // Getting our html element
    let selectButton = select("#select-shape-btn");
    let sutherlandButton = select("#sutherland-btn");
    let saveButton = select("#save-shape-btn");

    // If toggled on we reset
    if (state.selectShapeMode) {
        // Reset selected shapes
        for (let shape of state.selectedShapes) {
            shape.isSelected = false;
        };
        // Hiding buttons
        state.selectedShapes = [];
        sutherlandButton.hide();
        saveButton.hide();

        // Updating html canvas elements
        selectButton.html("Select Shape");
        selectButton.class("btn btn-primary");
        state.selectShapeMode = false;
    } else {
        // Updating html canvas elements
        selectButton.html("Complete Selection");
        selectButton.class("btn btn-success");
        state.selectShapeMode = true
    };
};

// Helper function to extract points from p5 context
function extractPoints(shape) {
    let allPoints = [];
    // Adding all points
    for (let p of shape.points) {
        console.log(p)
        allPoints.push([p.x, p.y]);
    };
    console.log(allPoints);
    return allPoints;
};

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
};

// Will handle what happens when we select a saved shape
function handleShapeSelection(shape) {
    // Need to convert points back to a p5 context
    // Let's do that first
    let selectedShape = shape;

    let newPoints = [];
    for (let p of selectedShape.points) {
        newPoints.push(createVector(p[0], p[1]));
    };
    selectedShape.points = newPoints;

    console.log(selectedShape.points);

    state.shapes.push(selectedShape);
};

// Initial load of shapes when the page loads
document.addEventListener('DOMContentLoaded', updateSavedShapes);