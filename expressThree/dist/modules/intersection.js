/*
File responsible for the Sutherland-Hodgman Algorithm for our IoU.
*/
import { state } from "./setup.js";
import { rayCast } from "./shapeUtils.js";
import { Shape } from "./Shape.js";
let addedPoints = new Set();

const DEFAULT_SHAPE_COLOUR = "rgb(180, 180, 180)"
// Responsible for our sutherland hodgman algorithm
export function sutherlandHodgman(shape1, shape2) {
    // Resetting addedPoints.
    addedPoints = new Set();
    // Starting with one shape, let's see which lines intersect
    // Getting the intersections between both shapes
    [state.intersectLines, state.enclosedLines] = getIntersections(shape1, shape2);
    let intersectionShape = new Shape(sortPoints(state.pointsOfIntersection, DEFAULT_SHAPE_COLOUR));
    // Checking to see if the intersection shape is the same as one of the shapes.
    if (`${intersectionShape.points}` === `${sortPoints(shape1.points)}`) {
        return
    } else if (`${intersectionShape.points}` === `${sortPoints(shape2.points)}`) {
        return
    } else {
        // If not the same, we add to shapes.
        state.shapes.push(intersectionShape);
        console.log(intersectionShape);
        console.log(areaOfPolygon(intersectionShape.points));
        console.log(intersectionShape.area / (shape1.area + shape2.area))
    }
}

function getIntersections(shape1, shape2) {
    let intersections = [];
    let enclosed = [];
    // Choosing first set of lines as our base shape
    for (let line1 of shape1.lines()) {
        // Going through each other line for each line in first shape
        for (let line2 of shape2.lines()) {
            // If they intersect, add to a tuple, and return
            if (doesIntersect(line1, line2)) {
                console.log("INTERSECTION!");
                intersections.push([line1, line2]);
                // Now getting the exact point of intersection
                let [px, py] = getPointOfIntersection(line1, line2);
                const pointKey = `${px},${py}`;
                if (!addedPoints.has(pointKey) && isValidPoint(px, py)) {
                    // state.pointsOfIntersection.push([point.x, point.y])
                    // state.pointsOfIntersection.push([px, py]);
                    console.log(`Adding point: ${px}, ${py}`)
                    state.pointsOfIntersection.push(createVector(px, py));
                    addedPoints.add(pointKey);
                }
            }
            else {
                // Checking if a line is completely enclosed in a shape, as this doesn't intersect
                // But we still want it
                enclosed.push.apply(enclosed, (lineInPolygon(line1, line2, shape1, shape2)));
                // console.log(`Adding point: ${px, py}`)
                console.log("ENCLOSED!");
            }
        }
        ;
    }
    ;
    return [intersections, enclosed];
};


function isValidPoint(x, y) {
    return isFinite(x) && isFinite(y) && (typeof x !== 'undefined') && (typeof y !== 'undefined')
}
// Checks if the line is entirely inside a polygon.
function lineInPolygon(line1, line2, shape1, shape2) {
    let lines = [];
    // Got to test for both shapes.
    if (isInsidePolygon(line2, shape1)) {
        lines.push(line2);
    }
    else if (isInsidePolygon(line1, shape2)) {
        lines.push(line1);
    }
    ;
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
            // Adding the point to enclosed points array for now
            const pointKey = `${point.x},${point.y}`;
            if (!addedPoints.has(pointKey) && isValidPoint(point.x, point.y)) {
                // state.pointsOfIntersection.push([point.x, point.y])
                state.pointsOfIntersection.push(createVector(point.x, point.y));
                console.log(`Adding point: ${point.x}, ${point.yy}`)
                addedPoints.add(pointKey);
                return true;
            }
            ;
        }
        ;
    }
    ;
    return false;
}
;
// Helper function that determines if two lines intersect
function doesIntersect(line1, line2) {
    console.log(line1, line2);
    // Extracting coordinates from the lines
    let [p1, p2] = line1;
    let x1 = p1.x, y1 = p1.y, x2 = p2.x, y2 = p2.y;
    let [p3, p4] = line2;
    let x3 = p3.x, y3 = p3.y, x4 = p4.x, y4 = p4.y;
    // Calculatign the line equations
    let [m1, c1] = lineEquation(line1);
    let [m2, c2] = lineEquation(line2);

    // Vertical line segment at line1
    if (x1 === x2) {
        let intersection = checkVertical(line1, line2);
        if (intersection) {
            return true;
        }
    }

    // Vertical line segment at line2
    if (x3 === x4) {
        let intersection = checkVertical(line2, line1);
        if (intersection) {
            return true;
        }
    }

    // Checking if segments are parallel
    if (m1 === m2) {
        // If they are parallel, they don't intersect unless they are collinear
        if (c1 !== c2) {
            return false;
        }
        if (c1 === c2) {
            return true;
        }
        ;
        // Checking for collinear overlap
        return ((Math.min(x1, x2) <= Math.max(x3, x4) && Math.max(x1, x2) >= Math.min(x3, x4)) &&
            (Math.min(y1, y2) <= Math.max(y3, y4) && Math.max(y1, y2) >= Math.min(y3, y4)));
    }
    ;
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
    }
    // If all else fails, they don't intersect
    return false;
};

