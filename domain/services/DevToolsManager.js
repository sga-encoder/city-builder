import { DevMode } from "../config/DevMode.js";
import { createDebugToggleButton } from "../utilis/DebugToggleButton.js";
import { Logger } from "../utilis/Logger.js";

export class DevToolsManager {
  static init(turnSystem, city) {
    if (DevMode.isEnabled()) {
      DevMode.enable(["TurnSystem"]);
      Logger.log("🛠️ [DevTools] Modo desarrollador activado");
      this.showDebugTools(turnSystem, city);
    } else {
      DevMode.disable();
      Logger.log("🛠️ [DevTools] Modo desarrollador desactivado");
    }
  }

  static showDebugTools(turnSystem, city) {
    createDebugToggleButton();
    // Aquí puedes agregar más herramientas de debug si lo necesitas
    // Por ejemplo: mostrar paneles, logs, etc.
    window.turnSystem = turnSystem;
    window.city = city;
  }
}
