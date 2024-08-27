import { state } from "./setup.js";
import { rayCast } from "./shapeUtils.js";

// Responsible for our sutherland hodgman algorithm
export function sutherlandHodgman(shape1, shape2) {
    // Starting with one shape, let's see which lines intersect
    // Getting the intersections between both shapes
    [state.intersectLines, state.enclosedLines] = getIntersections(shape1, shape2);
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