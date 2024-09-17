import { deleteShape, selectShape, deSelect, mouseInCanvas, checkConvexNew, rayCast } from "./shapeUtils.js";
import { state } from "./setup.js";
let moveShapeIndex = -1;
// The final boss of key pressing
export let keyPressed = () => {
    // Deleting shapes - keycode is 8 for delete
    if (keyCode === 8 && state.selectShapeMode) {
        console.log("Delete pressed.");
        deleteShape();
    }
    ;
};
// The final boss of mouse pressing
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
                state.points.pop();
                // This resets undo points as if we add a new point, we cannot re-do
            }
            else {
                state.undoPoints = [];
            }
            ;
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
                    moveShapeIndex = i;
                    state.movingShapes.push(i);
                    state.moveOffset = createVector(mouseX, mouseY);
                    // return;
                }
                ;
            }
            ;
        }
        ;
    }
    ;
};
// Resets move shape index
export let mouseReleased = () => {
    moveShapeIndex = -1;
    state.movingShapes = [];
    cursor();
};
// Override method for implementation when the mouse is being dragged
export let mouseDragged = () => {
    if (moveShapeIndex !== -1) {
        cursor('grabbing');
        let moveX = mouseX - state.moveOffset.x;
        let moveY = mouseY - state.moveOffset.y;
        // Getting the shapes we are moving
        // if (state.movingShapes.length == 3) {
        //     let shape = state.shapes[state.shapes.length - 1].points;
        //     // Updating each point by the offset
        //     for (let p of shape) {
        //         p.x += moveX;
        //         p.y += moveY;
        //     };
        // } else {
        for (let idx of state.movingShapes) {
            let shape = state.shapes[idx].points;
            // Updating each point by the offset
            for (let p of shape) {
                p.x += moveX;
                p.y += moveY;
            }
            ;
        }
        // }
        // Updating offset
        state.moveOffset.set(mouseX, mouseY);
    }
    ;
};
