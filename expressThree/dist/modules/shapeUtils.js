import { state, resetSelectShape } from "./setup.js";
import { Shape } from "./Shape.js";

const DEFAULT_SHAPE_COLOUR = "rgb(180, 180, 180)"

export function deleteShape() {
    // Going through our shapes to see which aren't selected.
    // - we keep these ones
    let shapesToKeep = [];
    for (let i = 0; i < state.shapes.length; i++) {
        if (!state.shapes[i].selected) {
            shapesToKeep.push(state.shapes[i]);
        }
        else {
            state.shapes[i].selected = false;
        }
        ;
    }
    ;
    // Resetting selected shapes and buttons now.
    //! Make a single function as callback function for event handler in setup().
    state.shapes = shapesToKeep;
    resetSelectShape();
}
;
// Function that handles the selection of shapes
export function selectShape() {
    let inShape = false;
    // We need to see which shape we clicked on
    // Can just re-use ray-casting
    for (let i = 0; i < state.shapes.length; i++) {
        if (rayCast(mouseX, mouseY, state.shapes[i].points)) {
            // If shape is already selected, de-select it
            if (state.shapes[i].selected) {
                deSelect(state.shapes[i]);
                inShape = true
            }
            else if (!state.shapes[i].selected) {
                state.shapes[i].isSelected = true;
                state.selectedShapes.push(state.shapes[i]);
                inShape = true
                console.log("selected shape")
                console.log(state.shapes[i])
            }
        }
    }
    // If we didn't click on a shape, we reset and clear
    if (!state.savingMode && !state.editMode && mouseInCanvas() && !inShape) {
        console.log("resetting selected shapes")
        resetSelectShape();
        return;
    }
    // When we select two shapes, we have the option of using the sutherland-hodgman alg
    // When we select more than one, we can save
    if (state.selectedShapes.length < 3) {
        if (state.selectedShapes.length == 1) {
            document.getElementById("intersection-btn").classList.add("disabled");
            document.getElementById("save-shape-btn").classList.remove("disabled");
            document.getElementById("save-icon").classList.remove("disabled");
            document.getElementById("edit-shape-btn").classList.remove("disabled");
            document.getElementById("edit-shape-icon").classList.remove("disabled");
        }
        else if (state.selectedShapes.length == 2) {
            document.getElementById("intersection-btn").classList.remove("disabled");
            document.getElementById("save-shape-btn").classList.add("disabled");
            document.getElementById("save-icon").classList.add("disabled");
            document.getElementById("edit-shape-btn").classList.add("disabled");
            document.getElementById("edit-shape-icon").classList.add("disabled");
        }
        else {
            document.getElementById("save-shape-btn").classList.add("disabled");
            document.getElementById("save-icon").classList.add("disabled");
            document.getElementById("edit-shape-btn").classList.add("disabled");
            document.getElementById("edit-shape-icon").classList.add("disabled");
            document.getElementById("intersection-btn").classList.add("disabled");
        }
    }
    else {
        document.getElementById("intersection-btn").classList.add("disabled");
        document.getElementById("save-shape-btn").classList.add("disabled");
        document.getElementById("save-icon").classList.add("disabled");
        document.getElementById("edit-shape-btn").classList.add("disabled");
        document.getElementById("edit-shape-icon").classList.add("disabled");
    }
}
// De-Selects our shape
export function deSelect(shape) {
    // Not selected anymore
    shape.isSelected = false;
    // Index to remove shape
    const index = state.selectedShapes.indexOf(shape);
    // Removing shape from selected shapes
    state.selectedShapes.splice(index, 1);
    // Now checking if we have no selected shapes anymore
    // if (state.selectedShapes.length == 0) {
    //     resetSelectShape();
    // };
}
;
// Checks if the user's mouse is within our canvas
export function mouseInCanvas() {
    return !mouseInToolbar() && mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;
}

