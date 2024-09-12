import { Controller } from "../controls/Controller.ts";
import { ControllerState } from "./ControllerStates.ts";
import { ContextMenu } from "../context-menu/contextmenu.js";


const contextMenu = new ContextMenu();
export function onMouseMove(event, controller: Controller) {
  controller.getMousePosition(event, controller.renderer);

  if (controller.state === ControllerState.Insert) {
    controller.moveInsert();
  }
}

export function onMouseDown(event, controller: Controller) {
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

function onLeftMouseClick(event, controller: Controller) {
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

function onRightMouseClick(event, controller: Controller) {
      const shape = controller.checkForSelection(false);
      console.log(shape)
      if (shape !== null) {
        controller.orbitControls.enablePan = false;
        contextMenu.enableMenu(event)
      }
}

export function onMouseWheelEvent(event, controller: Controller) {
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

function onMouseWheelUp(event, controller) {
  if (controller.state === ControllerState.Insert) {
    // this is where we would adjust the position of a vertex we are adding
  }
  // console.log("Wheel up!")
}

function onMouseWheelDown(event, controller) {
  // console.log("Wheel down!")
}
