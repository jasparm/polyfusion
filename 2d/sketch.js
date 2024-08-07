/*
File containing the code for our 2d canvas.
*/

let canvas;
let createShapeMode = false;
let shapes = [];
let points = [];

function setup() {
    canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas-container');

    // Adding event listeners for our buttons
    const createShapeButton = select('#create-shape-btn');
    const completeButton = select('#complete-btn');

    createShapeButton.mousePressed(() => {
        createShapeMode = true;
        createShapeButton.hide();
        completeButton.show();
    });

    completeButton.mousePressed(() => {
        createShapeMode = false;
        completeShape();
        completeButton.hide();
        createShapeButton.show();
    });
}


function mousePressed() {
    // Ensures mouse is within the canvas bounds
    if (mouseInCanvas() && createShapeMode) {
        points.push(createVector(mouseX, mouseY));
    }
}

// Checks if the user's mouse is within our canvas
function mouseInCanvas() {
    return mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height
}

function completeShape() {
    // Adds the list of points to our shapes array
    if (points.length > 0) {
        shapes.push(points);
        points = [];
    }
}

function drawShape(shape) {
    // Drawing the shapes
    strokeWeight(20);
    for (let p of shape) {
        point(p.x, p.y);
        }
    // Drawing the lines
    strokeWeight(7);
    for (let i = 0; i < shape.length - 1; i++) {
        let p1 = shape[i];
        let p2 = shape[i + 1];
        line(p1.x, p1.y, p2.x, p2.y);
    }
    // Connecting last point with the first point
    if (shape.length > 2) {
        let p1 = shape[0];
        let pLast = shape[shape.length - 1];
        line(pLast.x, pLast.y, p1.x, p1.y);
    }
}

// Draw method. Handles what we see on the canvas
function draw() {
    // Light grey background colour
    background(220);
    // Drawing all shapes on the canvas
    for (let shape of shapes) {
        drawShape(shape);
    }

    // And drawing the current shape
    drawShape(points);
}





/**
 * Function that checks if the user has clicked on a given point
 * @param {Number} userX - User's clicked x location
 * @param {Number} userY - User's clicked y location
 * @param {Number} pointX - x-coordinate of point we are testing against
 * @param {Number} pointY - y-coordinate of point we are testing against
 * @param {Number} weight - stroke weight of the point
 */
function isInPoint(userX, userY, pointX, pointY, weight) {
    // weight / 2 <- o -> weight / 2
    let radius = weight / 2;
    let d = dist(userX, userY, pointX, pointY);

    return d <= radius;
}

// Uncomment if we want to manually connect last two vertices
// And put into mousePressed() method.
// // Checking if inPoint function works
// if (isInPoint(mouseX, mouseY, points[0].x, points[0].y, 20)) {
//     // Setting p2 to the first point
//     p2 = points[0];
//     // Removing that last point added
//     points.pop();
// }