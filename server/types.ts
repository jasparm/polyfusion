export type Point = { x: number, y: number, z: number };
export enum ShapeType { TWO_D = "2D", THREE_D = "3D" };
export type Shape = { name: string, type: ShapeType, points: Point[] };


function isShapeType(shapetype: any): shapetype is ShapeType {
    return (shapetype == ShapeType.TWO_D || shapetype == ShapeType.THREE_D)
}

function isPoint(point: any): point is Point {
    return (
        point.x && point.y && point.x &&
        typeof point.x === "number" &&
        typeof point.y === "number" &&
        typeof point.z === "number" 
    )
}
function isPointList(pointlist: any): pointlist is Point[] {
    return (Array.isArray(pointlist) && pointlist.every(isPoint))
}

export function isShape(shape: any): shape is Shape {
    return (
        shape.name && shape.type && shape.points && 
        typeof shape.name === "string" &&
        isShapeType(shape.type) &&
        isPointList(shape.points)
    )
}