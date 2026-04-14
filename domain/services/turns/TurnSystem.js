import { TurnSimulator } from "./Simulator.js";
import { TurnLogger } from "./Logger.js";
import { ScoringSystem } from "../../components/score/ScoringSystem.js";
import { TURN_CONFIG } from "../../config/turnConfig.js";
import { LocalStorage } from "../../../database/LocalStorage.js";
import { Logger } from "../../utilis/Logger.js";
import { TurnValidator } from "./Validator.js";
import { CitySelectionController } from "../../controllers/citySelection/Controller.js";

export class TurnSystem {
  constructor(config = TURN_CONFIG) {
    this.config = this.#mergeConfig(config);
    this.city = null;

    this.simulator = new TurnSimulator();
    this.logger = new TurnLogger(this.config);
    this.scoringSystem = new ScoringSystem();

    this.state = "stopped";
    this.currentTurn = 0;
    this.speedKey = "X1";
    this.intervalId = null;
    this.observers = [];
  }

  initialize(city, customConfig = {}) {
    if (!city) throw new Error("initialize requiere una city válida");

    this.city = city;
    this.config = this.#mergeConfig({ ...this.config, ...customConfig });

    const saved = this.#loadState();
    const isSameCity = String(saved?.cityId || "") === String(city.id || "");

    if (saved && isSameCity) {
      this.currentTurn = Number(saved.currentTurn || city.turn || 0);
      this.state = saved.state || "paused";
      this.speedKey = this.#isValidSpeed(saved.speedKey)
        ? saved.speedKey
        : "X1";
    } else {
      this.currentTurn = Number(city.turn || 0);
      this.state = "paused";
      this.speedKey = "X1";
    }

    this.city.turn = this.currentTurn;
    this.#saveState();
    this.#emit({ type: "stateChanged", state: this.state });
  }

  registerPhases(phasesArray) {
    return this.simulator.registerPhases(phasesArray);
  }

  play() {
    if (!this.city) throw new Error("TurnSystem no inicializado");

    // Al restaurar partidas, el estado puede quedar en "running" sin intervalo activo.
    // En ese caso reactivamos el loop de turnos en lugar de salir temprano.
    if (this.state === "running") {
      if (!this.intervalId) {
        this.#restartInterval();
      }
      return;
    }

    this.state = "running";
    this.#restartInterval();
    this.#saveState();
    this.#emit({ type: "stateChanged", state: this.state });
  }

  pause() {
    if (this.state !== "running") return;

    this.#stopInterval();
    this.state = "paused";
    this.#saveState();
    this.#emit({ type: "stateChanged", state: this.state });
  }

  resume() {
    if (this.state === "running") return;
    this.play();
  }

