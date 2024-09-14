import { Controller } from "../controls/Controller.ts";
import { ControllerState } from "./ControllerStates.ts";


export function onMouseMove(event: MouseEvent, controller: Controller) {
  controller.getMousePosition(event, controller.renderer);

  if (controller.state === ControllerState.Insert) {
    controller.moveInsert();
  }
}

export function onMouseDown(event: MouseEvent, controller: Controller) {
  switch (event.button) {
    case 0: // left mouse has been pressed
      onLeftMouseClick(event, controller);
      break;
    case 2:
      onRightMouseClick(event, controller);
      break;

    default:
      break;
  }
}

function onLeftMouseClick(event: MouseEvent, controller: Controller) {
  const status = controller.state;
  switch (status) {
    case ControllerState.Normal:
      controller.checkForSelection(true);
      break;
    case ControllerState.ShapeSelected:
      if (controller.checkForSelection) {
        controller.checkForSelection(true);
      }
      break;
    case ControllerState.Insert:
      controller.finaliseInsertion();
  }
}

function onRightMouseClick(event: MouseEvent, controller: Controller) {
      const shape = controller.checkForSelection(false);
      if (shape !== undefined) {
        controller.orbitControls.enablePan = false;
        if (shape && shape.children[0]) {
          controller.contextMenu.selectedShape = controller.shapeManager.getShapeFromID(shape.children[0].name);
        }
        controller.contextMenu.enableMenu(event);
      }
      // re-enable once menu has been displayed
      controller.orbitControls.enablePan = true;

}

export function onMouseWheelEvent(event: WheelEvent, controller: Controller) {
  if (controller.state === ControllerState.Insert) {
    controller.insertDistance += event.deltaY * 0.001;
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
