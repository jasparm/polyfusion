import { deleteShape, selectShape, deSelect, mouseInCanvas, checkConvexNew, rayCast } from "./shapeUtils.js";
import { state } from "./setup.js";

let moveShapeIndex = -1

// The final boss of key pressing
export let keyPressed = () => {
    // Deleting shapes - keycode is 8 for delete
    if (keyCode === 8 && state.selectShapeMode) {
        console.log("Delete pressed.")
        deleteShape();
    };
};

// The final boss of mouse pressing
//! Turn the code under each mouse pressed into functions so we know what's going on
export let mousePressed = () => {
    // Left click adds a point to the canvas for the moment
    if (mouseButton === LEFT) {
        // Creating a shape
        if (mouseInCanvas() && state.createShapeMode) {
            let newPoint = createVector(mouseX, mouseY);
            state.points.push(newPoint);
            // Need to now ensure that each point results in a convex shape
            // If convex, we add
            if (!checkConvexNew(state.points)) {
                state.points.pop()
            };
        }
        // Now checking if select shape mode is on
        else if (state.selectShapeMode) {
            selectShape();
        }
        // Otherwise, moving a shape
        else {
            // Checking if we clicked on any shape
            for (let i = 0; i < state.shapes.length; i++) {
                // Using ray casting to check if the user has clicked inside a shape
                if (rayCast(mouseX, mouseY, state.shapes[i].points)) {
                    state.moveShapeIndex = i;
                    state.moveOffset = createVector(mouseX, mouseY);
                    return;
                };
            };
        };
    };
};

// Resets move shape index
export let mouseReleased = () => {
    state.moveShapeIndex = -1;
    cursor();
};

// Override method for implementation when the mouse is being dragged
export let mouseDragged = () => {
    if (state.moveShapeIndex !== -1) {
        cursor('grabbing');
        // Getting the shape we are moving
        let shape = state.shapes[state.moveShapeIndex].points;
        let moveX = mouseX - state.moveOffset.x;
        let moveY = mouseY - state.moveOffset.y;
        // Updating each point by the offset
        for (let p of shape) {
            p.x += moveX;
            p.y += moveY;
        };
        // Updating offset
        state.moveOffset.set(mouseX, mouseY);
    };
};