import { CustomShape } from "../shapes/CustomShape.ts";
import SceneManager from "./SceneManager.js";


export class SaverLoader {
  static async saveScene(scene: SceneManager, customID?: string) {
    // Dynamically import LZString
    const {default: LZString} = await import('lz-string');

    // use custom ID if provided, else use the current time as id
    const id = customID ? customID : `${Date.now()}`;

    const shapes = scene.shapeManager.getShapes();
    let data: string[] = []
    shapes.forEach((shape: CustomShape) => {
        data.push(this.serializeShape(shape));
    })

    const json = JSON.stringify(data);
    const compressedData = LZString.compress(json)

    // do something here to save to database
    return compressedData;
  }

  static async loadScene(data: any) {
    const {default: LZString} = await import('lz-string');
    // should probably have some sort of scene ID that we use
    // to track each scene
    // so instead of providing data, we just get an id we check in DB
    const json = LZString.decompress(data)
    const shapeData: string[] = JSON.parse(json);
    shapeData.forEach(shape => {
        // re-create shapes
    });
  }

  static async saveShape(shape: CustomShape, customID?: string) {
    const {default: LZString} = await import('lz-string');
    const id = customID ? customID : shape.id;
    const data = this.serializeShape(shape);
    const json = JSON.stringify(data);
    const compressedData = LZString.compress(json);
    // save specific shape to database
  }

  private static serializeShape(shape: CustomShape) {
    const position = shape.group.position
    const vertices = shape.vertexManager.getVerticesInfo();
    const properties = {
        position,
        vertices,
        colour: shape.colour,
        scale: shape.scale,
        lineColour: shape.lineColour,
        vertexSize: shape.vertexSize,
        id: shape.id,
        drawBalls: shape.drawBalls,
        wireframe: shape.wireframe,
    };
    return JSON.stringify(properties);
  }
}