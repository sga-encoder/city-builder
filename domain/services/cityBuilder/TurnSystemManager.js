import { TurnSystem } from "../../services/turns/turnSystem.js";
import { Logger } from "../../utilis/Logger.js";

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
          const residentialBuildings = cityRef.getResidentialBuildings?.() || [];
          const buildingData = {
            totalEnergyConsumed: 0,
            totalWaterConsumed: 0,
            energyShortageBuildings: 0,
            waterShortageBuildings: 0,
          };

          for (const building of residentialBuildings) {
            if (typeof building?.executeTurnLogic !== "function") continue;
            building.executeTurnLogic(cityRef, buildingData);
          }

          Logger.log("[TurnSystemManager] Consumo residencial", {
            buildings: residentialBuildings.length,
            energyConsumed: buildingData.totalEnergyConsumed,
            waterConsumed: buildingData.totalWaterConsumed,
            energyShortageBuildings: buildingData.energyShortageBuildings,
            waterShortageBuildings: buildingData.waterShortageBuildings,
          });
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
