// This class handles the context menu in 3D. Should behave differently depending on what is selected in the scene.
// Init context menu

export class ContextMenu {
  constructor() {
    this.contextMenu = document.querySelector(".context");

    document.addEventListener("click", () => {
      this.contextMenu.style.opacity = 0;
      this.contextMenu.style.pointerEvents = "none";
    });
  }
  updateMenuPosition = (x, y) => {
    const maxLeftValue = window.innerWidth - this.contextMenu.offsetWidth;
    const maxTopValue = window.innerHeight - this.contextMenu.offsetHeight;

    this.contextMenu.style.left = `${Math.min(x, maxLeftValue)}px`;
    this.contextMenu.style.top = `${Math.min(y, maxTopValue)}px`;
  };

  enableMenu(event) {
    // Update menu to be at mouse position.
    this.updateMenuPosition(event.clientX, event.clientY);
    this.contextMenu.style.opacity = 1;
    this.contextMenu.style.visibility = "visible";
    this.contextMenu.style.pointerEvents = "auto";
  }
}
