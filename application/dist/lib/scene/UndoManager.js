/*
function cloneSceneState(state: sceneState): sceneState {
  return state.map(
    ([vector, shape]) =>
      [vector.clone(), shape.clone()] as [THREE.Vector3, CustomShape]
  );
}
  */
export class UndoManager {
    sceneManager;
    undoStack;
    redoStack;
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.undoStack = [];
        this.redoStack = [];
    }
    saveState() {
        return;
    }
    undo() {
        return;
    }
    redo() {
        return;
    }
}
