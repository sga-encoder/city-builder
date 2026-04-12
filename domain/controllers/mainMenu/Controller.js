import { MainMenuRenderer } from "../../components/mainMenu/Renderer.js";

export class MainMenuController {
  constructor() {
    this.renderer = null;
  }

  show(callbacks = {}) {
    this.renderer = new MainMenuRenderer();
    this.renderer.render(callbacks);
  }

  destroy() {
    this.renderer?.destroy?.();
    this.renderer = null;
  }
}
