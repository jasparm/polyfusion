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

    // Now the modal button
    const saveShapeBtn = select('#save-shape');

    // saveShapeBtn.mousePressed(() => {
    //     // Need to catch submit

    //     // Pass every selected shape to our save shape method.
    //     for (let shape of state.selectedShapes) {
    //         saveShape(shape);
    //     };

    //     resetSelectShape();
    // })

    // // Event listener
    // saveButton.mousePressed(() => {

    // });

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
    }
}