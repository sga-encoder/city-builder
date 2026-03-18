import { Logger } from "../utilis/Logger.js";

// Si tienes otros loggers, impórtalos aquí
const DEFAULTS = {
  ENABLED: false,
  DEBUG: false,
  LOG_PHASES: false,
  LOG_EACH_TURN: false,
};

export class DevMode {
  static enabled = DEFAULTS.ENABLED;
  static debug = DEFAULTS.DEBUG;
  static logPhases = DEFAULTS.LOG_PHASES;
  static logEachTurn = DEFAULTS.LOG_EACH_TURN;

  static enable(logTypes = []) {
    this.debug = true;
    localStorage.setItem("debugMode", "1");
    Logger.enable(logTypes);
  }

  static disable() {
    this.debug = false;
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

  static isEnabledDevMode() {
    return this.enabled
  }

  static isEnabledDebug() {
    const stored = localStorage.getItem("debugMode");
    if (stored !== null) return stored === "1";
    return this.debug;
  }

  static shouldLogPhases() {
    return this.debug && this.logPhases;
  }

  static shouldLogEachTurn() {
    return this.debug && this.logEachTurn;
  }
}
