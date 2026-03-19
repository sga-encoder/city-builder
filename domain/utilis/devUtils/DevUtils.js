import { DebugToggleButton } from "./components/debugToggleButton/Renderer.js";
import { Logger } from "../Logger.js";
import { TurnToolsControlPanel } from "./components/turnTools/controlPanel/Renderer.js";
import { TurnToolsStats } from "./components/turnTools/Stats/Renderer.js";
import { CONFIG } from "../../config/devConfig.js";

export class DevUtils {

  static init(turnSystem) {
    this.turnSystem = turnSystem;
    DebugToggleButton.render(this);
    if (this.isEnabledDevMode()) {
      if (this.isEnabledDebug()) {
        this.enable(CONFIG.LOG_TYPES);
        Logger.log("🛠️ [DevUtils] Modo desarrollador activado");
        this.render();
      } else {
        this.disable();
        this.destroy();
        Logger.log("🛠️ [DevUtils] Modo desarrollador desactivado");
      }
    }
  }

  static enable(logTypes = []) {
    CONFIG.DEBUG = true;
    localStorage.setItem("debugMode", "1");
    Logger.enable(logTypes);
  }

  static disable() {
    CONFIG.DEBUG = false;
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
    return CONFIG.DEBUG;
  }

  static isEnabledDevMode() {
    return CONFIG.ENABLED;
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