// Checks if the user's mouse is within the toolbar
function mouseInToolbar() {

  const canvas = document.querySelector('canvas');

  const canvasRect = canvas.getBoundingClientRect();

  const clientX = mouseX + canvasRect.left;
  const clientY = mouseY + canvasRect.top;


  const toolbar = document.getElementById("toolbar");
  const toolbarRect = toolbar.getBoundingClientRect();

  return clientY >= toolbarRect.top && clientY <= toolbarRect.bottom && clientX >= toolbarRect.left && clientX <= toolbarRect.right;
}
export function checkConvexNew(points) {
    let numPoints = points.length;
    // Triangles are always convex
    if (numPoints < 4) {
        return true;
    }
    ;
    // sign variable as cross product of previous triplet needs to be same sign.
    let sign = 0;
    // Going through each vertex and checking if the cross product between each triplet of vertices all have the same sign. (previous implementation only worked for clockwise creation of points.)
    for (let i = 0; i < numPoints; i++) {
        // First vector
        let vecX1 = points[(i + 1) % numPoints].x - points[i].x;
        let vecY1 = points[(i + 1) % numPoints].y - points[i].y;
        // Second vector
        let vecX2 = points[(i + 2) % numPoints].x - points[(i + 1) % numPoints].x;
        let vecY2 = points[(i + 2) % numPoints].y - points[(i + 1) % numPoints].y;
        let crossProd = vecX1 * vecY2 - vecY1 * vecX2;
        // console.log(`Cross Product at index ${i}: ${crossProd}`);
        // Now we need to check if the signs match
        if (crossProd !== 0) {
            // If sign hasn't been set yet, set it
            if (sign === 0) {
                sign = Math.sign(crossProd);
                // console.log(`Initial sign set to: ${sign}`);
                // And if next cross prod doesn't have same sign, return false
            }
            else if (Math.sign(crossProd) !== sign) {
                // console.log(`Sign mismatch at index ${i}: ${Math.sign(crossProd)} != ${sign}`);
                return false;
            }
            ;
        }
        ;
    }
    ;
    // And if we pass every check, we have a convex shape.
    return true;
}
;
// Ray-casting algorithm to check if a point is within a shape
// See this for info: https://www.youtube.com/watch?v=RSXM9bgqxJM
export function rayCast(x, y, shape) {
    let counter = 0;
    // Iterating through each edge of the given shape
    for (let i = 0, j = shape.length - 1; i < shape.length; j = i++) {
        // Getting coordinates of current and previous vertices (representing an edge)
        let x1 = shape[i].x, y1 = shape[i].y;
        let x2 = shape[j].x, y2 = shape[j].y;
        // Checking if vertical position of our given point is within the bounds
        let verticalPosition = ((y1 > y) != (y2 > y));
        // Getting the greatest value of x such that if x < x0 (0) it crosses our edge
        // Basically depends on the height we are at so we get the remaining proportion and multiply by horizontal distance.
        let horizontalIntersection = (x < (x2 - x1) * (y - y1) / (y2 - y1) + x1);
        // Count number of times we intersect
        if (verticalPosition && horizontalIntersection) {
            counter++;
        }
        ;
    }
    ;
    // Odd = true, even = false
    return counter % 2 == 1;
}
;
// Called when the complete button is pressed.
export function completeShape() {
    // Adds the list of points to our shapes array
    if (state.points.length > 0) {
        // Creating a new shape class and adding to our shapes array
        let newShape = new Shape(state.points, DEFAULT_SHAPE_COLOUR);
        state.shapes.push(newShape);
        // And resetting our current shape
        state.points = [];
        state.undoPoints = [];
    }
}

// Converts RBG Colour to Hexadecimal for html purposes.
export function rgbToHex(rgb) {
    const result = rgb.match(/\d+/g);
    if (result && result.length === 3) {
        const r = parseInt(result[0]).toString(16).padStart(2, '0');
        const g = parseInt(result[1]).toString(16).padStart(2, '0');
        const b = parseInt(result[2]).toString(16).padStart(2, '0');
        return `#${r}${g}${b}`;
    }
    // Default is black if something is incorrect.
    return '#000000';
}

// And the opposite for when we are drawing the shapes after changing colour.
export function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgb(${r}, ${g}, ${b})`;
}
