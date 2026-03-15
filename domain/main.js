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
    if (this.debugMode) {
      Logger.enable([
        // "CityBuilder",
        // "Building",
        // "Map",
        // "Map.createMap",
        // "MapCamera",
        // "MapController",
        "SlideLeft",
        // "SlideRight",
      ]);
      console.log("tipos de log disponibles", Logger.getTypes());
    } else {
      Logger.disable();
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

      window.renderSlideLeftMenu(city.resources, icons, builds);
      window.renderSlideRightMenu(icons);
      SlideLeftController.initSlideLeftController(city, builds, icons);
      if (this.debugMode) {
        console.log("tipos de log disponibles", Logger.getTypes());
      }
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
