/*
Class for our shapes
*/
import { areaOfPolygon } from "./intersection.js";
export class Shape {
    constructor(points, colour = null) {
        this._points = points;
        this.colour = colour;
        this.isSelected = false;
        this.name;
        this.area = areaOfPolygon(points);
    }
    ;
    // is shape selected or not
    get selected() {
        return this.isSelected;
    }
    ;
    // all of the points of the shape
    get points() {
        return this._points;
    }
    ;
    // Number of vertices
    get numVertices() {
        return this._points.length;
    }
    ;
    // Same as num of vertices but here for comprehension
    get numEdges() {
        return this._points.length;
    }
    ;
    // Setter for selected
    set selected(select) {
        this.isSelected = select;
    }
    ;
    // Returns a list of tuples of points
    // [(p1, p2), etc] where each tuple represents a line between the two points
    lines() {
        let lines = [];
        for (let i = 0; i < this.numVertices; i++) {
            // We've hit end of the list
            if (i == this.numVertices - 1) {
                // Adding the line from the last point to the first
                lines.push([this.points[i], this.points[0]]);
            }
            else {
                lines.push([this.points[i], this.points[i + 1]]);
            }
            ;
        }
        ;
        return lines;
    }
    ;
}
;
