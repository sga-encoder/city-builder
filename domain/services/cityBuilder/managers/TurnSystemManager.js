import { TurnSystem } from "../../turns/TurnSystem.js";
import { Logger } from "../../../utilis/Logger.js";
import { StatsManager } from "../../StatsManager.js";
import { CitizenManager } from "./CitizenManager.js";

export class CityBuilderTurnSystemManager {
  static #createPhase({ name, statsKeys, buildingType }) {
    return {
      name,
      phase: (cityRef) => {
        if (statsKeys) statsKeys.forEach(key => StatsManager.reset(key));
        for (const building of cityRef.getTypeBuildings(buildingType)) {
          if (typeof building?.executeTurnLogic !== "function") continue;
          building.executeTurnLogic(cityRef, StatsManager);
        }
        Logger.log(
          `[TurnSystemManager] ${name}`,
          ...statsKeys.map(key => StatsManager.getStats(key))
        );
        return true;
      },
      critical: true,
    };
  }
  static createTurnSystem(city, onTurnComplete, onPhaseFailed, onStateChanged, gameplaySettings = {}) {
    const turnSystem = new TurnSystem();
    const turnDuration = gameplaySettings.turnDurationMs || 5000;
    const defaultInterval = Math.max(100, turnDuration);
    
    turnSystem.initialize(city, {
      DEFAULT_INTERVAL: defaultInterval,
      SPEEDS: { X1: 1.0, X2: 0.5, X3: 0.33 },
    });

    const gamePhases = [
      {
        name: "Reset Flujo Recursos",
        phase: (cityRef) => {
          Object.values(cityRef.resources || {}).forEach((resource) => {
            resource.turnProduction = 0;
            resource.turnConsumption = 0;
          });
          cityRef.activeServicesCount = 0;
          cityRef.activeServiceBonus = 0;
          cityRef.activeParksCount = 0;
          cityRef.activeParkBonus = 0;
          return true;
        },
        critical: true,
      },
      
      this.#createPhase({
        name: "Produccion Utilidades",
        statsKeys: ["U1", "U2"],
        buildingType: "U"
      }),

      this.#createPhase({
        name: "Soporte de Servicios",
        statsKeys: ["S1", "S2", "S3"],
        buildingType: "S",
      }),

      this.#createPhase({
        name: "Bienestar Parques",
        statsKeys: ["P1"],
        buildingType: "P",
      }),

      {
        name: "Dinamica Poblacional",
        phase: (cityRef) => {
          CitizenManager.runTurn(cityRef, StatsManager);
          return true;
        },
        critical: true,
      },

      this.#createPhase({
        name: "Consumo Residencial",
        statsKeys: ["R1", "R2"],
        buildingType: "R"
      }),
      this.#createPhase({
        name: "Produccion Comercial",
        statsKeys: ["C1", "C2"],
        buildingType: "C",
      }),
      this.#createPhase({
        name: "Produccion Industrial",
        statsKeys: ["I1", "I2"],
        buildingType: "I",
      }),
    ];
    turnSystem.registerPhases(gamePhases);

    turnSystem.addObserver((event) => {
      if (event.type === "turnComplete" && onTurnComplete) {
        onTurnComplete(event, turnSystem);
      }
      if (event.type === "phaseFailed" && onPhaseFailed) {
        onPhaseFailed(event);
      }
      if (event.type === "stateChanged" && onStateChanged) {
        onStateChanged(event);
      }
    });

    // Iniciar conteo automático de turnos al crear/cargar la partida.
    turnSystem.play();

    Logger.log("🕑 [TurnSystemManager] Sistema de turnos inicializado");
    return turnSystem;
  }
}
