class SlideLeftController {
  // =====================
  // STATIC PROPERTIES
  // =====================
  // Mantiene compatibilidad con consumidores externos mientras el estado
  // real vive en SlideLeftState.
  static get menuState() {
    return SlideLeftState.menuState;
  }

  static set menuState(value) {
    SlideLeftState.menuState = value;
  }

  static get city() {
    return SlideLeftState.city;
  }

  static set city(value) {
    SlideLeftState.city = value;
  }

  static get icons() {
    return SlideLeftState.icons;
  }

  static set icons(value) {
    SlideLeftState.icons = value;
  }

  static get sheets() {
    return SlideLeftState.sheets;
  }

  static set sheets(value) {
    SlideLeftState.sheets = value;
  }

  static get resourceObjects() {
    return SlideLeftState.resourceObjects;
  }

  static set resourceObjects(value) {
    SlideLeftState.resourceObjects = value;
  }

  static get containerElement() {
    return SlideLeftState.containerElement;
  }

  static set containerElement(value) {
    SlideLeftState.containerElement = value;
  }

  static get moveMode() {
    return SlideLeftState.moveMode;
  }

  static set moveMode(value) {
    SlideLeftState.moveMode = value;
  }

  static get selectedCell() {
    return SlideLeftState.selectedCell;
  }

  static set selectedCell(value) {
    SlideLeftState.selectedCell = value;
  }

  static get sourceBuilding() {
    return SlideLeftState.sourceBuilding;
  }

  static set sourceBuilding(value) {
    SlideLeftState.sourceBuilding = value;
  }

  static get builds() {
    return SlideLeftState.builds;
  }

  static set builds(value) {
    SlideLeftState.builds = value;
  }

  // =====================
  // MENU MANAGEMENT METHODS
  // =====================

  static setMenuState(newState) {
    Logger.log("🎛️ [SlideLeft] menuState:", this.menuState, "→", newState);
    Logger.log("[SlideLeft][setMenuState]", {
      from: this.menuState,
      to: newState,
      hasActiveCell: !!MapController.activeCell,
      activeCellId: MapController.activeCell?.id || null,
    });
    this.menuState = newState;
    this.renderMenu();
  }

  static renderMenu() {
      const context = {
        state: SlideLeftState,
        constants: SlideLeftConstants,
        logger: Logger,
        mapController: MapController,
        icons: this.icons,
        builds: this.builds,
        setMenuState: (next) => this.setMenuState(next),
      };

      return SlideLeftMenuRenderer.render(context);
  
  }

  static handleClickResourceButton(container, btn) {
    if (btn && container) {
      btn.addEventListener("click", () => {
        container.classList.toggle("active");
      });
    }
  }

  // =====================
  // EVENT LISTENERS
  // =====================

  static completeMoveBuilding(targetCell) {
    return SlideLeftMoveBuildingService.completeMoveBuilding(targetCell, {
      state: SlideLeftState,
      logger: Logger,
      mapController: MapController,
      cancelMoveMode: () => this.cancelMoveMode(),
    });
  }

  static cancelMoveMode() {
    return SlideLeftMoveBuildingService.cancelMoveMode(SlideLeftState);
  }

  // =====================
  // RESOURCE REACTIVITY
  // =====================

  static initSlideLeftController(city, builds, icons) {
    Logger.log("🏛️ [SlideLeft] Inicializando controller...");
    this.city = city;
    this.builds = builds;
    this.icons = icons;
    this.containerElement = document.querySelector("#slide-left");

    const containerResources = document.querySelector(".resources");
    const btnResources = document.querySelector("#resource");
    this.handleClickResourceButton(containerResources, btnResources);
    this.setMenuState(SlideLeftConstants.MENU_STATE.NONE);

    Logger.log("✅ [SlideLeft] Controller inicializado");
  }

  static startResourceWatcher(container, resourceObjects) {
    return SlideLeftResourceWatcher.start(container, resourceObjects);
  }
}