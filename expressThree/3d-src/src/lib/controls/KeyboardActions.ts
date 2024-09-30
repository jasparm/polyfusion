import { Controller } from "../controls/Controller.ts";
import { ControllerState, MovementState } from "./ControllerStates.ts";

let shapeSelected = false;
let inserting = false;

/**
 * For events when a key is pressed down.
 * @param event - Keyboard event from the key being pressed
 * @param controller - reference to a controller instance which will apply the controls from these actions
 */
export function onKeyDown(event: KeyboardEvent, controller: Controller) {
  const key = event.code;

  // When shift is pressed and a shape is selected, we want to temporarily disable the selection in order to move the camera
  if (key === "ShiftLeft" && controller.state === ControllerState.ShapeSelected) {
    // This means we currently have a shape selected
    const temp = controller.selectedGroup;
    controller.unselectShapes();
    controller.selectedGroup = temp;
    controller.checkForShapes = false;
    shapeSelected = true;
  }

  // Changing between transform and rotate when selected.
  if (key === "KeyE" && controller.state === ControllerState.ShapeSelected) {
    controller.setMovementState(MovementState.Rotate);
  }
  // If T is pressed, change the mode to translation
  if (key === "KeyW" && controller.state === ControllerState.ShapeSelected) {
    controller.setMovementState(MovementState.Transform)
  }
  // If S is pressed, change the mode to scale
  if (key === "KeyR" && controller.state === ControllerState.ShapeSelected) {
    controller.setMovementState(MovementState.Scale);
  }
  // If I is pressed, we begin trying to insert a new vertex
  if (key === "KeyI" && controller.state === ControllerState.ShapeSelected) {
    const customShape = controller.getCustomShape();
    if (!customShape || customShape.id === "MonteBox") {
      return; // if we are selecting monte box, do not allow for vertexes to be inserted
    }
    controller.insertDistance = 1;
    controller.insertVertex();
  }
  // If we press shift at any time, temporarily disable controls.
  // this allows user to move around the camera without accidentally selecting controls.
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
  // Delete selected shape from scene
  if (key === "Delete" && controller.state === ControllerState.ShapeSelected) {
    const shape = controller.getCustomShape()
    if (!shape) { return; }
    controller.shapeManager.remove(shape.id);

    controller.unselectShapes();
  }


}

/**
 * This handles when a key is released
 * @param event - Keyboard action for the key that was released.
 * @param controller - reference to the controller.
 */
export function onKeyUp(event: KeyboardEvent, controller: Controller) {
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

/**
 * Handles when a key is held down
 * @param event - Keyboard action for the key that is being held down.
 * @param controller 
 */
export function whileKeyDown(event: KeyboardEvent, controller: Controller) {
  const key = event.code;

  // this will handle keyboard controls for inserting
  if (controller.state === ControllerState.Insert) {
    switch (key) {
      case "ArrowUp":
        controller.insertDistance += 0.1;
        controller.moveInsert();
        break;
      case "ArrowDown":
        // limit the distance it can move backwards so it does not go behind the camera.
        controller.insertDistance = Math.max(controller.insertDistance - 0.1, 0.3);
        controller.moveInsert();
        break;
      default:
        break;
    }
  }
}
