export let montePoints = [];
export let unionPoints = [];
export let intersectPoints = [];

/*
Class for Monte Carlo Point
*/

class MontePoint {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        // Default colour is black
        this.colour = "black";
    };
};

// This function runs our monte carlo method
export function monteCarlo() {
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