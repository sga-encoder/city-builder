import { City } from "../../../../models/City.js";
import { MapController } from "../../../controllers/map/Controller.js";
import { Logger } from "../../../utilis/Logger.js";
import { CityBuilderResourceManager } from "../ResourceManager.js";
import { CityBuilderTurnSystemManager } from "../managers/TurnSystemManager.js";
import { TurnToolsStats } from "../../../utilis/devUtils/components/turnTools/Stats/Renderer.js";

export class CityPhase {
  static execute({ grid, buildsConfig, initialResources }) {
    const city = this.createCity({ grid, buildsConfig, initialResources });
    this.initControllers(city);
    const turnSystem = this.initTurnSystem(city);
    return { city, turnSystem };
  }

  static createCity({ grid, buildsConfig, initialResources }) {
    Logger.log("🏙️ [CityBuilder] Creando instancia de City...");
    const city = new City({
      id: 1,
      mayor: "John Doe",
      name: "New City",
      location: "USA",
      map: {
        grid,
        buildsConfig,
      },
      initial: initialResources,
      score: 0,
    });
    Logger.log("✅ [CityBuilder] City creada, grid:", city.map?.grid?.length);
    return city;
  }

  static initControllers(city) {
    CityBuilderResourceManager.registerObservers(city);
    city.map.addObserver((change) => {
      Logger.log("🧭 [MapObserver]", change.type, change);
    });
    MapController.initialize(city);
  }

  static initTurnSystem(city) {
    let prevResources = {
      money: city.resources.money.amount,
      energy: city.resources.energy.amount,
      water: city.resources.water.amount,
      food: city.resources.food.amount,
    };

    const turnSystem = CityBuilderTurnSystemManager.createTurnSystem(
      city,
      (event, turnSystemRef) => {
        Logger.log(
          "Turno completado:",
          event.turnNumber,
          event.data?.changes?.total,
        );
        const diff = {
          money: city.resources.money.amount - prevResources.money,
          energy: city.resources.energy.amount - prevResources.energy,
          water: city.resources.water.amount - prevResources.water,
          food: city.resources.food.amount - prevResources.food,
        };
        TurnToolsStats.update(turnSystemRef.getState(), city, diff);
        prevResources = {
          money: city.resources.money.amount,
          energy: city.resources.energy.amount,
          water: city.resources.water.amount,
          food: city.resources.food.amount,
        };
      },
      (event) => {
        Logger.warn("Fase falló:", event.phaseName, event.error);
      },
      (event) => {
        Logger.info("Estado del sistema:", event.state);
      },
    );

    return turnSystem;
  }
}
