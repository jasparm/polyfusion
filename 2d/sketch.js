/*
File containing the code for our 2d canvas.
*/
let canvas;
// Array of shapes which is an array of points.
// Points array is our current shape being made.
let shapes = [];
let points = [];

let selectedShapes = [];

// Default -1 index for not moving
let moveShapeIndex = -1;
let moveOffset;

// Flags for our modes
let createShapeMode = false;
let selectShapeMode = false;

// TEMP MONTE CARLO
let monteCarloMode = false;
let montePoints = [];
let monteInterval = setInterval(monteCarlo, 500);

/*
Class for our shapes
*/

class Shape {
    constructor(points, colour=null) {
        this._points = points;
        this.colour = colour;
        this.isSelected = false;
    };
    // Getter
    get selected() {
        return this.isSelected;
    };
    // Getter
    get points() {
        return this._points;
    };
};

/*
Class for Monte Carlo Point
*/

class MontePoint {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.colour = "black";
    };
}

function setup() {
    // Canvas Setup
    canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas-container');

    // Disabling default context menu as we want right-clicking capability
    canvas.elt.oncontextmenu = (e) => {
        e.preventDefault();
    }

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
        }
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
        };
    });

    // Monte Carlo
    const monteCarloButton = select('#monte-carlo-btn');

    monteCarloButton.mousePressed(() => {
        // Toggle monte carlo mode
        monteCarloMode = !monteCarloMode;

        monteCarloButton.html(monteCarloMode ? "Done" : "Monte Carlo");
        if (!monteCarloMode) {
            clearInterval(monteInterval);
            montePoints = [];
        } else {
            monteInterval = setInterval(monteCarlo, 500);
        };
    });
};



// The final boss of mouse pressing
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
            // Need to now ensure that each point results in a convex shape
            if (points.length > 2) {
                // If convex, we add
                if (checkConvex(points, newPoint)) {
                    points.push(newPoint);
                };
            // Have this case for the initial 3 points
            } else {
                points.push(newPoint);
            };
        }
        // Now checking if select shape mode is on
        else if (selectShapeMode) {
            // We need to see which shape we clicked on
            // Can just re-use ray-casting
            for (let i = 0; i < shapes.length; i++) {
                if (rayCast(mouseX, mouseY, shapes[i].points)) {
                    shapes[i].isSelected = true;
                    selectedShapes.push(shapes[i]);
                }
            }
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
}

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
        }
        // Updating offset
        moveOffset.set(mouseX, mouseY);
    }
}

// Checks if the user's mouse is within our canvas
function mouseInCanvas() {
    return mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;
}

// Function that checks if the new point creates a convex shape
// Does this by using the cross product to ensure every internal angle is less than 180 degrees.
function checkConvex(points, newPoint) {
    angleMode(DEGREES);
    // subtract two vectors
    // get angle between
    // subtract last with first
    // angle between

    // Firstly creating a vector to each of the 4 points
    let n = points.length;
    let prevPoint = points[n - 1];
    let prevPrevPoint = points[n - 2];

    // Now we need to subtract to create the vector
    let vec1 = createVector(prevPoint.x - prevPrevPoint.x, prevPoint.y - prevPrevPoint.y);
    let vec2 = createVector(newPoint.x - prevPoint.x, newPoint.y - prevPoint.y);

    // If this is negative, we create an internal angle greater than 180
    let crossProd = vec1.cross(vec2).z;
    if (crossProd < 0) {
        return false;
    }
    // And now we do the same with the vector between the new point and the first point.
    // We need to ensure that the internal angle is less than 180 degrees.
    let firstPoint = points[0];
    let vec3 = createVector(firstPoint.x - newPoint.x, firstPoint.y - newPoint.y);

    // Same for this one.
    let crossProd2 = vec2.cross(vec3).z;
    if (crossProd2 < 0) {
        return false;
    }

    // And finally with the first point and second point.
    let secondPoint = points[1];
    let vec4 = createVector(secondPoint.x - firstPoint.x, secondPoint.y - firstPoint.y);
    let crossProd3 = vec3.cross(vec4).z;
    if (crossProd3 < 0) {
        return false;
    }
    // If all cases pass we have a convex shape
    return true;
}

// Ray-casting algorithm to check if a point is within a shape
// See this for info: https://www.youtube.com/watch?v=RSXM9bgqxJM
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
        // Basically depends on the height we are at so we get the remaining proportion and multiply by horizontal distance.
        let horizontalIntersection = (x < (x2 - x1) * (y - y1) / (y2 - y1) + x1);

        // Count number of times we intersect
        if (verticalPosition && horizontalIntersection) {
            counter++;
        }
    }
    // Odd = true, even = false
    return counter % 2 == 1;
}

// Called when the complete button is pressed.
function completeShape() {
    // Adds the list of points to our shapes array
    if (points.length > 0) {
        // Creating a new shape class and adding to our shapes array
        const newShape = new Shape(points);
        shapes.push(newShape);
        // And resetting our current shape
        points = [];
    }
}

// Function that draws our shapes.
// shape is a
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
    drawShape(points);

    if (monteCarloMode) {
        // Let's begin by projecting points randomly in our canvas
        for (let mpoint of montePoints) {
            strokeWeight(20);
            stroke(mpoint.colour);
            point(mpoint.x, mpoint.y);
        };
    };
}


// This function runs our monte carlo method
function monteCarlo() {
    if (monteCarloMode) {
        // Let's begin by projecting points randomly in our canvas
        let randomX = Math.floor(Math.random() * width);
        let randomY = Math.floor(Math.random() * height);

        // Now we need to check if it is in a shape
        // Let's begin with two shapes
        let colour1 = "red";
        let colour2 = "blue";

        let inShapesCounter = 0;

        for (let i = 0; i < shapes.length; i++) {
            if (rayCast(randomX, randomY, shapes[i].points)) {
                // basic checking for colours
                //! Update this to be dynamic and to work for as many shapes
                inShapesCounter++;
            };
        };
        let newPoint = new MontePoint(randomX, randomY);
        if (inShapesCounter === 2) {
            // In two shapes we do blue
            newPoint.colour = colour2;
        } else if (inShapesCounter === 1) {
            newPoint.colour = colour1;
        };

        montePoints.push(newPoint);
    }
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