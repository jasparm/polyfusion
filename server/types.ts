export type Point = { x: number, y: number, z:number };
export enum ShapeType {TWO_D, THREE_D};
export type Shape = { name: string, type: ShapeType, points: Point[] };