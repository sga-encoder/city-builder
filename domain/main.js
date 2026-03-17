import { renderSlideLeftMenu } from "./components/SlideLeft.js";
import { renderSlideRightMenu } from "./components/SlideRight.js";
import { setCityConfig } from "./config/runtimeConfig.js";
import { MapRenderer } from "./components/map/MapRenderer.js";
import { City } from "../models/City.js";
import { MapController } from "./controllers/MapController.js";
import { SlideLeftController } from "./controllers/SlideLeftController.js";
import { Logger } from "./utilis/Logger.js";
import { FileManager } from "./utilis/FileManager.js";
import { SVGInjector } from "./utilis/SVGInjector.js";
import { LocalStorage } from "../database/LocalStorage.js";
import { TurnSystem } from "../domain/services/turns/turnSystem.js";
import { TurnControlPanel } from "./components/turnControl/TurnControlPanel.js";
import { TurnStats } from "./components/turnControl/TurnStats.js";
import { createDebugToggleButton } from "./utilis/DebugToggleButton.js";
import { DevMode } from "./config/devMode.js";

class CityBuilder {
  static CityConfig = null;
  static debugMode = true; // Cambiar a true para ver logs de debug

  static async initConfig() {
    if (!this.CityConfig) {
      this.CityConfig = await FileManager.loadJSON("../../config.json");
    }
    return this.CityConfig;
  }

  static createDefaultLayout(size = 30) {
    return Array(size)
      .fill(null)
      .map(() => Array(size).fill("g"));
  }

  static buildCity() {
    if (DevMode.isEnabled()) {
      DevMode.enable(["TurnSystem"]);
    } else {
      DevMode.disable();
    }

    Logger.log("🏗️ [CityBuilder] Iniciando buildCity()");
    const mapRaw = LocalStorage.loadData("map");
    const savedMap = mapRaw ? JSON.parse(mapRaw) : null;
    const savedLayout = this.mapStorageToLayout(savedMap);
    Logger.log(
      "📦 [CityBuilder] savedLayout:",
      savedLayout ? `${savedLayout.length}x${savedLayout[0]?.length}` : "null",
    );

    const savedResources = this.getSavedResources();

    const initialResources = {
      money: savedResources?.money ?? 50000,
      energy: savedResources?.energy ?? 100,
      water: savedResources?.water ?? 100,
      food: savedResources?.food ?? 100,
    };

    // usa savedLayout si existe, si no usa layout default
    this.initConfig().then(async (data) => {
      setCityConfig(data);
      Logger.log("⚙️ [CityBuilder] Config cargada, creando SVGs...");
      const builds = await SVGInjector.create(data.builds);
      const icons = await SVGInjector.create(data.icons);
      Logger.log("✅ [CityBuilder] SVGs creados");

      const layout = savedLayout || this.createDefaultLayout(30);

      const { grid } = MapRenderer.render({
        containerSelector: "#map",
        layout,
        svgModels: builds,
      });

      Logger.log("🏙️ [CityBuilder] Creando instancia de City...");
      const city = new City({
        id: 1,
        mayor: "John Doe",
        name: "New City",
        location: "USA",
        map: {
          grid,
          buildsConfig: data.builds,
        },
        initial: initialResources,
        score: 0,
      });

      Logger.log("✅ [CityBuilder] City creada, grid:", city.map?.grid?.length);

      const saveResources = () => {
        LocalStorage.saveData(
          "resources",
          JSON.stringify({
            money: city.resources.money.amount,
            energy: city.resources.energy.amount,
            water: city.resources.water.amount,
            food: city.resources.food.amount,
          }),
        );
      };

      Object.values(city.resources).forEach((resource) => {
        resource.addObserver(saveResources);
      });

      saveResources();

      city.map.addObserver((change) => {
        Logger.log("🧭 [MapObserver]", change.type, change);
      });

      // Inicializar MapController con las instancias reales del grid
      MapController.initialize(city);

      renderSlideLeftMenu(city.resources, icons, builds);
      renderSlideRightMenu(icons);
      SlideLeftController.initSlideLeftController(city, builds, icons);
      

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

      window.turnSystem = turnSystem;

      if (DevMode.isEnabled()) {
        TurnControlPanel.createControlPanel(turnSystem, city);
        TurnStats.createStatsContainer();
      }

      let prevResources = {
        money: city.resources.money.amount,
        energy: city.resources.energy.amount,
        water: city.resources.water.amount,
        food: city.resources.food.amount,
      };
      turnSystem.addObserver((event) => {
        if (event.type === "turnComplete") {
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
          TurnStats.updateStats(turnSystem.getState(), city, diff);
          prevResources = {
            money: city.resources.money.amount,
            energy: city.resources.energy.amount,
            water: city.resources.water.amount,
            food: city.resources.food.amount,
          };
        }
        if (event.type === "phaseFailed") {
          Logger.warn("Fase falló:", event.phaseName, event.error);
        }
        if (event.type === "stateChanged") {
          Logger.info("Estado del sistema:", event.state);
        }
      });
      window.city = city;
      createDebugToggleButton();
    });
  }

  static mapStorageToLayout(savedMap) {
    if (!Array.isArray(savedMap) || savedMap.length === 0) return null;
    return savedMap.map((row) =>
      row.map((cell) => `${cell.type}${cell.subtype || ""}` || "g"),
    );
  }

  static getSavedResources() {
    const raw = LocalStorage.loadData("resources");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}
CityBuilder.buildCity();
