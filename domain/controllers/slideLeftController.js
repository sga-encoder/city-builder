class SlideLeftController {
  // =====================
  // STATIC PROPERTIES
  // =====================
  static resourceObjects = null;
  static containerElement = null;
  static moveMode = false;
  static selectedCell = null;
  static sourceBuilding = null;
  static builds = null;

  // =====================
  // MENU MANAGEMENT METHODS
  // =====================

  static showMenu01() {
    document
      .querySelector(".container-buttons.menu-01")
      ?.classList.add("active");
  }

  static showMenu02() {
    document
      .querySelector(".container-buttons.menu-02")
      ?.classList.add("active");
  }

  static showMenu03() {
    const menu = document.querySelector(".container-buttons.menu-03");
    if (menu) {
      menu.scrollLeft = 0;
      menu.classList.add("active");
    }
  }

  static hideMenu01() {
    document
      .querySelector(".container-buttons.menu-01")
      ?.classList.remove("active");
  }

  static hideMenu02() {
    document
      .querySelector(".container-buttons.menu-02")
      ?.classList.remove("active");
  }

  static hideMenu03() {
    document
      .querySelector(".container-buttons.menu-03")
      ?.classList.remove("active");
  }

  static switchToMenu03() {
    this.hideMenu01();
    this.showMenu03();
  }

  static hideAllMenu() {
    this.hideMenu01();
    this.hideMenu02();
    this.hideMenu03();
  }

  static handleClickMenu01(slideLeft) {
    if (!slideLeft || slideLeft.dataset.buildEventBound === "true") return;

    slideLeft.addEventListener("click", (event) => {
      const buildBtn = event.target.closest("#build");
      if (!buildBtn) return;
      this.switchToMenu03();
    });

    slideLeft.dataset.buildEventBound = "true";
  }

  static handleClickMenu03(slideLeft, builds) {
    if (!slideLeft || slideLeft.dataset.menu03Bound === "true") return;

    const menu03Ids = new Set(["R1","R2","C1","C2","I1","I2","P1","S1","S2","S3","U1","U2","r"]);

    slideLeft.addEventListener("click", (event) => {
      const btn = event.target.closest(".button");
      if (!btn || !menu03Ids.has(btn.id)) return;

      const cell = MapController.selectedCell;
      if (!cell) return;

      MapController.changeBuild(btn.id, builds, cell);
      this.hideMenu03();
      MapController.deselectCell();
    });

    slideLeft.dataset.menu03Bound = "true";
  }

  static handleClickMenu02(slideLeft, builds) {
    if (!slideLeft || slideLeft.dataset.menu02Bound === "true") return;

    slideLeft.addEventListener("click", (event) => {
      const btn = event.target.closest(".button");
      if (!btn) return;

      const cell = MapController.selectedCell;
      if (!cell) return;

      // Handle MOVE button
      if (btn.id === "move") {
        // Activar modo movimiento
        this.moveMode = true;
        this.selectedCell = cell;
        const mapItem = document.querySelector(`#map-item-${cell.cellData.id}`);
        mapItem.classList.add("moving");
        const mapContainer = document.querySelector("#map");
        mapContainer?.classList.add("move-mode");
        
        this.hideMenu02();
        MapController.deselectCell();
      }

      // Handle DESTROY button
      if (btn.id === "destroy") {
        // Obtener las clases actuales del edificio
        MapController.changeBuild("g", builds, cell);
        
        console.log(`Building destroyed at cell ${cell.id}`);
        this.hideMenu02();
        MapController.deselectCell();
      }
    });

    slideLeft.dataset.menu02Bound = "true";
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
    Logger.log("🚚 [SlideLeft] completeMoveBuilding desde", this.selectedCell?.id, "a", targetCell.id);
    if (!this.moveMode || !this.selectedCell || !this.builds) {
      Logger.warn("⚠️ [SlideLeft] No está en modo movimiento");
      return false;
    }

    // No mover a la misma celda
    if (targetCell.id === this.selectedCell.id) {
      this.cancelMoveMode();
      return false;
    }
    
    if (!targetCell || !this.selectedCell) return false;

    // Verificar que la celda destino esté vacía (solo "g")
    if (targetCell.cellData.type !== "g") {
      Logger.warn("⚠️ [SlideLeft] Celda destino no está vacía");
      console.warn("Target cell is not empty");
      this.cancelMoveMode();
      return false;
    }

    // Mover el edificio visualmente
    // 1. Limpiar origen (volver a ground)
    MapController.changeBuild("g", this.builds, this.selectedCell);
    
    // 2. Colocar en destino
    const buildingType = `${this.selectedCell.cellData.type}${this.selectedCell.cellData.subtype || ""}`;
    MapController.changeBuild(buildingType, this.builds, targetCell);
    
    Logger.log("✅ [SlideLeft] Edificio movido exitosamente");
    
    // Limpiar estado
    this.cancelMoveMode();
    return true;
  }

  static cancelMoveMode() {
    if (this.selectedCell) {
      const sourceBuildingItem = document.querySelector(`#map-item-${this.selectedCell.cellData.id}`);
      sourceBuildingItem?.classList.remove("moving");
    }
    
    const mapContainer = document.querySelector("#map");
    mapContainer?.classList.remove("move-mode");
    
    this.moveMode = false;
    this.selectedCell = null;
  }

  static initSlideLeftController(city, builds) {
    Logger.log("🏛️ [SlideLeft] Inicializando controller...");
    const slideLeft = document.querySelector("#slide-left");
    const containerResources = document.querySelector(".resources");
    const btnResources = document.querySelector("#resource");

    // Guardar builds para usarlo en completeMoveBuilding
    this.builds = builds;

    this.handleClickMenu03(slideLeft, builds);
    this.handleClickMenu02(slideLeft, builds);
    this.handleClickResourceButton(containerResources, btnResources);
    this.handleClickMenu01(slideLeft);
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