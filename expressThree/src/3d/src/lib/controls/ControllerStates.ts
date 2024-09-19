/**
 * This enum describes the kind of states that the controller class can be in.
 */
export enum ControllerState {
    Normal,
    ShapeSelected,
    Insert,
    Delete
}

export enum MovementState {
    Transform,
    Rotate,
    Scale
}