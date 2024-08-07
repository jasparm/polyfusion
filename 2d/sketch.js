/*
File containing the code for our 2d canvas.
*/
function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas-container');
}

let points = [];
function mousePressed() {
    // Ensures mouse is within the canvas bounds
    if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
        points.push({x: mouseX, y: mouseY});
    }
}

// Draw method. Handles what we see on the canvas
function draw() {
    background(220);
    for (let p of points) {
        point(p.x, p.y).strokeWeight(15);
    }
}