/*
File containing the code for our 2d canvas.
*/

let canvas;
let createShapeMode = false;
let shapes = [];
let points = [];

// Default -1 index for not moving
let moveShapeIndex = -1;
let moveOffset;

function setup() {
    canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas-container');

    // Disabling default context menu as we want right-clicking capability
    canvas.elt.oncontextmenu = (e) => {
        e.preventDefault();
    }

    // Adding event listeners for our buttons
    const createShapeButton = select('#create-shape-btn');
    const completeButton = select('#complete-btn');

    // Triggers shape creation
    createShapeButton.mousePressed(() => {
        createShapeMode = true;
        createShapeButton.hide();
        completeButton.show();
    });

    // Completes the shape and saves it
    completeButton.mousePressed(() => {
        createShapeMode = false;
        completeShape();
        completeButton.hide();
        createShapeButton.show();
    });
}


function mousePressed() {
    // Left click adds a point to the canvas for the moment
    if (mouseButton === LEFT) {
        // If on canvas and we are creating a shape, add point
        if (mouseInCanvas() && createShapeMode) {
            points.push(createVector(mouseX, mouseY));
        }

        // Laptop right click smh
        if (keyIsPressed && keyCode === 17) {
            // Checking if we clicked on any shape
            for (let i = 0; i < shapes.length; i++) {
                if (rayCast(mouseX, mouseY, shapes[i])) {
                    moveShapeIndex = i;
                    moveOffset = createVector(mouseX, mouseY);
                    return;
                }
            }
        }
    // Right click to move a shape for now
    } else if (mouseButton === RIGHT) {
        // Checking if we clicked on any shape
        for (let i = 0; i < shapes.length; i++) {
            if (rayCast(mouseX, mouseY, shapes[i])) {
                moveShapeIndex = i;
                moveOffset = createVector(mouseX, mouseY);
                return;
            }
        }
    }
}

// Resets move shape index
function mouseReleased() {
    moveShapeIndex = -1;
}

// Override method for implementation when the mouse is being dragged
function mouseDragged() {
    if (moveShapeIndex !== -1) {
        // Getting the shape we are moving
        let shape = shapes[moveShapeIndex];
        let moveX = mouseX - moveOffset.x;
        let moveY = mouseY - moveOffset.y;
        // Updating each point by the offset
        for (let p of shape) {
            p.x += moveX;
            p.y += moveY;
        }
        // Updating offset
        moveOffset.set(mouseX, mouseY);
    }
}

// Checks if the user's mouse is within our canvas
function mouseInCanvas() {
    return mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height
}

// Checks if the user's mouse is within one of the shapes
function mouseInShape(shape) {
    // Simple bounding box check for simplicity
    // Will need to do ray-casting for much more accurate detection.
    let minX = min(shape.map(p => p.x));
    let maxX = max(shape.map(p => p.x));
    let minY = min(shape.map(p => p.y));
    let maxY = max(shape.map(p => p.y));
    return mouseX >= minX && mouseX <= maxX && mouseY >= minY && mouseY <= maxY;
}

// Ray-casting method to check if a point is within a shape
function rayCast(x, y, shape) {
    let counter = 0;
    // Iterating through each edge of the given shape
    for (let i = 0, j = shape.length - 1; i < shape.length; j = i++) {
        // Getting coordinates of current and previous vertices (representing an edge)
        let x1 = shape[i].x, y1 = shape[i].y;
        let x2 = shape[j].x, y2 = shape[j].y;

        // Checking if vertical position of our given point is within the bounds
        let verticalPosition = ((y1 > y) != (y2 > y));
        // Getting the greatest value of x such that if x < x0 (0) it crosses our edge
        // Basically depends on the height we are at so we get the proportion and multiply by horizontal distance.
        let horizontalIntersection = (x < (x2 - x1) * (y - y1) / (y2 - y1) + x1);

        // If both cases pass, we have an intersection
        let intersection = verticalPosition && horizontalIntersection;

        // Count number of times we intersect
        if (intersection) {
            counter++;
        }
    }
    // Odd = true, even = false
    return counter % 2 == 1;
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