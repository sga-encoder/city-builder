import { City } from "../../../../models/City.js";
import { MapController } from "../../../controllers/map/Controller.js";
import { Logger } from "../../../utilis/Logger.js";
import { StatsManager } from "../../StatsManager.js";
import { CityBuilderResourceManager } from "../managers/ResourceManager.js";
import { SaveManager } from "../managers/SaveManager.js";
import { CityBuilderTurnSystemManager } from "../managers/TurnSystemManager.js";
import { TurnToolsStats } from "../../../utilis/devUtils/components/turnTools/Stats/Renderer.js";
import { LocalStorage } from "../../../../database/LocalStorage.js";

export class CityPhase {
  static execute({ grid, buildsConfig, initialResources, gameplaySettings = {} }) {
    StatsManager.reset();
    TurnToolsStats.lastPayload = null;

    const citizens = this.loadCitizens();
    const savedScore = this.loadScore();
    const city = this.createCity({ grid, buildsConfig, initialResources, citizens, savedScore });
    this.initControllers(city);
    const turnSystem = this.initTurnSystem(city, gameplaySettings);
    return { city, turnSystem };
  }

  static createCity({ grid, buildsConfig, initialResources, citizens, savedScore = 0 }) {
    Logger.log("🏙️ [CityBuilder] Creando instancia de City...");
    
    // Intentar cargar configuración de ciudañ desde localStorage
    let cityConfig = this.loadCityConfig();

    const persistedScore = Number(savedScore);
    const configScore = Number(cityConfig?.score);
    const initialScore = Number.isFinite(configScore)
      ? configScore
      : Number.isFinite(persistedScore)
        ? persistedScore
        : 0;

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
      score: initialScore,
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

  static loadScore() {
    try {
      const scoreRaw = LocalStorage.loadData("score");
      if (!scoreRaw) return 0;

      const parsedScore = Number(JSON.parse(scoreRaw));
      return Number.isFinite(parsedScore) ? parsedScore : 0;
    } catch (error) {
      Logger.error("❌ [CityPhase] Error al cargar score:", error);
      return 0;
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

  static initTurnSystem(city, gameplaySettings = {}) {
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

        const nextState = {
          ...turnSystemRef.getState(),
          currentTurn: Number(event?.turnNumber ?? turnSystemRef.city?.turn ?? 0),
          score: Number(event?.data?.score?.score ?? turnSystemRef.city?.score ?? 0),
        };

        TurnToolsStats.update(nextState, city, diff);
      },
      (event) => {
        Logger.warn("Fase falló:", event.phaseName, event.error);
      },
      (event) => {
        Logger.info("Estado del sistema:", event.state);
      },
      gameplaySettings,
    );

    TurnToolsStats.update(turnSystem.getState(), city, {
      money: 0,
      energy: 0,
      water: 0,
      food: 0,
    });

    SaveManager.init(city, turnSystem);

    return turnSystem;
  }
}
