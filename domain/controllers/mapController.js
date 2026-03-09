class MapController {
  // =====================
  // STATIC PROPERTIES
  // =====================
  static selectedCell = null;
  static currentMode = "view";
  static mapCamera = null;
  static resizeTimeout = null;
  static cameraInitAttempts = 0;
  static cameraInitInterval = null;
  static mapContainer = null;
  static observer = null;
  static mapData = null; // Grid de instancias reales de Building (no copias planas)

  // =====================
  // STATIC METHODS
  // =====================

  static getInitialScaleByScreen(width) {
    const maxScale = 5;
    const minScale = 0.5;
    const scale = 1;
    const movileScaleFactor = 8;
    const tabletScaleFactor = 4;

    if (width <= 756)
      return {
        maxScale: maxScale * movileScaleFactor,
        scale: scale * movileScaleFactor,
        minScale: minScale * movileScaleFactor,
      };
    if (width <= 1024)
      return {
        maxScale: maxScale * tabletScaleFactor,
        scale: scale * tabletScaleFactor,
        minScale: minScale * tabletScaleFactor,
      };
    return { maxScale, scale, minScale };
  }

  static setupMapCamera() {
    const viewport = document.querySelector("#map");
    const map = viewport?.querySelector(".map");

    if (!viewport || !map) return;
    if (viewport.dataset.cameraReady === "true") return;

    try {
      const { maxScale, scale, minScale } = this.getInitialScaleByScreen(
        window.innerWidth,
      );
      this.mapCamera = new MapCamera("#map", document.styleSheets[1], {
        minScale,
        maxScale,
        scale,
      });

      this.mapCamera.onDragStart(() => {
        this.deselectCell();
      });

      const applyResponsiveZoom = () => {
        const targetScale = this.getInitialScaleByScreen(
          window.innerWidth,
        ).scale;
        const worldCenterX = map.offsetWidth / 2;
        const worldCenterY = map.offsetHeight / 2;
        this.mapCamera.centerOn(worldCenterX, worldCenterY, targetScale);
      };

      // Aplicar zoom inicial
      requestAnimationFrame(() => {
        applyResponsiveZoom();
      });

      // Reajustar al cambiar tamaño de pantalla
      window.addEventListener("resize", () => {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
          const { maxScale, minScale } = this.getInitialScaleByScreen(
            window.innerWidth,
          );
          this.mapCamera.setScaleLimits(minScale, maxScale);
          applyResponsiveZoom();
        }, 150);
      });

      window.mapCamera = this.mapCamera;
    } catch (error) {
      console.error("Error inicializando MapCamera:", error);
    }
  }

  static refreshMapEvents() {
    // Limpia listeners viejos
    document.querySelectorAll(".map-item").forEach((item) => {
      item.dataset.eventsBound = "false";
    });

    const map = this.mapData || [];

    for (let i = 0; i < map.length; i++) {
      for (let j = 0; j < map[i].length; j++) {
        const cell = map[i][j];
        const id = cell.id;
        const item = document.querySelector(`#map-item-${id}`);

        if (!item) continue;
        if (item.dataset.eventsBound === "true") continue;

        item.dataset.eventsBound = "true";

        item.addEventListener("click", (e) => {
          if (this.mapCamera?.didDrag) return;
          e.stopPropagation();

          if (SlideLeftController.moveMode) {
            const cellRef = { id, cellData: map[i][j], i, j };
            const moved = SlideLeftController.completeMoveBuilding(cellRef);
            if (moved) return;
          }

          if (map[i][j].type === "g") {
            this.selectCell(id, map[i][j], i, j);
            this.showBuildMenu();
            this.currentMode = "build";
          } else {
            this.selectCell(id, map[i][j], i, j);
            this.showManageMenu();
            this.currentMode = "manage";
          }
        });
      }
    }

    // Serializar instancias a formato simple para localStorage
    const serializableMap = map.map(row => row.map(building => ({...building})));
    LocalStorage.saveData("map", JSON.stringify(serializableMap));
  }

  static selectCell(id, cellData, i, j) {
    if (this.selectedCell) {
      document
        .querySelector(`#map-item-${this.selectedCell.id}`)
        ?.classList.remove("selected");
      SlideLeftController.hideAllMenu();
    }

    this.selectedCell = { id, cellData, i, j };
    document.querySelector(`#map-item-${id}`).classList.add("selected");
    LocalStorage.saveData("selectedCell", JSON.stringify(this.selectedCell));
  }

  static showBuildMenu() {
    SlideLeftController.showMenu01();
  }

  static showManageMenu() {
    SlideLeftController.showMenu02();
  }

  static deselectCell() {
    if (this.selectedCell) {
      document
        .querySelector(`#map-item-${this.selectedCell.id}`)
        ?.classList.remove("selected");
      this.selectedCell = null;
      LocalStorage.saveData("selectedCell", null);
      this.currentMode = "view";
      SlideLeftController.hideAllMenu();
    }
  }

  static changeBuild(btnId, builds, cell) {
    const map = this.mapData || null;
    if (!map) return;

    const [type, subtype] = [btnId[0], btnId[1]];
    const mapItem = document.querySelector(`#map-item-${cell.id}`);

    // Elimina construcción vieja si existe
    const oldBuilding = mapItem.querySelector(".building");
    if (oldBuilding) oldBuilding.remove();
    const modelKey = subtype ? `${type}.${subtype}` : type;

    const build = Building.create({
      id: cell.id,
      type,
      subtype,
      model: builds.getModel(modelKey),
    });

    mapItem.appendChild(build.build());
    
    // Asignar la instancia directamente (no copia plana)
    map[cell.i][cell.j] = build;
    
    // Serializar para localStorage
    const serializableMap = map.map(row => row.map(building => ({...building})));
    LocalStorage.saveData("map", JSON.stringify(serializableMap));

    this.refreshMapEvents();
    return mapItem;
  }

  static initializeMapInteractions() {
    const hasMap = !!this.mapContainer.querySelector(".map");
    const hasData = !!LocalStorage.loadData("map");

    if (!hasMap || !hasData) return;

    this.refreshMapEvents(); // ← Cambiar de addEvents() a refreshMapEvents()
    this.setupMapCamera();
  }

  static init(mapData) {
    this.mapContainer = document.querySelector("#map");
    if (!this.mapContainer) return;

    // Asignar mapData ANTES de inicializar interacciones
    this.mapData = mapData;

    this.initializeMapInteractions();

    // Fallback durante arranque asíncrono
    this.cameraInitAttempts = 0;
    this.cameraInitInterval = setInterval(() => {
      this.initializeMapInteractions();
      this.cameraInitAttempts += 1;

      if (
        this.mapContainer.dataset.cameraReady === "true" ||
        this.cameraInitAttempts >= 40
      ) {
        clearInterval(this.cameraInitInterval);
      }
    }, 100);

    this.observer = new MutationObserver(() => {
      this.initializeMapInteractions();
    });

    this.observer.observe(this.mapContainer, {
      childList: true,
      subtree: true,
    });

    // Global click handler
    document.addEventListener("click", (e) => {
      const inSlideLeft = !!e.target.closest("#slide-left");
      const inMap = !!e.target.closest("#map");
      const inMapItem = !!e.target.closest(".map-item");

      if (inMapItem) return;

      if (inMap) {
        if (!this.mapCamera?.didDrag) {
          this.deselectCell();
          SlideLeftController.cancelMoveMode();
        }
        return;
      }

      if (!inSlideLeft) {
        this.deselectCell();
        SlideLeftController.cancelMoveMode();
      }
    });
  }
}
