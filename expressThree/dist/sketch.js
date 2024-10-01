import { setup, state } from "./modules/setup.js";
import { keyPressed, mousePressed, mouseReleased, mouseDragged, mouseMoved } from "./modules/eventHandlers.js";

const DEFAULT_SHAPE_COLOUR = "rgb(180, 180, 180)"

window.setup = setup;
window.keyPressed = keyPressed;
window.mousePressed = mousePressed;
window.mouseReleased = mouseReleased;
window.mouseDragged = mouseDragged;
window.mouseMoved = mouseMoved;
// Draw method. Handles what we see on the canvas.
window.draw = () => {
    // Background colour of the canvas
    const backColor = getComputedStyle(document.documentElement).getPropertyValue('--canvas-colour');
    background(backColor);
    // Drawing monte carlo
    if (state.monteCarloMode) {
        // Let's begin by projecting points randomly in our canvas
        for (let mpoint of state.montePoints) {
            strokeWeight(20);
            stroke(mpoint.colour);
            point(mpoint.x, mpoint.y);
        }
        ;
        // Here is our iOU
        let iOU = state.intersectPoints.length / state.unionPoints.length * 100;
        console.log(`${iOU}%`);
    }
    // Drawing all shapes on the canvas
    for (let shape of state.shapes) {
        if (shape.selected && !state.editMode) {
            stroke('white');
        }
        else {
            if (shape.colour === null) {
                stroke(DEFAULT_SHAPE_COLOUR)
            } else {
                stroke(shape.colour);
            }

        }
        drawShape(shape.points);
    };
    // And drawing the current shape being made on the canvas
    stroke(DEFAULT_SHAPE_COLOUR);
    drawShape(state.points);

    highlightArea(state.pointsOfIntersection);
};

function windowResized() {
    // Adjusting canvas size when window is resized
    let container = document.getElementById('canvas-container');
    let containerWidth = container.offsetWidth;
    let containerHeight = container.offsetHeight;
    resizeCanvas(containerWidth, containerHeight);

};
// Function that draws our shapes.
// shape is a
function drawShape(shape) {
    // Drawing the shapes
    strokeWeight(20);
    for (let p of shape) {
        // canvas.vertex(p.x, p.y);
        point(p.x, p.y);
    };
    // Drawing the lines
    strokeWeight(7);
    for (let i = 0; i < shape.length - 1; i++) {
        let p1 = shape[i];
        let p2 = shape[i + 1];
        line(p1.x, p1.y, p2.x, p2.y);
    };
    // Connecting last point with the first point
    if (shape.length > 2) {
        let p1 = shape[0];
        let pLast = shape[shape.length - 1];
        line(pLast.x, pLast.y, p1.x, p1.y);
    };
};
function highlightArea(shape) {
    beginShape();
    stroke('white')
    fill(`rgba(39, 189, 245, 0.45)`);
    strokeWeight(20);
    for (let p of shape) {
        point(p.x, p.y);
    }
    ;
    strokeWeight(7);
    for (let p of shape) {
        vertex(p.x, p.y);
    }
    ;
    endShape(CLOSE);
};