function checkVertical(vertLine, testLine) {
    // Extracting coordinates from the lines
    let [v1, v2] = vertLine;
    let x = v1.x, vy1 = v1.y, vx2 = v2.x, vy2 = v2.y;
    let [t3, t4] = testLine;
    let tx3 = t3.x, ty3 = t3.y, tx4 = t4.x, ty4 = t4.y;

    [vy1, vy2] = [vy1, vy2].sort((a, b) => a - b)

    // Calculate the line equation for the non-vertical line
    let [m, c] = lineEquation(testLine);

    // Calculate the intersection point
    let y = m * x + c;

    // Check if the intersection point (x, y) is within the bounds of both line segments
    if (y >= vy1 && y <= vy2 && x >= Math.min(tx3, tx4) && x <= Math.max(tx3, tx4) && y >= Math.min(ty3, ty4) && y <= Math.max(ty3, ty4)) {
        return [x, y];
    }

    // No intersection
    return null;
}

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
    } else {
        gradient = Infinity;
    }
    ;
    // Substituting (x2, y2) into equation to find y-intercept
    let yIntercept = y2 - (gradient * x2);
    if (gradient === Infinity) {
        yIntercept = null;
    };
    return [gradient, yIntercept];
}
;
// Function that returns the point of intersection between two lines
// Note that this function will only be called if there is an intersection between the two.
function getPointOfIntersection(line1, line2) {
    // Firstly getting the line equations of both lines
    // Destructure the points from the lines
    let [p1, p2] = line1;
    let x1 = p1.x, y1 = p1.y, x2 = p2.x, y2 = p2.y;
    let [p3, p4] = line2;
    let x3 = p3.x, y3 = p3.y, x4 = p4.x, y4 = p4.y;
    // If line1 is vertical
    if (x1 === x2) {
        // Calculate intersection point using line2's equation
        let [m2, c2] = lineEquation(line2);
        let x = x1; // x-coordinate of the vertical line
        let y = m2 * x + c2; // y-coordinate using line2's equation
        return [Math.round(x), Math.round(y)];
    }

    // If line2 is vertical
    if (x3 === x4) {
        // Calculate intersection point using line1's equation
        let [m1, c1] = lineEquation(line1);
        let x = x3; // x-coordinate of the vertical line
        let y = m1 * x + c1; // y-coordinate using line1's equation
        return [Math.round(x), Math.round(y)];
    }
    // [gradient, y-intercept]
    let [m1, c1] = lineEquation(line1);
    let [m2, c2] = lineEquation(line2);
    // Now calculating the x coordinate of the intersection point
    const x = (c2 - c1) / (m1 - m2);
    // Using the first line equation to calculate the y-value
    const y = m1 * x + c1;
    console.log(`Intersection: ${Math.round(x), Math.round(y)}`)
    return [Math.round(x), Math.round(y)];
}
;
// Because we have a random order of intersection points, we just need to sort them
export function sortPoints(points) {
    // Center points of our polygon
    let center = {
        x: 0,
        y: 0
    };
    // Going through each point and getting average x and y value for center
    points.forEach(point => {
        center.x += point.x;
        center.y += point.y;
    });
    center.x /= points.length;
    center.y /= points.length;
    // And now sorting them based on the angle they make with that center point
    // This allows us to draw them and connect the correct points to one another.
    // Using JS sort() function with the angle as our comparison function.
    points.sort((a, b) => {
        const angleA = Math.atan2(a.y - center.y, a.x - center.x);
        const angleB = Math.atan2(b.y - center.y, b.x - center.x);
        return angleA - angleB;
    });
    return points;
}
;
export function areaOfPolygon(points) {
    // This calculates the area of the polygon by using the determinant
    // Reverse through points and add last point to it
    let newPoints = [points[0]];
    for (let i = points.length - 1; i >= 0; i--) {
        newPoints.push(points[i]);
    }
    ;
    // console.log(newPoints);
    // Now we need to calculate the determinant for the area
    let sumOfDets = 0;
    for (let i = 0; i < newPoints.length - 1; i++) {
        let a = newPoints[i].x; // x1
        let b = newPoints[i + 1].x; // x2
        let c = newPoints[i].y; // y1
        let d = newPoints[i + 1].y; // y2
        sumOfDets = sumOfDets + calcDet(a, b, c, d);
    }
    ;
    return Math.abs(sumOfDets / 2);
}
;
// Calculates the determinant (a*d - b*c)
function calcDet(a, b, c, d) {
    return a * d - b * c;
}
;
