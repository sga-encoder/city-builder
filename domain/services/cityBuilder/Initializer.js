// =====================
// IMPORTS
// =====================
import { MapRenderer } from "../../components/map/Renderer.js";
import { Logger } from "../../utilis/Logger.js";
import { FileManager } from "../../utilis/fileManager.js";
import { LocalStorage } from "../../../database/localStorage.js";
import { CityBuilderResourceManager } from "./managers/ResourceManager.js";
import { ConfigPhase } from "./phases/ConfigPhase.js";
import { AssetsPhase } from "./phases/AssetsPhase.js";
import { MapPhase } from "./phases/MapPhase.js";
import { CityPhase } from "./phases/CityPhase.js";
import { UIPhase } from "./phases/UIPhase.js";


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

  static getMapSize() {
    try {
      const cityConfigRaw = LocalStorage.loadData("cityConfig");
      if (cityConfigRaw) {
        const cityConfig = JSON.parse(cityConfigRaw);
        return cityConfig.mapSize || 30;
      }
    } catch (error) {
      Logger.error("❌ [Initializer] Error al cargar tamaño de mapa:", error);
    }
    return 30;
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
    "📦 [CityBuilder] savedLayout:", savedLayout ? `${savedLayout.length}x${savedLayout[0]?.length}` : "null",
    );

    const mapSize = this.getMapSize();
    Logger.log("🗺️ [CityBuilder] Tamaño del mapa:", mapSize);

    const initialResources = this.getInitialResources(savedResources);
    const { data } = await ConfigPhase.execute({
      loadConfig: () => this.initConfig(),
    });
    const { builds, icons } = await AssetsPhase.execute({ data });

    const { grid, mapRenderParams } = MapPhase.execute({
      savedLayout,
      builds,
      createDefaultLayout: () => this.createDefaultLayout(mapSize),
    });
    this.mapRenderParams = mapRenderParams;
    MapPhase.setupCssRehydrate(() => this.mapRenderParams);

    const { city, turnSystem } = CityPhase.execute({
      grid,
      buildsConfig: data.builds,
      initialResources,
    });

    UIPhase.execute({
      city,
      icons,
      builds,
      turnSystem,
    });
  }
}
