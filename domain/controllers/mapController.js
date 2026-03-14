class MapController {
  // =====================
  // STATIC PROPERTIES
  // =====================
  static activeCell = null;
  static interactionMode = "view";
  static mapCamera = null;
  static resizeDebounceTimer = null;
  static cameraRetryCount = 0;
  static cameraRetryTimer = null;
  static mapContainerElement = null;
  static city = null;
  static mapModel = null
  static buildingGrid = null; // Grid de instancias reales de Building (no copias planas)

  // =====================
  // STATIC METHODS
  // =====================
  static initializeCamera() {
    Logger.log("🎥 [MapController] setupMapCamera iniciando...");
    const viewport = document.querySelector("#map");
    const map = viewport?.querySelector(".map");

    if (!viewport || !map) {
      Logger.warn("⚠️ [MapController] No hay viewport o map aún");
      return;
    }
    if (viewport.dataset.cameraReady === "true") {
      Logger.log("ℹ️ [MapController] Camera ya lista");
      return;
    }

    try {
      const fitMinScale = 0.1;
      const maxScale = 40;
      const responsiveInitialScale = {
        756: 8,
        1024: 4,
        99999: 1,
      };

      Logger.log("📱 [MapController] Escalas:", {
        fitMinScale,
        maxScale,
        responsiveInitialScale,
      });

      this.mapCamera = new MapCamera("#map", document.styleSheets[1], {
        minScale: fitMinScale,
        maxScale,
        scale: 1,
      });
      Logger.log("✅ [MapController] MapCamera creado exitosamente");

      this.mapCamera.onPanStart(() => {
        this.clearCellSelection();
      });

      const applyResponsiveZoom = () => {
        this.mapCamera.applyResponsiveZoom(responsiveInitialScale);
      };

      // Aplicar zoom inicial
      requestAnimationFrame(() => {
        applyResponsiveZoom();
      });

      // Reajustar al cambiar tamaño de pantalla
      window.addEventListener("resize", () => {
        clearTimeout(this.resizeDebounceTimer);
        this.resizeDebounceTimer = setTimeout(() => {
          this.mapCamera.setZoomLimits(fitMinScale, maxScale);
          applyResponsiveZoom();
        }, 150);
      });

      window.mapCamera = this.mapCamera;
      Logger.log("✅ [MapController] Camera configurada completamente");
    } catch (error) {
      Logger.error("❌ [MapController] Error en MapCamera:", error);
      console.error("Error inicializando MapCamera:", error);
    }
  }

  static rebindCellListeners() {
    Logger.log("🔄 [MapController] Refrescando eventos del mapa...");
    // Limpia listeners viejos
    document.querySelectorAll(".map-item").forEach((item) => {
      item.dataset.eventsBound = "false";
    });

    const map = this.buildingGrid || [];
    Logger.log("🗺️ [MapController] Procesando", map.length, "filas");

    for (let i = 0; i < map.length; i++) {
      for (let j = 0; j < map[i].length; j++) {
        const cell = map[i][j];
        const id = cell.id;
        const item = document.querySelector(`#map-item-${id}`);

        if (!item) continue;
        if (item.dataset.eventsBound === "true") continue;

        item.dataset.eventsBound = "true";

        item.addEventListener("click", (e) => {
          if (this.mapCamera?.hasPanned) return;
          e.stopPropagation();

          if (SlideLeftController.moveMode) {
            const cellRef = { id, cellData: map[i][j], i, j };
            const moved = SlideLeftController.completeMoveBuilding(cellRef);
            if (moved) return;
          }

          if (map[i][j].type === "g") {
            this.selectMapCell(id, map[i][j], i, j);
            this.openBuildMenu();
            this.interactionMode = "build";
          } else {
            this.selectMapCell(id, map[i][j], i, j);
            this.openManageMenu();
            this.interactionMode = "manage";
          }
        });
      }
    }

    // Serializar instancias a formato simple para localStorage
    const serializableMap = map.map(row => row.map(building => ({...building})));
    LocalStorage.saveData("map", JSON.stringify(serializableMap));
    Logger.log("✅ [MapController] Eventos refrescados y mapa guardado");
  }

  static selectMapCell(id, cellData, i, j) {
    if (this.activeCell) {
      document
        .querySelector(`#map-item-${this.activeCell.id}`)
        ?.classList.remove("selected");
      SlideLeftController.setMenuState("none");
    }

    this.activeCell = { id, cellData, i, j };
    document.querySelector(`#map-item-${id}`).classList.add("selected");
    LocalStorage.saveData("selectedCell", JSON.stringify(this.activeCell));
  }

  static openBuildMenu() {
    SlideLeftController.setMenuState("build");
  }

  static openManageMenu() {
    SlideLeftController.setMenuState("manage");
  }

  static clearCellSelection() {
    if (this.activeCell) {
      document
        .querySelector(`#map-item-${this.activeCell.id}`)
        ?.classList.remove("selected");
      this.activeCell = null;
      LocalStorage.saveData("selectedCell", null);
      this.interactionMode = "view";
      SlideLeftController.setMenuState("none");
    }
  }

  static renderBuildingInCell(cellId, building) {
    const mapItem = document.querySelector(`#map-item-${cellId}`);
    if (!mapItem || !building) return;

    mapItem.querySelector(".building")?.remove();
    mapItem.appendChild(building.build());
    return mapItem;
  }

  static replaceCellBuilding(btnId, builds, cell) {
    Logger.log("🏭 [MapController] changeBuild:", btnId, "en celda", cell.id);
    const mapModel = this.mapModel || null;
    if (!mapModel) {
      Logger.error("❌ [MapController] No hay mapModel");
      return;
    }

    const [type, subtype] = [btnId[0], btnId[1]];
    const modelKey = subtype ? `${type}.${subtype}` : type;

    const building = Building.create({
      id: cell.id,
      type,
      subtype,
      model: builds.getModel(modelKey),
    });

    // Asignar la instancia directamente (no copia plana)
    mapModel.setBuildingAt(cell.i, cell.j, building);

    Logger.log("✅ [MapController] Edificio cambiado exitosamente");
    return { instance: building };
  }

  static moveBuildingCell(sourceCell, targetCell, builds) {
    const mapModel = this.mapModel || null;
    if (!mapModel || !sourceCell || !targetCell || !builds) return false;
    if (targetCell.cellData?.type !== "g") return false;

    const moved = mapModel.moveBuilding(
      sourceCell.i,
      sourceCell.j,
      targetCell.i,
      targetCell.j,
      (sourceId) =>
        Building.create({
          id: sourceId,
          type: "g",
          subtype: "",
          model: builds.getModel("g"),
        }),
    );

    if (!moved) return false;

    return true;
  }

  static buyBuildingCell(btnid, builds, cell) {
    const [selectedEntry] = Map.buildingInstanceMap(btnid);
    const buildingToBuy = selectedEntry?.[1] || null;

    if (!buildingToBuy) {
      Logger.warn("⚠️ [MapController] No se encontró building para", btnid);
      return false;
    }

    if (!this.city.buyBuilding(buildingToBuy)) {
      Logger.warn("⚠️ [MapController] No se pudo completar la compra para", btnid);
      return false;
    }

    const result = this.replaceCellBuilding(btnid, builds, cell);
    if (!result?.instance) {
      // Revertir descuento si no se pudo colocar en el mapa.
      this.city.resources.money.add(buildingToBuy.cost);
      Logger.warn("⚠️ [MapController] No se pudo colocar el edificio en el mapa");
      return false;
    }

    Logger.log("✅ [MapController] Edificio comprado y colocado en el mapa");
    return result;
  }

  static setupMapInteractions() {
    const hasMap = !!this.mapContainerElement.querySelector(".map");
    const hasData = !!LocalStorage.loadData("map");

    if (!hasMap || !hasData) return;

    this.rebindCellListeners();
    this.initializeCamera();
  }

  static initialize(cityModel) {
    Logger.log("🎮 [MapController] init llamado con grid de", cityModel?.map?.grid?.length, "filas");
    this.mapContainerElement = document.querySelector("#map");
    if (!this.mapContainerElement) {
      Logger.error("❌ [MapController] No se encontró #map container");
      return;
    }

    // Asignar buildingGrid ANTES de inicializar 
    this.city = cityModel;
    this.mapModel = this.city.map;
    this.buildingGrid = this.mapModel.grid;

    this.mapModel.addObserver((change) => {
      if (change.type === "cell-updated") {
        this.renderBuildingInCell(change.id, change.current);
        this.rebindCellListeners();
      }
    });
    Logger.log("✅ [MapController] buildingGrid asignado");

    this.setupMapInteractions();

    // Fallback durante arranque asíncrono
    this.cameraRetryCount = 0;
    this.cameraRetryTimer = setInterval(() => {
      this.setupMapInteractions();
      this.cameraRetryCount += 1;

      if (
        this.mapContainerElement.dataset.cameraReady === "true" ||
        this.cameraRetryCount >= 40
      ) {
        clearInterval(this.cameraRetryTimer);
      }
    }, 100);

    // Global click handler
    document.addEventListener("click", (e) => {
      const inSlideLeft = !!e.target.closest("#slide-left");
      const inMap = !!e.target.closest("#map");
      const inMapItem = !!e.target.closest(".map-item");

      Logger.log("🖱️ [MapController] Global click", {
        inSlideLeft,
        inMap,
        inMapItem,
        activeCellId: this.activeCell?.id || null,
      });

      // Cualquier interacción en el menú lateral no debe limpiar selección.
      if (inSlideLeft) {
        return;
      }

      if (inMapItem) return;

      if (inMap) {
        if (!this.mapCamera?.hasPanned) {
          this.clearCellSelection();
          SlideLeftController.cancelMoveMode();
        }
        return;
      }

      if (!inSlideLeft) {
        this.clearCellSelection();
        SlideLeftController.cancelMoveMode();
      }
    });
  }
}
