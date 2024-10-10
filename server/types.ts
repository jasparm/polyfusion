export type Point = { x: number, y: number, z: number };
export enum ShapeType { TWO_D = "2D", THREE_D = "3D" };
export type Shape = { name: string, type: ShapeType, data: JSON, image: string};


function isShapeType(shapetype: any): shapetype is ShapeType {
    return shapetype && (shapetype == ShapeType.TWO_D || shapetype == ShapeType.THREE_D)
}

export function getShapeType(type: string): ShapeType | undefined {
    if (Object.values(ShapeType).includes(type as ShapeType)) {
        return type as ShapeType;
    }
    return undefined;
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

function isData(data: any): data is JSON {
    return data ? true : false
}

function isImage(image: any): image is string {
    return true
}

export function isShape(shape: any): shape is Shape {
    return (
        shape.name && 
        typeof shape.name === "string" &&
        isImage(shape.image) &&
        isShapeType(shape.type) &&
        isData(shape.data)
        
    )
}