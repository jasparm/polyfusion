import { CustomShape } from "../shapes/CustomShape.ts";


export function addShapesToDiv(div: HTMLElement, selectedShapes: CustomShape[], deleteAction: Function) {
    selectedShapes.forEach((shape, index) => {
        const shapeBox = document.createElement("div");
        shapeBox.className =
          "btn selected-shapes-box d-flex flex-row align-items-center";
        shapeBox.id = `shape-${index}`;
    
        const iconBox = document.createElement("div");
        iconBox.className = "icon-box";
        // eventually change this to be png of the shape (if ever possible)
        const icon = document.createElement("i");
        icon.className = "fa-solid fa-cube fa-lg";
        iconBox.appendChild(icon);
    
        const shapeName = document.createElement("p");
        shapeName.textContent = shape.name;
    
        shapeBox.appendChild(iconBox);
        shapeBox.appendChild(shapeName);
    
        // Stuff that is unique to custom shapes
        iconBox.style.borderRightColor = shape.colour.getStyle();
        const deleteShapeBtn = document.createElement("i");
        deleteShapeBtn.className = "fa-solid fa-trash-can ml-auto p-2";
        deleteShapeBtn.id = "trash-icon";
        shapeBox.appendChild(deleteShapeBtn);

        deleteShapeBtn.addEventListener("click", (event) => deleteAction(shape, event))
    })

    
}
