import { DevMode, CONFIG } from "../../config/devConfig.js";
import { createDebugToggleButton } from "../../utilis/devUtils/components/debugToggleButton/Renderer.js";
import { Logger } from "../../utilis/Logger.js";
import { TurnControlPanel } from "../../utilis/devUtils/components/turnTools/controlPanel/Renderer.js";
import { TurnStats } from "../../utilis/devUtils/components/turnTools/Stats/Renderer.js";

export class DevToolsManager {
  static init(turnSystem) {
    // Centraliza referencias
    this.turnSystem = turnSystem;
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
