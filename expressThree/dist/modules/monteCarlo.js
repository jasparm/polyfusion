import { state } from "./setup.js";
import { MontePoint } from "./MontePoint.js";
import { rayCast } from "./shapeUtils.js";
// This function runs our monte carlo method
export function monteCarlo() {
    if (state.monteCarloMode && !state.pauseMonte) {
        // Let's begin by projecting points randomly in our canvas
        let randomX = Math.floor(Math.random() * width);
        let randomY = Math.floor(Math.random() * height);
        // Now we need to check if it is in a shape
        // Let's begin with two shapes
        let red = "lightcoral";
        let blue = "rgb(0, 183, 255)";
        let inShapesCounter = 0;
        for (let i = 0; i < state.shapes.length; i++) {
            if (rayCast(randomX, randomY, state.shapes[i].points)) {
                // basic checking for colours
                //! Update this to be dynamic and to work for as many shapes
                inShapesCounter++;
            }
        }
        ;
        let newPoint = new MontePoint(randomX, randomY);
        //! Make Dynamic
        if (inShapesCounter === 2) {
            // In two shapes we do blue
            newPoint.colour = blue;
            state.intersectPoints.push(newPoint);
            state.unionPoints.push(newPoint);
        }
        else if (inShapesCounter === 1) {
            newPoint.colour = red;
            state.unionPoints.push(newPoint);
        }
        ;
        state.montePoints.push(newPoint);
    }
    ;
}
;
