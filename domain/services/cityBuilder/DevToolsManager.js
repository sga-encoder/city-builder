import { DevMode, CONFIG } from "../../config/DevMode.js";
import { createDebugToggleButton } from "../../utilis/DebugToggleButton.js";
import { Logger } from "../../utilis/Logger.js";
import { TurnControlPanel } from "../../components/turnControl/TurnControlPanel.js";
import { TurnStats } from "../../components/turnControl/TurnStats.js";

export class DevToolsManager {
  static init(turnSystem, city) {
    // Centraliza referencias
    this.turnSystem = turnSystem;
    this.city = city;
    // Crea el botón de debug
    createDebugToggleButton(
      () => this.showPanels(),
      () => this.hidePanels(),
    );
    // Si el modo debug está activo, muestra paneles
    if (DevMode.isEnabledDebug()) {
      DevMode.enable(CONFIG.LOG_TYPES);
      Logger.log("🛠️ [DevTools] Modo desarrollador activado");
      this.showPanels();
    } else {
      DevMode.disable();
      this.hidePanels();
      Logger.log("🛠️ [DevTools] Modo desarrollador desactivado");
    }
  }

  static showPanels() {
    const devToolsContainer = document.getElementById("dev-tools");
    if (devToolsContainer) {
      TurnControlPanel.render(this.turnSystem);
      TurnStats.render();
    }
  }

  static hidePanels() {
    const devToolsContainer = document.getElementById("dev-tools");
    if (devToolsContainer) {
      TurnControlPanel.destroy();
      TurnStats.destroy();
    }
  }
}
