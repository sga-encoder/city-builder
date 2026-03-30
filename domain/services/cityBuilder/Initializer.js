// =====================
// IMPORTS
// =====================
import { MapRenderer } from "../../components/map/Renderer.js";
import { City } from "../../../models/City.js";
import { MapController } from "../../controllers/map/Controller.js";
import { Logger } from "../../utilis/Logger.js";
import { FileManager } from "../../utilis/FileManager.js";
import { SVGInjector } from "../../utilis/SVGInjector.js";
import { LocalStorage } from "../../../database/LocalStorage.js";
import { CityBuilderResourceManager } from "./ResourceManager.js";
import { CityBuilderTurnSystemManager } from "./TurnSystemManager.js";
import { CityBuilderUIManager } from "./UImanager.js";
import { DevUtils } from "../../utilis/devUtils/DevUtils.js";
import { setCityConfig } from "../../config/runtimeConfig.js";
import { TurnToolsStats } from "../../utilis/devUtils/components/turnTools/Stats/Renderer.js";


// =====================
// FACHADA: CityInitializer
// =====================
export class CityBuilderInitializer {
  // =====================
  // CONFIGURACIÓN
  // =====================
  static CityConfig = null;
  static mapRenderParams = null;

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
    const savedResources = CityBuilderResourceManager.getSavedResources();
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
    MapRenderer.stopObserveCSSReload();
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

    const layout = savedLayout || this.createDefaultLayout();


    // Guardar los parámetros globalmente para re-render
    const mapRenderParams = {
      containerSelector: "#map",
      layout,
      svgModels: builds,
    };
    this.mapRenderParams = mapRenderParams;

    const { grid } = MapRenderer.render(mapRenderParams);

    MapRenderer.observeCSSReload(() => {
      if (this.mapRenderParams) {
        MapRenderer.rehydrateCSS(this.mapRenderParams);
      }
    });


    const city = this.createCity(grid, data.builds, initialResources);

    this.initObserversAndControllers(city);

    const turnSystem = this.initTurnSystem(city);

    // Importar los componentes
  
    DevUtils.init(turnSystem);

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
        TurnToolsStats.update(turnSystem.getState(), city, diff);
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

  static initUI(city, icons, builds) {
    CityBuilderUIManager.renderMenus(city.resources, icons, builds);
    CityBuilderUIManager.initMenuControllers(city, builds, icons);
  }
}
