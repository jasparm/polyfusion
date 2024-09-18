import * as THREE from "three";

import SceneManager from "./SceneManager.ts";
import { CustomShape } from "../shapes/CustomShape.ts";
import { ControllerState } from "../controls/ControllerStates.ts";

type sceneState = [THREE.Vector3, CustomShape][];

/*
function cloneSceneState(state: sceneState): sceneState {
  return state.map(
    ([vector, shape]) =>
      [vector.clone(), shape.clone()] as [THREE.Vector3, CustomShape]
  );
}
  */

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
    return;
  }

  public undo(): void {
    return;
  }

  public redo(): void {
    return;
  }
}