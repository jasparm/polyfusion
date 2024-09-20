import { setup, state } from "./modules/setup.js";
import { keyPressed, mousePressed, mouseReleased, mouseDragged } from "./modules/eventHandlers.js";


window.setup = setup;
window.keyPressed = keyPressed;
window.mousePressed = mousePressed;
window.mouseReleased = mouseReleased;
window.mouseDragged = mouseDragged;
// Draw method. Handles what we see on the canvas.
window.draw = () => {
    // Background colour of the canvas
    const backColor = getComputedStyle(document.documentElement).getPropertyValue('--background-colour');
    background(backColor);
    // Drawing all shapes on the canvas
    for (let shape of state.shapes) {
        if (shape.selected) {
            stroke('white');
        }
        else {
            stroke('black');
        }
        drawShape(shape.points);
    }
    ;
    // And drawing the current shape being made on the canvas
    stroke('black');
    drawShape(state.points);
    //! Add to seperate function
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
    ;
    // //! Highlighting intersection lines in blue for testing
    // for (let lines of state.intersectLines) {
    //     let [line1, line2] = lines;
    //     let [p1, p2] = line1;
    //     let [p3, p4] = line2;
    //     stroke("blue");
    //     line(p1.x, p1.y, p2.x, p2.y);
    //     line(p3.x, p3.y, p4.x, p4.y);
    // };
    // for (let _line of state.enclosedLines) {
    //     let [p1, p2] = _line;
    //     stroke("blue");
    //     line(p1.x, p1.y, p2.x, p2.y);
    // };
    //! And now points of intersection
    highlightArea(state.pointsOfIntersection);
    // for (let _point of state.pointsOfIntersection) {
    //     stroke("yellow");
    // };
};
function windowResized() {
    // Adjusting canvas size when window is resized
    let container = document.getElementById('canvas-container');
    let containerWidth = container.offsetWidth;
    let containerHeight = container.offsetHeight;
    resizeCanvas(containerWidth, containerHeight);
}
// Function that draws our shapes.
// shape is a
function drawShape(shape) {
    // beginShape();
    // Drawing the shapes
    strokeWeight(20);
    for (let p of shape) {
        vertex(p.x, p.y);
        point(p.x, p.y);
    }
    ;
    // Drawing the lines
    strokeWeight(7);
    for (let i = 0; i < shape.length - 1; i++) {
        let p1 = shape[i];
        let p2 = shape[i + 1];
        line(p1.x, p1.y, p2.x, p2.y);
    }
    ;
    // Connecting last point with the first point
    if (shape.length > 2) {
        let p1 = shape[0];
        let pLast = shape[shape.length - 1];
        line(pLast.x, pLast.y, p1.x, p1.y);
    }
    ;
    // endShape(CLOSE);
}
;
function highlightArea(shape) {
    beginShape();
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
}
