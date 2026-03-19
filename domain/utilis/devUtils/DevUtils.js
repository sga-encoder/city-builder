import { DebugToggleButton } from "./components/debugToggleButton/Renderer.js";
import { Logger } from "../Logger.js";
import { TurnToolsControlPanel } from "./components/turnTools/controlPanel/Renderer.js";
import { TurnToolsStats } from "./components/turnTools/Stats/Renderer.js";
import { CONFIG } from "../../config/devConfig.js";

export class DevUtils {
  static SETTINGS = CONFIG;

  static enabled = this.SETTINGS.ENABLED;
  static debug = this.SETTINGS.DEBUG;
  static logPhases = this.SETTINGS.LOG_PHASES;
  static logEachTurn = this.SETTINGS.LOG_EACH_TURN;
  
  static init(turnSystem) {
    this.turnSystem = turnSystem;
    DebugToggleButton.render(this);
    if (this.isEnabledDebug()) {
      this.enable(this.SETTINGS.LOG_TYPES);
      Logger.log("🛠️ [DevUtils] Modo desarrollador activado");
      this.render();
    } else {
      this.disable();
      this.destroy();
      Logger.log("🛠️ [DevUtils] Modo desarrollador desactivado");
    }
  }

  static enable(logTypes = []) {
    this.debug = true;
    localStorage.setItem("debugMode", "1");
    Logger.enable(logTypes);
  }

  static disable() {
    this.debug = false;
    localStorage.setItem("debugMode", "0");
    Logger.disable();
  }

  static setLogPhases(value) {
    this.logPhases = !!value;
  }

  static setLogEachTurn(value) {
    this.logEachTurn = !!value;
  }

  static isEnabledDebug() {
    const stored = localStorage.getItem("debugMode");
    if (stored !== null) return stored === "1";
    return this.debug;
  }

  static isEnabledDevMode() {
    return this.enabled
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