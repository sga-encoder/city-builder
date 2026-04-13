import { SettingsRenderer } from "../../components/settings/Renderer.js";

export class SettingsController {
  constructor() {
    this.renderer = null;
  }

  show(initialValues = {}, callbacks = {}) {
    this.renderer = new SettingsRenderer();
    this.renderer.render(initialValues, callbacks);
  }

  destroy() {
    this.renderer?.destroy?.();
    this.renderer = null;
  }
}
