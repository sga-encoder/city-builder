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
    MapEventBinder.bindMapClick({
      mapContainerElement: this.mapContainerElement,
      buildingGrid: this.buildingGrid || [],
      hasPanned: () => MapCameraController.hasPanned,
      onSelectGround: (id, cellData, i, j) => {
        this.selectMapCell(id, cellData, i, j);
        this.openBuildMenu();
        this.interactionMode = "build";
      },
      onSelectBuilding: (id, cellData, i, j) => {
        this.selectMapCell(id, cellData, i, j);
        this.openManageMenu();
        this.interactionMode = "manage";
      },
      onTryMove: (cellRef) => SlideLeftController.completeMoveBuilding(cellRef),
      onPersistMap: () => this.mapModel?.schedulePersist?.(),
    });
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

    MapEventBinder.bindGlobalClick({
      getActiveCellId: () => this.activeCell?.id || null,
      hasPanned: () => MapCameraController.hasPanned,
      clearSelection: () => this.clearCellSelection(),
      cancelMoveMode: () => SlideLeftController.cancelMoveMode(),
    });
  }
}
