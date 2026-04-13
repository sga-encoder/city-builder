export class InGameReturnButton {
  static BUTTON_ID = "in-game-return-main-menu";

  static render(onReturnCallback) {
    this.destroy();

    const mountTarget = document.querySelector("#slide-right") || document.body;

    const button = document.createElement("button");
    button.id = this.BUTTON_ID;
    button.type = "button";
    button.className = "in-game-return-btn";
    if (mountTarget.id === "slide-right") {
      button.classList.add("in-panel");
    }
    button.textContent = "Inicio";
    button.title = "Volver al menu principal";
    button.setAttribute("aria-label", "Volver al menu principal");

    button.addEventListener("click", () => {
      const confirmReturn = window.confirm(
        "¿Deseas volver al menu principal? Se guardará el progreso actual.",
      );

      if (!confirmReturn) return;
      if (typeof onReturnCallback === "function") {
        onReturnCallback();
      }
    });

    mountTarget.appendChild(button);
    return button;
  }

  static destroy() {
    const existingButton = document.getElementById(this.BUTTON_ID);
    if (existingButton) {
      existingButton.remove();
    }
  }
}
