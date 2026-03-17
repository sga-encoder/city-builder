import { Logger } from "../../utilis/Logger.js";
import { DevMode } from "../../config/DevMode.js";

export class TurnLogger {
  constructor() {
    this.logs = [];
  }

  recordTurn(turnData) {
    if (!turnData || typeof turnData !== "object") {
      Logger.warn("[TurnLogger] recordTurn recibió turnData inválido");
      return false;
    }
    this.logs.push(turnData);

    Logger.log("[TurnLogger] Turno registrado", turnData);
    return true;
  }

  getLogs(count = 10) {
    const size = Math.max(0, Number(count) || 0);
    if (size === 0) return [];
    return this.logs.slice(-size);
  }

  getAllLogs() {
    return [...this.logs];
  }

  getStats() {
    const totalTurnsLogged = this.logs.length;
    const last = totalTurnsLogged > 0 ? this.logs[totalTurnsLogged - 1] : null;
    const totalErrors = this.logs.reduce((acc, item) => {
      const errors = item?.changes?.errors;
      return acc + (Array.isArray(errors) ? errors.length : 0);
    }, 0);

    return {
      totalTurnsLogged,
      lastTurnNumber: last?.turn ?? null,
      lastTimestamp: last?.timestamp ?? null,
      totalErrors,
    };
  }

  clear() {
    this.logs = [];
    Logger.log("[TurnLogger] Historial limpiado");
    return true;
  }

  exportAsJSON() {
    return JSON.stringify(this.logs, null, 2);
  }
}
