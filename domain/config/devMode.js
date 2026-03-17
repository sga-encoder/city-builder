import { Logger } from "../utilis/Logger.js";

// Si tienes otros loggers, impórtalos aquí
const DEFAULTS = {
  ENABLED: true,
  LOG_PHASES: false,
  LOG_EACH_TURN: false,
};

export class DevMode {
  static enabled = DEFAULTS.ENABLED;
  static logPhases = DEFAULTS.LOG_PHASES;
  static logEachTurn = DEFAULTS.LOG_EACH_TURN;

  static enable(logTypes = []) {
    this.enabled = true;
    localStorage.setItem("debugMode", "1");
    Logger.enable(logTypes);
  }

  static disable() {
    this.enabled = false;
    localStorage.setItem("debugMode", "0");

    Logger.disable();
    // Desactiva otros loggers o paneles si tienes
  }

  static setLogPhases(value) {
    this.logPhases = !!value;
  }

  static setLogEachTurn(value) {
    this.logEachTurn = !!value;
  }

  static isEnabled() {
    const stored = localStorage.getItem("debugMode");
    if (stored !== null) return stored === "1";
    return this.enabled;
  }

  static shouldLogPhases() {
    return this.enabled && this.logPhases;
  }

  static shouldLogEachTurn() {
    return this.enabled && this.logEachTurn;
  }
}
