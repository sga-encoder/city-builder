import { MainMenuRenderer } from "../../components/mainMenu/Renderer.js";

export class MainMenuController {
  constructor() {
    this.renderer = null;
  }

  show(callbacks = {}) {
    this.renderer = new MainMenuRenderer();
    this.renderer.render(callbacks);

    const hasSave = localStorage.getItem("cityConfig");
    if (hasSave && !window.hasAskedToContinue) {
      window.hasAskedToContinue = true;
      setTimeout(() => {
        if (confirm("¿Deseas continuar tu partida anterior? (Aceptar = Continuar, Cancelar = Ir al menú)")) {
          callbacks?.onContinue?.();
        }
      }, 100);
    }
  }

  destroy() {
    this.renderer?.destroy?.();
    this.renderer = null;
  }
}
