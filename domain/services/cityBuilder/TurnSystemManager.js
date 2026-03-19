import { TurnSystem } from "../../services/turns/TurnSystem.js";
import { Logger } from "../../utilis/Logger.js";
import { StatsManager } from "../StatsManager.js";

export class CityBuilderTurnSystemManager {
  static createTurnSystem(city, onTurnComplete, onPhaseFailed, onStateChanged) {
    const turnSystem = new TurnSystem();
    turnSystem.initialize(city, {
      interval: 5000,
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
          return true;
        },
        critical: true,
      },
      {
        name: "Produccion Basica",
        phase: (cityRef) => {
          cityRef.resources.money.add(100);
          cityRef.resources.money.turnProduction =
            Number(cityRef.resources.money.turnProduction || 0) + 100;

          cityRef.resources.energy.add(5);
          cityRef.resources.energy.turnProduction =
            Number(cityRef.resources.energy.turnProduction || 0) + 5;

          return true;
        },
        critical: true,
      },
      {
        name: "Produccion Utilidades",
        phase: (cityRef) => {
          StatsManager.reset("U1");
          StatsManager.reset("U2");

          for (const building of cityRef.getTypeBuildings("U")) {
            if (typeof building?.executeTurnLogic !== "function") continue;
            building.executeTurnLogic(cityRef, StatsManager);
          }

          return true;
        },
        critical: true,
      },
      {
        name: "Consumo Residencial",
        phase: (cityRef) => {
          StatsManager.reset("R1");
          StatsManager.reset("R2");
          for (const building of cityRef.getTypeBuildings("R")) {
            if (typeof building?.executeTurnLogic !== "function") continue;
            building.executeTurnLogic(cityRef, StatsManager);
          }

       return true;
        },
        critical: true,
      },
      {
        name: "Produccion Comercial",
        phase: (cityRef) => {
          StatsManager.reset("C1");
          StatsManager.reset("C2");

          for (const building of cityRef.getTypeBuildings("C")) {
            if (typeof building?.executeTurnLogic !== "function") continue;
            building.executeTurnLogic(cityRef, StatsManager);
          }

          Logger.log(
            "[TurnSystemManager] Produccion comercial",
            StatsManager.getStats("C1"),
            StatsManager.getStats("C2"),
          );
          return true;
        },
        critical: true,
      },
      {
        name: "Consumo Basico",
        phase: (cityRef) => {
          cityRef.resources.food.subtract(2);
          cityRef.resources.food.turnConsumption =
            Number(cityRef.resources.food.turnConsumption || 0) + 2;

          cityRef.resources.water.subtract(3);
          cityRef.resources.water.turnConsumption =
            Number(cityRef.resources.water.turnConsumption || 0) + 3;

          Object.values(cityRef.resources || {}).forEach((resource) => {
            if (typeof resource?.notifyObservers === "function") {
              resource.notifyObservers();
            }
          });

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
