import axios from "axios";

import { CustomShape } from "../shapes/CustomShape.ts";
import SceneManager from "./SceneManager.js";
import ShapeImageShaver from "./ShapeImageSaver.ts";


export class SaverLoader {
  static async saveScene(scene: SceneManager, customID?: string) {
    // Dynamically import LZString
    const {default: LZString} = await import('lz-string');

    // use custom ID if provided, else use the current time as id
    const id = customID ? customID : `${Date.now()}`;

    const shapes = scene.shapeManager.getShapes();
    let data: any[] = []
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

  static async saveShape(shape: CustomShape, token: string, customID?: string | null) {
    const imageSaver = new ShapeImageShaver({width: 50, height: 50});
    imageSaver.shape = shape;
    const image = imageSaver.exportImage();

    const id = customID ? customID.trim() : shape.id;
    const data = this.serializeShape(shape);
    const shapeData = {
      name: id,
      image: image,
      data: data,
      type: "3D",
    }


    try {
      const url = "http://127.0.0.1:3000/storeshape";
      const headers = {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`
      };

      const response = await axios.post(url, shapeData, { headers });
      return response.data;
    }
    catch (error) {
      console.error(error);
      throw new Error("Failed to save shape");
    }
  }

  static async loadShapes(token: string) {
    try {
      const url = "http://127.0.0.1:3000/shapes/3D";
      const headers = {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
      };
      const response = await axios.get(url, { headers });
      console.log(response)
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  static async getShapeData(token: string, name: string) {
    try {
      const url = `http://127.0.0.1:3000/shape/3D/${name}`;
      const headers = {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
      };
      const response = await axios.get(url, { headers });
      console.log(response)
      if(response.data.type === '3D') {
        console.log(response.data)
        return response.data;
      }

      return null;
    } catch (error) {
      console.error(error);
    }
  }

  static async deleteShape(token: string, name: string) {
    try {
      const url = `http://127.0.0.1:3000/deleteshape:${name}`;
      const headers = {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
      };

      const response = await axios.post(url, {}, { headers });
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  private static serializeShape(shape: CustomShape) {
    const position = shape.group.position
    const vertices = shape.vertexManager.getVerticesInfo();
    const properties = {
        position,
        vertices,
        colour: shape.colour,
        scale: shape.group.scale,
        rotation: shape.group.rotation,
        lineColour: shape.lineColour,
        vertexSize: shape.vertexSize,
        drawBalls: shape.drawBalls,
        wireframe: shape.wireframe,
        opacity: shape.opacity,
    };
    return properties;
  }
}
