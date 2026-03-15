class MapController {
  // =====================
  // STATIC PROPERTIES
  // =====================

  static mapContainerElement = null;
  static city = null;
  static mapModel = null;
  static buildingGrid = null; // Grid de instancias reales de Building (no copias planas)

  // =====================
  // STATIC METHODS
  // =====================
  static initializeCamera() {
    MapCameraController.initializeCamera(() => this.clearCellSelection());
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
          if (MapCameraController.hasPanned) return;
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
    const serializableMap = map.map((row) =>
      row.map((building) => ({ ...building })),
    );
    LocalStorage.saveData("map", JSON.stringify(serializableMap));
    Logger.log("✅ [MapController] Eventos refrescados y mapa guardado");
  }

  static get activeCell() {
    return MapSelectionController.activeCell;
  }

  static get interactionMode() {
    return MapSelectionController.interactionMode;
  }

  static set interactionMode(value) {
    MapSelectionController.interactionMode = value;
  }

  static selectMapCell(id, cellData, i, j) {
    return MapSelectionController.selectMapCell(id, cellData, i, j);
  }

  static clearCellSelection() {
    return MapSelectionController.clearCellSelection();
  }

  static openBuildMenu() {
    return MapSelectionController.openBuildMenu();
  }

  static openManageMenu() {
    return MapSelectionController.openManageMenu();
  }
  
  static renderBuildingInCell(cellId, building) {
    const mapItem = document.querySelector(`#map-item-${cellId}`);
    if (!mapItem || !building) return;

    mapItem.querySelector(".building")?.remove();
    mapItem.appendChild(building.build());
    return mapItem;
  }

  static replaceCellBuilding(btnId, builds, cell) {
    return MapBuildController.replaceCellBuilding(
      btnId,
      builds,
      cell,
      this.mapModel,
    );
  }

  static moveBuildingCell(sourceCell, targetCell, builds) {
    return MapBuildController.moveBuildingCell(
      sourceCell,
      targetCell,
      builds,
      this.mapModel,
    );
  }

  static buyBuildingCell(btnid, builds, cell) {
    return MapBuildController.buyBuildingCell(
      btnid,
      builds,
      cell,
      this.mapModel,
      this.city,
    );
  }

  static setupMapInteractions() {
    const hasMap = !!this.mapContainerElement.querySelector(".map");
    const hasData = !!LocalStorage.loadData("map");

    if (!hasMap || !hasData) return;

    this.rebindCellListeners();
    this.initializeCamera();
  }

  static initialize(cityModel) {
    Logger.log(
      "🎮 [MapController] init llamado con grid de",
      cityModel?.map?.grid?.length,
      "filas",
    );
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
    MapCameraController.initializeCameraRetry(() =>
      this.setupMapInteractions(),
    );

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
        if (!MapCameraController.hasPanned) {
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
