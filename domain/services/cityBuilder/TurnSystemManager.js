import { TurnSystem } from "../../services/turns/turnSystem.js";
import { Logger } from "../../utilis/Logger.js";
import { StatsManager } from "../StatsManager.js";

export class TurnSystemManager {
  static createTurnSystem(city, onTurnComplete, onPhaseFailed, onStateChanged) {
    const turnSystem = new TurnSystem();
    turnSystem.initialize(city, {
      interval: 5000,
      SPEEDS: { X1: 1.0, X2: 0.5, X3: 0.33 },
    });

    const gamePhases = [
      {
        name: "Produccion Basica",
        phase: (cityRef) => {
          cityRef.resources.money.add(100);
          cityRef.resources.energy.add(5);
          return true;
        },
        critical: true,
      },
      {
        name: "Consumo Residencial",
        phase: (cityRef) => {

          for (const building of cityRef.getResidentialBuildings()) {
            if (typeof building?.executeTurnLogic !== "function") continue;
            building.executeTurnLogic(cityRef, StatsManager);
          }

          console.log("[TurnSystemManager] Consumo residencial", StatsManager.getStats("R1"), StatsManager.getStats("R2"));
          return true;
        },
        critical: true,
      },
      {
        name: "Consumo Basico",
        phase: (cityRef) => {
          cityRef.resources.food.subtract(2);
          cityRef.resources.water.subtract(3);
          return true;
        },
        critical: true,
      },
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

    Logger.log("🕑 [TurnSystemManager] Sistema de turnos inicializado");
    return turnSystem;
  }
}
