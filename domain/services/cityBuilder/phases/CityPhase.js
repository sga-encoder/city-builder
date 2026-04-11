import { City } from "../../../../models/City.js";
import { MapController } from "../../../controllers/map/Controller.js";
import { Logger } from "../../../utilis/Logger.js";
import { StatsManager } from "../../StatsManager.js";
import { CityBuilderResourceManager } from "../managers/ResourceManager.js";
import { CityBuilderTurnSystemManager } from "../managers/TurnSystemManager.js";
import { TurnToolsStats } from "../../../utilis/devUtils/components/turnTools/Stats/Renderer.js";
import { LocalStorage } from "../../../../database/localStorage.js";

export class CityPhase {
  static execute({ grid, buildsConfig, initialResources }) {
    StatsManager.reset();
    TurnToolsStats.lastPayload = null;

    const citizens = this.loadCitizens();
    const city = this.createCity({ grid, buildsConfig, initialResources, citizens });
    this.initControllers(city);
    const turnSystem = this.initTurnSystem(city);
    return { city, turnSystem };
  }

  static createCity({ grid, buildsConfig, initialResources, citizens }) {
    Logger.log("🏙️ [CityBuilder] Creando instancia de City...");
    
    // Intentar cargar configuración de ciudañ desde localStorage
    let cityConfig = this.loadCityConfig();

    const city = new City({
      id: cityConfig?.id || 1,
      mayor: cityConfig?.mayor || { name: "John Doe", joinDate: new Date().toISOString() },
      name: cityConfig?.name || "New City",
      location: cityConfig?.location || { name: "USA", latitude: 0, longitude: 0 },
      map: {
        grid,
        buildsConfig,
      },
      initial: initialResources,
      citizens,
      score: cityConfig?.score || 0,
      turn: cityConfig?.turn || 0,
    });
    Logger.log("✅ [CityBuilder] City creada, grid:", city.map?.grid?.length);
    return city;
  }

  static loadCitizens() {
    try {
      const citizensRaw = LocalStorage.loadData("citizens");
      if (!citizensRaw) return [];

      const parsedCitizens = JSON.parse(citizensRaw);
      return Array.isArray(parsedCitizens) ? parsedCitizens : [];
    } catch (error) {
      Logger.error("❌ [CityPhase] Error al cargar ciudadanos:", error);
      return [];
    }
  }

  static loadCityConfig() {
    try {
      const cityConfigRaw = LocalStorage.loadData("cityConfig");
      if (cityConfigRaw) {
        return JSON.parse(cityConfigRaw);
      }
    } catch (error) {
      Logger.error("❌ [CityPhase] Error al cargar configuración de ciudad:", error);
    }
    return null;
  }

  static initControllers(city) {
    CityBuilderResourceManager.registerObservers(city);
    city.map.addObserver((change) => {
      Logger.log("🧭 [MapObserver]", change.type, change);
    });
    MapController.initialize(city);
  }

  static initTurnSystem(city) {
    const turnSystem = CityBuilderTurnSystemManager.createTurnSystem(
      city,
      (event, turnSystemRef) => {
        Logger.log(
          "Turno completado:",
          event.turnNumber,
          event.data?.changes?.total,
        );
        const diff = event?.data?.changes?.total || {
          money: 0,
          energy: 0,
          water: 0,
          food: 0,
        };

        TurnToolsStats.update(turnSystemRef.getState(), city, diff);
      },
      (event) => {
        Logger.warn("Fase falló:", event.phaseName, event.error);
      },
      (event) => {
        Logger.info("Estado del sistema:", event.state);
      },
    );

    TurnToolsStats.update(turnSystem.getState(), city, {
      money: 0,
      energy: 0,
      water: 0,
      food: 0,
    });

    return turnSystem;
  }
}
