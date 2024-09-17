import { Controller } from "../controls/Controller.ts";
import { ControllerState } from "./ControllerStates.ts";

/**
 * Function that handles mouse movement related things
 * @param event - Mouse Event that has the mouse movement information
 * @param controller - Reference to the controller that will do things based on this movement.
 */
export function onMouseMove(event: MouseEvent, controller: Controller) {
  controller.getMousePosition(event, controller.renderer);

  if (controller.state === ControllerState.Insert) {
    controller.moveInsert();
  }
}

/**
 * Handles events where a mouse button is pressed.
 * @param event 
 * @param controller 
 */
export function onMouseDown(event: MouseEvent, controller: Controller) {
  switch (event.button) {
    case 0: // left mouse has been pressed
      onLeftMouseClick(event, controller);
      break;
    case 2: // Right mouse has been pressed
      onRightMouseClick(event, controller);
      break;

    default:
      break;
  }
}

/**
 * Handles events where the left mouse button is pressed.
 * @param event 
 * @param controller 
 */
function onLeftMouseClick(event: MouseEvent, controller: Controller) {
  const status = controller.state;
  switch (status) {
    case ControllerState.Normal: // controller state is normal
      controller.checkForSelection(true);
      break;
    case ControllerState.ShapeSelected: // controller has a selected shape.
      if (controller.checkForSelection) {
        controller.checkForSelection(true);
      }
      break;
    case ControllerState.Insert: // controller is inserting
      controller.finaliseInsertion();
  }
}

/**
 * Handles event where the right mouse button was pressed.
 * @param event 
 * @param controller 
 */
function onRightMouseClick(event: MouseEvent, controller: Controller) {
      const shape = controller.checkForSelection(false);
      if (shape !== undefined) {
        controller.orbitControls.enablePan = false;
        if (shape && shape.children[0]) {
          controller.contextMenu.selectedShape = controller.shapeManager.getShapeFromID(shape.children[0].name);
        }
        controller.contextMenu.enableMenu(event);
      }
      else {
        controller.contextMenu.hideMenu();
      }
      // re-enable once menu has been displayed
      controller.orbitControls.enablePan = true;

}

/**
 * Handles events where the mouse wheel is used.
 * @param event - Wheel event containing what the mouse wheel just did
 * @param controller - Reference to the controller to perform actions with
 */
export function onMouseWheelEvent(event: WheelEvent, controller: Controller) {
  if (controller.state === ControllerState.Insert) {
    controller.insertDistance = Math.max(controller.insertDistance - event.deltaY * 0.001, 0.3);
    controller.moveInsert();
  }

  // Handling events for mouse wheel up and down separately (if needed eventually)
  if (event.deltaY < 0) {
    onMouseWheelUp(event, controller);
  } else {
    onMouseWheelDown(event, controller);
  }
}

function onMouseWheelUp(event: WheelEvent, controller: Controller) {
  if (controller.state === ControllerState.Insert) {
    // this is where we would adjust the position of a vertex we are adding
  }
  // console.log("Wheel up!")
}

function onMouseWheelDown(event: WheelEvent, controller: Controller) {
  // console.log("Wheel down!")
}
