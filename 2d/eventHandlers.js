import { Shape } from "./geometry";
import { rayCast } from "./utilities";
import { sutherlandHodgman } from "./sutherlandHodgman";



export let createShapeMode = false;
export let points = [];
export let shapes = [];

let selectedShapes = [];
export let selectShapeMode = false;

// MONTE CARLO
export let monteCarloMode = false;
let pauseMonte = false;
let monteInterval = setInterval(monteCarlo, 20);

export function setupEventListeners() {
    // Adding event listeners for our buttons
    const createShapeButton = select('#create-shape-btn');

    // Triggers shape creation
    createShapeButton.mousePressed(() => {
        // Ensuring we only save if shape has 3 points
        if (createShapeMode && points.length > 2) {
            completeShape();
            createShapeMode = false;
        // Toggling mode
        } else if (!createShapeMode) {
            createShapeMode = true;
        // Should reset
        } else {
            points = [];
            createShapeMode = false;
        };
        // HTML changes to the button depending on the mode
        createShapeButton.html(createShapeMode ? "Complete Shape" : "Create Shape");
        createShapeButton.class(createShapeMode ? "btn btn-success" : "btn btn-primary");
    });


    // Event listener for select button
    const selectShapeButton = select('#select-shape-btn');

    selectShapeButton.mousePressed(() => {
        // Toggling select shape mode
        selectShapeMode = !selectShapeMode;

        selectShapeButton.html(selectShapeMode ? "Complete Selection" : "Select Shape");
        selectShapeButton.class(selectShapeMode ? "btn btn-success" : "btn btn-primary");

        // Resetting selected shapes
        if (!selectShapeMode) {
            for (let shape of selectedShapes) {
                shape.isSelected = false;
            };
            selectedShapes = [];
            sutherlandButton.hide();
        };
    });

    // Monte Carlo
    const monteCarloButton = select('#monte-carlo-btn');
    const pauseMonteButton = select('#pause-monte-btn');
    pauseMonteButton.hide();

    monteCarloButton.mousePressed(() => {
        // Toggle monte carlo mode
        monteCarloMode = !monteCarloMode;

        monteCarloButton.html(monteCarloMode ? "Done" : "Monte Carlo");
        if (!monteCarloMode) {
            //! Turn this into a function that gets called
            //! Like a cleanup() function
            clearInterval(monteInterval);
            montePoints = [];
            unionPoints = [];
            intersectPoints = [];
            pauseMonteButton.hide();
            pauseMonte = false;
            pauseMonteButton.html("Pause");
        } else {
            monteInterval = setInterval(monteCarlo, 20);
            pauseMonteButton.show();
        };
    });

    // Pausing the monte carlo method
    pauseMonteButton.mousePressed(() => {
        clearInterval(monteInterval);
        pauseMonte = !pauseMonte;

        pauseMonteButton.html(pauseMonte ? "Resume" : "Pause");
    });


    // Sutherland-Hodgman
    const sutherlandButton = select('#sutherland-btn');
    // Initially hiding the button
    sutherlandButton.hide();

    // Now we do an event listener
    sutherlandButton.mousePressed(() => {
        // We should (if I have coded correctly) have two selected shapes
        // Let's send them to old mate sutherland
        let [shape1, shape2] = selectedShapes;

        // If button is pressed, we run sutherland now
        sutherlandHodgman(shape1, shape2);

        //! Leave here for now
    });
};

// Called when the complete button is pressed.
function completeShape() {
    // Adds the list of points to our shapes array
    if (points.length > 0) {
        // Creating a new shape class and adding to our shapes array
        const newShape = new Shape(points);
        shapes.push(newShape);
        // And resetting our current shape
        points = [];
    };
};


export function deleteShape() {
    // Going through our shapes to see which aren't selected.
    // - we keep these ones
    let shapesToKeep = [];
    for (let i = 0; i < shapes.length; i++) {
        if (!shapes[i].selected) {
            shapesToKeep.push(shapes[i]);
        } else {
            shapes[i].selected = false;
        };
    };
    // Resetting selected shapes and buttons now.
    //! Make a single function as callback function for event handler in setup().
    shapes = shapesToKeep;
    const selectShapeButton = select('#select-shape-btn');
    selectedShapes = [];
    selectShapeMode = false;
    selectShapeButton.html("Select Shape");
    selectShapeButton.class("btn btn-primary");
};

// Function that handles the selection of shapes
export function selectShape() {
    // We need to see which shape we clicked on
    // Can just re-use ray-casting
    //! SELECTING SHAPES
    for (let i = 0; i < shapes.length; i++) {
        if (rayCast(mouseX, mouseY, shapes[i].points)) {
            // If shape is already selected, de-select it
            if (shapes[i].selected) {
                deSelect(shapes[i]);
            } else {
                shapes[i].isSelected = true;
                selectedShapes.push(shapes[i]);
            };
        };
    };
    // When we select two shapes, we have the option of using the sutherland-hodgman alg
    const sutherlandButton = select('#sutherland-btn');
    if (selectedShapes.length == 2) {
        sutherlandButton.show();
    } else {
        sutherlandButton.hide();
    };
};

// De-Selects our shape
function deSelect(shape) {
    // Not selected anymore
    shape.isSelected = false;
    // Index to remove shape
    const index = selectedShapes.indexOf(shape);
    // Removing shape from selected shapes
    selectedShapes.splice(index, 1);

    // Now checking if we have no selected shapes anymore
    if (selectedShapes.length == 0) {
        const selectShapeButton = select('#select-shape-btn');
        selectShapeButton.html("Select Shape");
        selectShapeButton.class("btn btn-primary");
        selectShapeMode = false;
    }
}
