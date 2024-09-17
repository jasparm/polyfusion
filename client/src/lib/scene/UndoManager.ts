import * as THREE from "three";

import SceneManager from "./SceneManager.ts";
import { CustomShape } from "../shapes/CustomShape.ts";
import { ControllerState } from "../controls/ControllerStates.ts";

type sceneState = [THREE.Vector3, CustomShape][];

function cloneSceneState(state: sceneState): sceneState {
  return state.map(
    ([vector, shape]) =>
      [vector.clone(), shape.clone()] as [THREE.Vector3, CustomShape]
  );
}

export class UndoManager {
  private sceneManager: SceneManager;
  private undoStack: THREE.Scene[];
  private redoStack: THREE.Scene[];

  constructor(sceneManager: SceneManager) {
    this.sceneManager = sceneManager;
    this.undoStack = [];
    this.redoStack = [];
  }

  public saveState(): void {
    const currentState = this.sceneManager.cloneScene();
    
    if (this.undoStack.length > 10) {
      return; // max stack size of 10
    }

    this.undoStack.push(currentState);
    this.redoStack = []; // Clear redo stack on new action
    // console.log(this.undoStack)
  }

  public undo(): void {
    if (this.undoStack.length === 0) return;

    const currentState = this.sceneManager.cloneScene();
    this.redoStack.push(currentState);

    const previousState = this.undoStack.pop();
    console.log(previousState?.children)
    if (previousState) {
      this.sceneManager.controller.transformControls.detach();
      this.sceneManager.sceneInfo = previousState;
    }
  }

  public redo(): void {
    return;
    if (this.redoStack.length === 0) return;

    const currentState = this.sceneManager.sceneInfo;
    this.undoStack.push(currentState);

    const nextState = this.redoStack.pop();
    if (nextState) {
      this.sceneManager.controller.transformControls.detach();
      this.sceneManager.sceneInfo = nextState;
    }
  }
}
