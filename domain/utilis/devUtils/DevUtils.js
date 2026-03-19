import { DebugToggleButton } from "./components/debugToggleButton/Renderer.js";
import { Logger } from "../Logger.js";
import { TurnToolsControlPanel } from "./components/turnTools/controlPanel/Renderer.js";
import { TurnToolsStats } from "./components/turnTools/Stats/Renderer.js";
import { CONFIG } from "../../config/devConfig.js";

export class DevUtils {

  static init(turnSystem) {
    this.turnSystem = turnSystem;
    if (!this.isEnabledDevMode()) {
      this.disable();
      this.destroy();
      Logger.log("🛠️ [DevUtils] Modo desarrollador desactivado");
      return;
    }

    // Si está habilitado el modo dev, renderiza el botón toggle
    DebugToggleButton.render(this);
    console.log("🛠️ [DevUtils] Modo desarrollador activado");

    // El toggle controla el modo debug
    if (this.isEnabledDebug()) {
      this.enable(CONFIG.LOG_TYPES);
      this.render();
    } else {
      this.disable();
      this.destroy();
    }

  }

  static enable(logTypes = []) {
    localStorage.setItem("debugMode", "1");
    Logger.enable(logTypes);
  }

  static disable() {
    localStorage.setItem("debugMode", "0");
    Logger.disable();
  }

  static setLogPhases(value) {
    CONFIG.LOG_PHASES = !!value;
  }

  static setLogEachTurn(value) {
    CONFIG.LOG_EACH_TURN = !!value;
  }

  static isEnabledDebug() {
    const stored = localStorage.getItem("debugMode");
    if (stored !== null) return stored === "1";
  }

  static isEnabledDevMode() {
    return !!CONFIG.ENABLED;
  }

  static render() {
    const devToolsContainer = document.getElementById("dev-tools");
    if (devToolsContainer) {
      TurnToolsControlPanel.render(this.turnSystem);
      TurnToolsStats.render();
    }
  }

  static destroy() {
    const devToolsContainer = document.getElementById("dev-tools");
    if (devToolsContainer) {
      TurnToolsControlPanel.destroy();
      TurnToolsStats.destroy();
    }
  }
}