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
        m01.addEventListener("click", (e) => {
          // Evita que el handler global cierre el menú durante este mismo click.
          e.stopPropagation();
          const buildBtn = e.target.closest("#build");
          Logger.log("[SlideLeft][menu-01 click]", {
            clicked: !!buildBtn,
            targetId: e.target?.id || null,
            currentState: this.menuState,
          });

          if (buildBtn) {
            Logger.log("[SlideLeft] Transición a menu-03 solicitada");
            this.setMenuState(SlideLeftConstants.MENU_STATE.SELECT_BUILDING);
          }
        });
        slot.appendChild(m01);
        break;

      case SlideLeftConstants.MENU_STATE.MANAGE:
        const m02 = createMenu02(this.icons, sheets);
        m02.addEventListener("click", (e) => {
          e.stopPropagation();
          const btn = e.target.closest(".button");
          if (!btn) return;
          const cell = MapController.activeCell;
          if (!cell) return;

          if (btn.id === "move") {
            this.moveMode = true;
            this.selectedCell = cell;
            this.sourceBuilding = cell.id;
            document
              .querySelector(`#map-item-${this.sourceBuilding}`)
              ?.classList.add("moving");
            document.querySelector("#map")?.classList.add("move-mode");
            this.setMenuState(SlideLeftConstants.MENU_STATE.NONE);
            MapController.clearCellSelection();
          }
          if (btn.id === "destroy") {
            MapController.replaceCellBuilding("g", this.builds, cell);
            this.setMenuState(SlideLeftConstants.MENU_STATE.NONE);
            MapController.clearCellSelection();
          }
        });
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
        m03.addEventListener("click", (e) => {
          e.stopPropagation();
          const btn = e.target.closest(".button");
          Logger.log("[SlideLeft][menu-03 click]", {
            hasButton: !!btn,
            buttonId: btn?.id || null,
            validButton: btn ? menu03Ids.has(btn.id) : false,
            hasActiveCell: !!MapController.activeCell,
            activeCellId: MapController.activeCell?.id || null,
          });

          if (!btn || !menu03Ids.has(btn.id)) return;
          const cell = MapController.activeCell;
          if (!cell) {
            Logger.warn("[SlideLeft][menu-03] No hay activeCell al intentar construir");
            return;
          }
          MapController.buyBuildingCell(btn.id, this.builds, cell);
          this.setMenuState(SlideLeftConstants.MENU_STATE.NONE);
          MapController.clearCellSelection();
        });
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
    if (!targetCell) return false;

    Logger.log(
      "🚚 [SlideLeft] completeMoveBuilding desde",
      this.selectedCell?.id,
      "a",
      targetCell.id,
    );
    if (!this.moveMode || !this.selectedCell || !this.builds) {
      Logger.warn("⚠️ [SlideLeft] No está en modo movimiento");
      return false;
    }

    // No mover a la misma celda
    if (targetCell.id === this.selectedCell.id) {
      this.cancelMoveMode();
      return false;
    }

    if (!this.selectedCell) return false;

    // Verificar que la celda destino esté vacía (solo "g")
    if (targetCell.cellData.type !== "g") {
      Logger.warn("⚠️ [SlideLeft] Celda destino no está vacía");
      console.warn("Target cell is not empty");
      this.cancelMoveMode();
      return false;
    }

    const moved = MapController.moveBuildingCell(
      this.selectedCell,
      targetCell,
      this.builds,
    );

    if (!moved) {
      this.cancelMoveMode();
      return false;
    }

    Logger.log("✅ [SlideLeft] Edificio movido exitosamente");

    // Limpiar estado
    this.cancelMoveMode();
    return true;
  }

  static cancelMoveMode() {
    if (this.sourceBuilding) {
      const sourceBuildingItem = document.querySelector(
        `#map-item-${this.sourceBuilding}`,
      );
      sourceBuildingItem?.classList.remove("moving");
    }

    const mapContainer = document.querySelector("#map");
    mapContainer?.classList.remove("move-mode");

    this.moveMode = false;
    this.selectedCell = null;
    this.sourceBuilding = null;
  }

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

  // =====================
  // RESOURCE REACTIVITY
  // =====================

  static startResourceWatcher(container, resourceObjects) {
    if (!resourceObjects || !container) return;

    const resourcesDiv = container.querySelector(".resources");
    if (!resourcesDiv || !resourcesDiv._resourceElements) return;

    const resourceElements = resourcesDiv._resourceElements;

    // Create update function for each resource type
    const createUpdateCallback = (type, unit) => {
      return (newValue) => {
        if (resourceElements[type]) {
          const li = resourceElements[type];
          const contentP = li.querySelector(".content");
          if (contentP) {
            contentP.textContent = newValue + unit;
          }
        }
      };
    };

    // Registrar observers Y display inicial
    Object.keys(resourceObjects).forEach((resource) => {
      const { type, unit, amount } = resourceObjects[resource];
      const callback = createUpdateCallback(type, unit);

      // Agregar observer
      resourceObjects[resource].addObserver(callback);

      // Guardar para limpieza
      if (!resourcesDiv._observerCallbacks) {
        resourcesDiv._observerCallbacks = {};
      }
      resourcesDiv._observerCallbacks[type] = callback;

      // Display inicial
      const contentP = resourceElements[type]?.querySelector(".content");
      if (contentP) contentP.textContent = amount + unit;
    });
  }
}