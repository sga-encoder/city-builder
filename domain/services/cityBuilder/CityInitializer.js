// =====================
// IMPORTS
// =====================
import { MapRenderer } from "../../components/map/MapRenderer.js";
import { City } from "../../../models/City.js";
import { MapController } from "../../controllers/MapController.js";
import { Logger } from "../../utilis/Logger.js";
import { FileManager } from "../../utilis/FileManager.js";
import { SVGInjector } from "../../utilis/SVGInjector.js";
import { LocalStorage } from "../../../database/LocalStorage.js";
import { ResourceManager } from "./ResourceManager.js";
import { TurnSystemManager } from "./TurnSystemManager.js";
import { UIManager } from "./UImanager.js";
import { DevToolsManager } from "./DevToolsManager.js";
import { setCityConfig } from "../../config/runtimeConfig.js";

// =====================
// FACHADA: CityInitializer
// =====================
export class CityInitializer {
  // =====================
  // CONFIGURACIÓN
  // =====================
  static CityConfig = null;

  static async initConfig() {
    if (!this.CityConfig) {
      this.CityConfig = await FileManager.loadJSON("../../config.json");
    }
    return this.CityConfig;
  }

  // =====================
  // UTILIDADES DE MAPA
  // =====================
  static createDefaultLayout(size = 30) {
    return Array(size)
      .fill(null)
      .map(() => Array(size).fill("g"));
  }

  static mapStorageToLayout(savedMap) {
    if (!Array.isArray(savedMap) || savedMap.length === 0) return null;
    return savedMap.map((row) =>
      row.map((cell) => `${cell.type}${cell.subtype || ""}` || "g"),
    );
  }

  // =====================
  // RECOLECCIÓN DE DATOS
  // =====================
  static loadSavedData() {
    const mapRaw = LocalStorage.loadData("map");
    const savedMap = mapRaw ? JSON.parse(mapRaw) : null;
    const savedLayout = this.mapStorageToLayout(savedMap);
    const savedResources = ResourceManager.getSavedResources();
    return { savedLayout, savedResources };
  }

  // =====================
  // RECURSOS INICIALES
  // =====================
  static getInitialResources(savedResources) {
    return {
      money: savedResources?.money ?? 50000,
      energy: savedResources?.energy ?? 100,
      water: savedResources?.water ?? 100,
      food: savedResources?.food ?? 100,
    };
  }

  // =====================
  // FLUJO PRINCIPAL DE INICIALIZACIÓN
  // =====================
  static async buildCity() {
    Logger.log("🏗️ [CityBuilder] Iniciando buildCity()");
    const { savedLayout, savedResources } = this.loadSavedData();
    Logger.log(
      "📦 [CityBuilder] savedLayout:",
      savedLayout ? `${savedLayout.length}x${savedLayout[0]?.length}` : "null",
    );

    const initialResources = this.getInitialResources(savedResources);

    const data = await this.initConfig();
    setCityConfig(data);

    const builds = await SVGInjector.create(data.builds);
    const icons = await SVGInjector.create(data.icons);

    const layout = savedLayout || this.createDefaultLayout(30);

    const { grid } = MapRenderer.render({
      containerSelector: "#map",
      layout,
      svgModels: builds,
    });

    const city = this.createCity(grid, data.builds, initialResources);

    this.initObserversAndControllers(city);

    const turnSystem = this.initTurnSystem(city);

    DevToolsManager.init(turnSystem, city);

    this.initUI(city, icons, builds, turnSystem);
  }

  static createCity(grid, buildsConfig, initialResources) {
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

  static initObserversAndControllers(city) {
    // Observadores y controladores
    ResourceManager.registerObservers(city);
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

    const turnSystem = TurnSystemManager.createTurnSystem(
      city,
      (event, turnSystem) => {
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
        UIManager.updateTurnStats(turnSystem, city, diff);
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

  static initUI(city, icons, builds, turnSystem) {
    UIManager.renderMenus(city.resources, icons, builds);
    UIManager.initMenuControllers(city, builds, icons);
    UIManager.renderTurnPanels(turnSystem, city);
    UIManager.showDebugButton();
  }
}
