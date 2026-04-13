import { MapRouteController } from "../../controllers/map/subControllers/DijsktraController.js";

export class RouteCalculatorButton {
  static BUTTON_ID = "in-game-route-calculator";

  static render(onCalculateRoute) {
    this.destroy();

    const mountTarget = document.querySelector("#slide-right") || document.body;

    const button = document.createElement("button");
    button.id = this.BUTTON_ID;
    button.type = "button";
    button.className = "route-calculator-btn";
    if (mountTarget.id === "slide-right") {
      button.classList.add("in-panel");
    }
    button.textContent = "Rutas";
    button.title = "Calcular rutas";
    button.setAttribute("aria-label", "Calcular rutas");

    button.addEventListener("click", () => {
      // Activar modo de cálculo de rutas óptimas
      MapRouteController.activateRouteMode();
      if (typeof onCalculateRoute === "function") {
        onCalculateRoute();
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
