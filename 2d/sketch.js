/*
File containing the code for our 2d canvas.
*/
import { rayCast, checkConvex } from "./utilities";
import { intersectLines, enclosedLines } from "./sutherlandHodgman";
import { montePoints, intersectPoints, unionPoints } from "./monteCarlo";
import { setupEventListeners, createShapeMode, points, shapes, monteCarloMode, deleteShape, selectShape, selectShapeMode } from "./eventHandlers";


let canvas;
// Array of shapes which is an array of points.
// Points array is our current shape being made.

// Default -1 index for not moving
let moveShapeIndex = -1;
let moveOffset;

// Flags for our modes
function setup() {
    // Canvas Setup
    canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas-container');

    // Disabling default context menu as we want right-clicking capability
    canvas.elt.oncontextmenu = (e) => {
        e.preventDefault();
    };

    setupEventListeners();
};


// The final boss of key pressing
function keyPressed() {
    // Deleting shapes - keycode is 8 for delete
    if (keyCode === 8 && selectShapeMode) {
        deleteShape();
    };
};

// The final boss of mouse pressing
//! Turn the code under each mouse pressed into functions so we know what's going on
function mousePressed() {
    // Left click adds a point to the canvas for the moment
    if (mouseButton === LEFT) {
        // If on canvas and we are creating a shape, add point
        // Laptop right click smh
        if (keyIsPressed && keyCode === 17) {
            // Checking if we clicked on any shape
            for (let i = 0; i < shapes.length; i++) {
                // Using ray casting to check if the user has clicked inside a shape
                if (rayCast(mouseX, mouseY, shapes[i].points)) {
                    moveShapeIndex = i;
                    moveOffset = createVector(mouseX, mouseY);
                    return;
                };
            };
        }
        // Otherwise we add a point where the mouse was pressed
        else if (mouseInCanvas() && createShapeMode) {
            let newPoint = createVector(mouseX, mouseY);
            points.push(newPoint);
            // Need to now ensure that each point results in a convex shape
            // If convex, we add
            if (!checkConvex(points)) {
                points.pop()
            };
        }
        // Now checking if select shape mode is on
        else if (selectShapeMode) {
            selectShape();
        }
    // Right click to move a shape for now
    } else if (mouseButton === RIGHT) {
        // Checking if we clicked on any shape
        for (let i = 0; i < shapes.length; i++) {
            // Using our ray casting to detect if a point is in our shape
            if (rayCast(mouseX, mouseY, shapes[i].points)) {
                moveShapeIndex = i;
                moveOffset = createVector(mouseX, mouseY);
                return;
            };
        };
    };
};

// Resets move shape index
function mouseReleased() {
    moveShapeIndex = -1;
};

// Override method for implementation when the mouse is being dragged
function mouseDragged() {
    if (moveShapeIndex !== -1) {
        // Getting the shape we are moving
        let shape = shapes[moveShapeIndex].points;
        let moveX = mouseX - moveOffset.x;
        let moveY = mouseY - moveOffset.y;
        // Updating each point by the offset
        for (let p of shape) {
            p.x += moveX;
            p.y += moveY;
        };
        // Updating offset
        moveOffset.set(mouseX, mouseY);
    };
};

// Checks if the user's mouse is within our canvas
function mouseInCanvas() {
    return mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;
};

// Function that draws our shapes.
// shape is a
function drawShape(shape) {
    // Drawing the shapes
    strokeWeight(20);
    for (let p of shape) {
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

// Draw method. Handles what we see on the canvas.
function draw() {
    // Light grey background colour
    background(220);
    // Drawing all shapes on the canvas
    for (let shape of shapes) {
        if (shape.selected) {
            stroke('red');
        } else {
            stroke('black');
        }
        drawShape(shape.points);
    }
    // And drawing the current shape being made on the canvas
    stroke('black');
    drawShape(points);

    //! Add to seperate function
    if (monteCarloMode) {
        // Let's begin by projecting points randomly in our canvas
        for (let mpoint of montePoints) {
            strokeWeight(20);
            stroke(mpoint.colour);
            point(mpoint.x, mpoint.y);
        };

        // Here is our iOU
        let iOU = intersectPoints.length / unionPoints.length * 100;
        console.log(`${iOU}%`);
    };

    //! Highlighting intersection lines in blue for testing
    for (let lines of intersectLines) {
        let [line1, line2] = lines;
        let [p1, p2] = line1;
        let [p3, p4] = line2;

        stroke("blue");
        line(p1.x, p1.y, p2.x, p2.y);
        line(p3.x, p3.y, p4.x, p4.y);
    };

    for (let _line of enclosedLines) {
        let [p1, p2] = _line;
        stroke("blue");
        line(p1.x, p1.y, p2.x, p2.y);
    };
};