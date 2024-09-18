/**
 * This enum describes the kind of states that the controller class can be in.
 */
export var ControllerState;
(function (ControllerState) {
    ControllerState[ControllerState["Normal"] = 0] = "Normal";
    ControllerState[ControllerState["ShapeSelected"] = 1] = "ShapeSelected";
    ControllerState[ControllerState["Insert"] = 2] = "Insert";
    ControllerState[ControllerState["Delete"] = 3] = "Delete";
})(ControllerState || (ControllerState = {}));
export var MovementState;
(function (MovementState) {
    MovementState[MovementState["Transform"] = 0] = "Transform";
    MovementState[MovementState["Rotate"] = 1] = "Rotate";
    MovementState[MovementState["Scale"] = 2] = "Scale";
})(MovementState || (MovementState = {}));