  executeNextTurn() {
    if (!this.city) throw new Error("TurnSystem no inicializado");

    const validation = TurnValidator.validateCity(this.city);
    if (!validation.valid) {
      Logger.error("[TurnSystem] Validación falló:", validation.errors);
      this.#emit({
        type: "phaseFailed",
        phaseName: "TurnValidation",
        error: validation.errors.join("; "),
      });
      return null;
    }
    if (!this.city) throw new Error("TurnSystem no inicializado");

    const nextTurn = Number(this.city.turn || this.currentTurn || 0) + 1;

    let turnData;
    try {
      turnData = this.simulator.execute(this.city, nextTurn);
    } catch (error) {
      Logger.error("[TurnSystem] Error ejecutando turno:", error);
      this.#emit({
        type: "phaseFailed",
        phaseName: "TurnExecution",
        error: error?.message || "Error desconocido",
      });
      return null;
    }

    this.currentTurn = nextTurn;
    this.city.turn = nextTurn;
    const scoreResult = this.scoringSystem.calculateScore(this.city);
    turnData.score = scoreResult;

    const serializedCitizens = this.#serializeCitizens(this.city.citizens || []);

    LocalStorage.saveData("turn", JSON.stringify(this.currentTurn));
    LocalStorage.saveData("score", JSON.stringify(Number(this.city.score || 0)));
    LocalStorage.saveData("citizens", JSON.stringify(serializedCitizens));

    this.logger.recordTurn(turnData);
    this.#saveState();
    CitySelectionController.syncActiveCitySnapshot({
      turn: this.currentTurn,
      score: Number(this.city.score || 0),
      citizens: serializedCitizens,
    });

    this.#emit({
      type: "turnComplete",
      turnNumber: nextTurn,
      data: turnData,
    });

    const criticalError = (turnData?.changes?.errors || []).find(
      (e) => e.critical,
    );
    if (criticalError) {
      this.#emit({
        type: "phaseFailed",
        phaseName: criticalError.phaseName,
        error: criticalError.message,
      });
    }

    return turnData;
  }

  setSpeed(speedKey) {
    if (!this.#isValidSpeed(speedKey)) {
      throw new Error("Velocidad inválida. Usa X1, X2 o X3");
    }

    this.speedKey = speedKey;

    if (this.state === "running") {
      this.#restartInterval();
    }

    this.#saveState();
    this.#emit({ type: "speedChanged", speedKey: this.speedKey });
  }

  addObserver(callback) {
    if (typeof callback !== "function") return;
    this.observers.push(callback);
  }

  removeObserver(callback) {
    this.observers = this.observers.filter((cb) => cb !== callback);
  }

  getState() {
    return {
      state: this.state,
      currentTurn: this.currentTurn,
      speedKey: this.speedKey,
      speedValue: this.config.SPEEDS[this.speedKey],
      intervalMs: this.#getEffectiveInterval(),
      score: this.city?.score ?? null,
    };
  }

  getTurnLogs(count = 10) {
    return this.logger.getLogs(count);
  }

  getStats() {
    return {
      ...this.logger.getStats(),
      ...this.getState(),
    };
  }

  dispose() {
    this.#stopInterval();
    this.state = "stopped";
    this.#persistCurrentProgress();
    this.#saveState();
    this.observers = [];
  }

  #persistCurrentProgress() {
    if (!this.city) return;

    const serializedCitizens = this.#serializeCitizens(this.city.citizens || []);

    LocalStorage.saveData("turn", JSON.stringify(this.currentTurn));
    LocalStorage.saveData(
      "score",
      JSON.stringify(Number(this.city.score || 0)),
    );
    LocalStorage.saveData(
      "citizens",
      JSON.stringify(serializedCitizens),
    );

    CitySelectionController.syncActiveCitySnapshot({
      turn: this.currentTurn,
      score: Number(this.city.score || 0),
      citizens: serializedCitizens,
    });
  }

  #serializeCitizens(citizens) {
    if (!Array.isArray(citizens)) return [];

    return citizens.map((citizen) => ({
      id: citizen?.id ?? null,
      name: citizen?.name ?? "Ciudadano",
      happiness: Number(citizen?.happiness || 0),
      hasJob: Boolean(citizen?.hasJob),
      hasHome: Boolean(citizen?.hasHome),
      home: citizen?.home
        ? {
            type: citizen.home.type ?? null,
            subtype: citizen.home.subtype ?? null,
          }
        : null,
      job: citizen?.job
        ? {
            type: citizen.job.type ?? null,
            subtype: citizen.job.subtype ?? null,
          }
        : null,
    }));
  }

  #emit(event) {
    for (const cb of this.observers) {
      try {
        cb(event);
      } catch (error) {
        Logger.warn("[TurnSystem] Observer falló:", error);
      }
    }
  }

  #restartInterval() {
    this.#stopInterval();
    const interval = this.#getEffectiveInterval();
    this.intervalId = setInterval(() => {
      this.executeNextTurn();
    }, interval);
  }

  #stopInterval() {
    if (!this.intervalId) return;
    clearInterval(this.intervalId);
    this.intervalId = null;
  }

  #getEffectiveInterval() {
    const base = Number(this.config.DEFAULT_INTERVAL || 5000);
    const speed = Number(this.config.SPEEDS[this.speedKey] || 1);
    return Math.max(100, Math.floor(base * speed));
  }

  #isValidSpeed(speedKey) {
    return Object.prototype.hasOwnProperty.call(
      this.config.SPEEDS || {},
      speedKey,
    );
  }

  #saveState() {
    const payload = {
      cityId: this.city?.id ?? null,
      currentTurn: this.currentTurn,
      state: this.state,
      speedKey: this.speedKey,
      timestamp: new Date().toISOString(),
    };

    LocalStorage.saveData(
      this.config.STORAGE_KEYS.TURN_SYSTEM_STATE,
      JSON.stringify(payload),
    );
  }

  #loadState() {
    try {
      const raw = LocalStorage.loadData(
        this.config.STORAGE_KEYS.TURN_SYSTEM_STATE,
      );
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  #mergeConfig(config) {
    const normalizedConfig = {
      ...(config || {}),
      ...(config?.interval !== undefined
        ? { DEFAULT_INTERVAL: config.interval }
        : {}),
    };

    return {
      ...TURN_CONFIG,
      ...normalizedConfig,
      SPEEDS: {
        ...TURN_CONFIG.SPEEDS,
        ...(normalizedConfig.SPEEDS || {}),
      },
      STORAGE_KEYS: {
        ...TURN_CONFIG.STORAGE_KEYS,
        ...(normalizedConfig.STORAGE_KEYS || {}),
      },
      DEBUG: {
        ...TURN_CONFIG.DEBUG,
        ...(normalizedConfig.DEBUG || {}),
      },
    };
  }
}
