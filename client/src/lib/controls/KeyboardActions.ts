import { Controller } from "../controls/Controller.ts";
import { ControllerState, MovementState } from "./ControllerStates.ts";

let shapeSelected = false;
let inserting = false;

export function onKeyDown(event, controller: Controller) {
  const key = event.code;

  // When shift is pressed and a shape is selected, we want to temporarily disable the selection in order to move the camera
  if (key === "ShiftShift" && controller.state === ControllerState.ShapeSelected) {
    // This means we currently have a shape selected
    controller.unselectShapes();
    controller.checkForShapes = false;
    shapeSelected = true;
  }

  // Changing between transform and rotate when selected.
  if (key === "KeyR" && controller.state === ControllerState.ShapeSelected) {
    controller.movementState = MovementState.Rotate;
    controller.transformControls.setMode("rotate");
  }
  if (key === "KeyT" && controller.state === ControllerState.ShapeSelected) {
    controller.movementState = MovementState.Transform;
    controller.transformControls.setMode("translate");
  }

  if (key === "KeyI" && controller.state === ControllerState.ShapeSelected) {
    controller.insertVertex();
  }
  if (key === "ShiftLeft" && controller.state === ControllerState.Insert) {
    controller.cleanupInsertion();
    inserting = true;
    controller.checkForShapes = false;
  }
  // Unselect and go into normal mode whenever escape is pressed
  if (key === "Escape" && controller.state !== ControllerState.Normal) {
    controller.cleanupInsertion();
    controller.unselectShapes();
    shapeSelected = false;
    controller.checkForShapes = true;
    inserting = false;
    controller.state = ControllerState.Normal;
  }
}

export function onKeyUp(event, controller: Controller) {
  const key = event.code;
  // When shift is released and a shape is selected, we will re-enable transform controls
  if (key === "ShiftLeft" && shapeSelected) {
    // This means we currently have a shape selected
    controller.selectShape();
    controller.checkForShapes = true;
    shapeSelected = false;
  }
  // When shift is released, go back to inserting
  if (key === "ShiftLeft" && inserting) {
    controller.insertVertex();
    controller.checkForShapes = true;
    inserting = false;
  }
}

export function whileKeyDown(event, controller: Controller) {
  const key = event.code;

  // this will handle keyboard controls for inserting
  if (controller.state === ControllerState.Insert) {
    switch (key) {
      case "ArrowUp":
        controller.insertDistance += 0.1;
        controller.moveInsert();
        break;
      case "ArrowDown":
        controller.insertDistance -= 0.1;
        controller.moveInsert();
        break;
      default:
        break;
    }
  }
}
