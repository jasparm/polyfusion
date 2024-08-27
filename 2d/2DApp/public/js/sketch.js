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

// MONTE CARLO
let monteCarloMode = false;
let pauseMonte = false;
let montePoints = [];
let monteInterval = setInterval(monteCarlo, 20);
let unionPoints = [];
let intersectPoints = [];

//! Temporary variables for testing
let intersectLines = [];
let enclosedLines = [];

import { Shape } from "./modules/Shape.js";
import { MontePoint } from "./modules/MontePoint.js";

window.setup = function() {
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
        // Should reset
        } else {
            points = [];
            createShapeMode = false;
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

function deleteShape() {
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
function selectShape() {
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

// The final boss of key pressing
window.keyPressed = () => {
    // Deleting shapes - keycode is 8 for delete
    if (keyCode === 8 && selectShapeMode) {
        deleteShape();
    };
};

// The final boss of mouse pressing
//! Turn the code under each mouse pressed into functions so we know what's going on
window.mousePressed = function() {
    // Left click adds a point to the canvas for the moment
    if (mouseButton === LEFT) {
        // Creating a shape
        if (mouseInCanvas() && createShapeMode) {
            let newPoint = createVector(mouseX, mouseY);
            points.push(newPoint);
            // Need to now ensure that each point results in a convex shape
            // If convex, we add
            if (!checkConvexNew(points)) {
                points.pop()
            };
        }
        // Now checking if select shape mode is on
        else if (selectShapeMode) {
            selectShape();
        }
        // Otherwise, moving a shape
        else {
            // Checking if we clicked on any shape
            for (let i = 0; i < shapes.length; i++) {
                // Using ray casting to check if the user has clicked inside a shape
                if (rayCast(mouseX, mouseY, shapes[i].points)) {
                    moveShapeIndex = i;
                    moveOffset = createVector(mouseX, mouseY);
                    return;
                };
            };
        };
    };
};

// Resets move shape index
window.mouseReleased = () => {
    moveShapeIndex = -1;
    cursor();
};

// Override method for implementation when the mouse is being dragged
window.mouseDragged = () => {
    if (moveShapeIndex !== -1) {
        cursor('grabbing');
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


function checkConvexNew(points) {
    let numPoints = points.length;
    // Triangles are always convex
    if (numPoints < 4) {
        return true;
    };
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
            } else if (Math.sign(crossProd) !== sign) {
                // console.log(`Sign mismatch at index ${i}: ${Math.sign(crossProd)} != ${sign}`);
                return false;
            };
        };
    };
    // And if we pass every check, we have a convex shape.
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

    /*
    USE THIS CODE FOR AREA CAPABILITY
    beginShape();
    // fill("red");
    strokeWeight(20);
    for (let p of shape) {
        point(p.x, p.y);
    };

    strokeWeight(7);
    for (let p of shape) {
        vertex(p.x, p.y);
    };

    endShape(CLOSE);
    /*
    */
}

// Draw method. Handles what we see on the canvas.
window.draw = function() {
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


// This function runs our monte carlo method
function monteCarlo() {
    if (monteCarloMode && !pauseMonte) {
        // Let's begin by projecting points randomly in our canvas
        let randomX = Math.floor(Math.random() * width);
        let randomY = Math.floor(Math.random() * height);

        // Now we need to check if it is in a shape
        // Let's begin with two shapes
        let red = "red";
        let blue = "blue";

        let inShapesCounter = 0;

        for (let i = 0; i < shapes.length; i++) {
            if (rayCast(randomX, randomY, shapes[i].points)) {
                // basic checking for colours
                //! Update this to be dynamic and to work for as many shapes
                inShapesCounter++;
            };
        };
        let newPoint = new MontePoint(randomX, randomY);
        //! Make Dynamic
        if (inShapesCounter === 2) {
            // In two shapes we do blue
            newPoint.colour = blue;
            intersectPoints.push(newPoint);
            unionPoints.push(newPoint)
        } else if (inShapesCounter === 1) {
            newPoint.colour = red;
            unionPoints.push(newPoint);
        };

        montePoints.push(newPoint);
    };
};

// Responsible for our sutherland hodgman algorithm
function sutherlandHodgman(shape1, shape2) {
    // Starting with one shape, let's see which lines intersect
    // Getting the intersections between both shapes
    [intersectLines, enclosedLines] = getIntersections(shape1, shape2);
};

function getIntersections(shape1, shape2) {
    let intersections = [];
    let enclosed = [];
    // Choosing first set of lines as our base shape
    for (let line1 of shape1.lines()) {
        // Go through each other line for each line in first shape
        for (let line2 of shape2.lines()) {
            // If they intersect, add to a tuple, and return
            if (doesIntersect(line1, line2)) {
                console.log("INTERSECTION!");
                intersections.push([line1, line2])
            } else {
                // Checking if a line is completely enclosed in a shape, as this doesn't intersect
                // But we still want it
                enclosed.push.apply(enclosed, (lineInPolygon(line1, line2, shape1, shape2)));
                console.log("ENCLOSED!");
            }
        };
    };

    return [intersections, enclosed];
};

//! This function and the one below might be broken
function lineInPolygon(line1, line2, shape1, shape2) {
    let lines = [];
    if (isInsidePolygon(line2, shape1)) {
        lines.push(line2);
    } else if (isInsidePolygon(line1, shape2)) {
        lines.push(line1);
    };
    return lines;
}

// Helper function that checks if both endpoints of a line are enclosed in our polygon
function isInsidePolygon(line, shape) {
    // Testing each point
    for (let point of line) {
        // Only need to test one point as previous function
        // Will have picked up the intersection.
        // So if one point is in then both must be
        if (rayCast(point.x, point.y, shape.points)) {
            return true;
        };
    };
    return false;
};

// Helper function that determines if two lines intersect
function doesIntersect(line1, line2) {
    // Extracting coordinates from the lines
    let [p1, p2] = line1;
    let x1 = p1.x, y1 = p1.y, x2 = p2.x, y2 = p2.y;

    let [p3, p4] = line2;
    let x3 = p3.x, y3 = p3.y, x4 = p4.x, y4 = p4.y;

    // Calculatign the line equations
    let [m1, c1] = lineEquation(line1);
    let [m2, c2] = lineEquation(line2);

    // Checking if segments are parallel
    if (m1 === m2) {
        // If they are parallel, they don't intersect unless they are collinear
        if (c1 !== c2) {
            return false;
        };
        // Checking for collinear overlap
        return ((Math.min(x1, x2) <= Math.max(x3, x4) && Math.max(x1, x2) >= Math.min(x3, x4)) &&
                (Math.min(y1, y2) <= Math.max(y3, y4) && Math.max(y1, y2) >= Math.min(y3, y4)));
    };

    // Calculating the intersection point
    let xA, yA;
    xA = (c2 - c1) / (m1 - m2);
    yA = m1 * xA + c1;

    // Checking if the intersection point is within the bounds of both line segments
    // And if so, we have an intersection
    if ((xA >= Math.min(x1, x2) && xA <= Math.max(x1, x2)) &&
        (xA >= Math.min(x3, x4) && xA <= Math.max(x3, x4)) &&
        (yA >= Math.min(y1, y2) && yA <= Math.max(y1, y2)) &&
        (yA >= Math.min(y3, y4) && yA <= Math.max(y3, y4))) {
        return true;
    };

    // If all else fails, they don't intersect
    return false;
};

// Returns the gradient and y-intercept
function lineEquation(line) {
    // Extracting points from our line segment
    let [p1, p2] = line;

    // Extracting x and y coordinates
    let x1 = p1.x;
    let y1 = p1.y;
    let x2 = p2.x;
    let y2 = p2.y;

    // Slope equation
    // Ensuring we don't divide by 0
    let gradient = 0;
    if (x2 - x1 !== 0) {
        gradient = (y2 - y1) / (x2 - x1);
    };

    // Substituting (x2, y2) into equation to find y-intercept
    let yIntercept = y2 - (gradient * x2);

    return [gradient, yIntercept];
};