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
    const slot = document.querySelector("#slide-left .menu-slot");
    if (!slot) {
      Logger.warn("[SlideLeft][renderMenu] No se encontró .menu-slot");
      Logger.warn("⚠️ [SlideLeft] No se encontró .menu-slot");
      return;
    }

    const context = {
      state: SlideLeftState,
      constants: SlideLeftConstants,
      logger: Logger,
      mapController: MapController,
      setMenuState: (next) => this.setMenuState(next),
    };

    Logger.log("[SlideLeft][renderMenu] render state:", this.menuState);

    slot.innerHTML = ""; // limpia contenido anterior

    const sheets = document.styleSheets[1];

    switch (this.menuState) {
      case SlideLeftConstants.MENU_STATE.BUILD:
        const m01 = createMenu01(this.icons, sheets);
        Logger.log("[SlideLeft][menu-01] Renderizado", {
          hasIcons: !!this.icons,
          hasBuilds: !!this.builds,
        });
        BuildMenuHandler.bind(m01, context);
        slot.appendChild(m01);
        break;

      case SlideLeftConstants.MENU_STATE.MANAGE:
        const m02 = createMenu02(this.icons, sheets);
        ManageMenuHandler.bind(m02, context);
        slot.appendChild(m02);
        break;

      case SlideLeftConstants.MENU_STATE.SELECT_BUILDING:
        const menu03Ids = new Set(Map.typeBuildingAcceptedMap);

        const m03 = createMenu03(this.builds, sheets);
        const renderedButtons = m03.querySelectorAll(".button").length;
        Logger.log("[SlideLeft][menu-03] Renderizado", {
          buttons: renderedButtons,
          hasBuilds: !!this.builds,
          state: this.menuState,
        });
        SelectBuildingMenuHandler.bind(m03, context);
        slot.appendChild(m03);
        m03.scrollLeft = 0;
        break;
    }
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