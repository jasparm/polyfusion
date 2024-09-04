import { Controller } from "../controls/Controller.ts";
import { ControllerState, MovementState } from "./ControllerStates.ts";

let shapeSelected = false;
let inserting = false;

export function onKeyDown(event, controller: Controller) {
  const key = event.key;
  // When shift is pressed and a shape is selected, we want to temporarily disable the selection in order to move the camera
  if (key === "Shift" && controller.state === ControllerState.ShapeSelected) {
    // This means we currently have a shape selected
    controller.unselectShapes();
    controller.checkForShapes = false;
    shapeSelected = true;
  }

  // Changing between transform and rotate when selected.
  if (key === "r" && controller.state === ControllerState.ShapeSelected) {
    controller.movementState = MovementState.Rotate;
    controller.transformControls.setMode("rotate");
  }
  if (key === "t" && controller.state === ControllerState.ShapeSelected) {
    controller.movementState = MovementState.Transform;
    controller.transformControls.setMode("translate");
  }

  if (key === 'i' && controller.state === ControllerState.ShapeSelected) {
    controller.insertVertex();
  }
  if (key === "Shift" && controller.state === ControllerState.Insert) {
    controller.cleanupInsertion();
    inserting = true;
    controller.checkForShapes = false;
  }
}

export function onKeyUp(event, controller) {
  const key = event.key;
  // When shift is released and a shape is selected, we will re-enable transform controls
  if (key === "Shift" && shapeSelected) {
    // This means we currently have a shape selected
    controller.selectShape();
    controller.checkForShapes = true;
    shapeSelected = false;
  }
  // When shift is released, go back to inserting
  if (key === "Shift" && inserting) {
    controller.insertVertex();
    controller.checkForShapes = true;
    inserting = false;
  }

}
