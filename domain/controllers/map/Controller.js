import { MapCameraController } from "./CameraController.js";
import { MapSelectionController } from "./SelectionController.js";
import { MapEventBinder } from "./EventBinder.js";
import { MapModelObserverBinder } from "./ModelObserverBinder.js";
import { MapBuildController } from "./BuildController.js";
import { SlideLeftController } from "../slideLeft/Controller.js";
import { Logger } from "../../utilis/Logger.js";
import { LocalStorage } from "../../../database/localStorage.js";
import { BuildingRenderer } from "../../components/building/Renderer.js";
import { MapRouteController } from "./DijsktraController.js";
import { RouteModeController } from "./RouteModeController.js";
import { calculateRoute } from "../../../database/dijsktra.js";
import { ToastService } from "../../services/toast.js";

export class MapController {
  /**
   * Controlador fachada para interacciones del mapa.
   * Coordina selección de celdas, cámara, renderizado y operaciones de edificios.
   */
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

  /**
   * Inicializa la cámara del mapa y registra la limpieza de selección al empezar pan.
   * @returns {void}
   */
  static initializeCamera() {
    MapCameraController.initializeCamera(() => this.clearCellSelection());
  }

  /**
   * Reasigna listeners de clic sobre celdas del mapa usando el estado actual.
   * @returns {void}
   */
  static rebindCellListeners() {
    MapEventBinder.bindMapClick({
      mapContainerElement: this.mapContainerElement,
      buildingGrid: this.buildingGrid || [],
      hasPanned: () => MapCameraController.hasPanned,
      isInteractionLocked: () => this.isInteractionLocked(),
      onCellClick: (id, cellData, i, j) => {
        if (this.isRoadBuildModeActive()) {
          return RouteModeController.toggleRoadBuildCell(id, cellData, i, j);
        }

        return MapRouteController.handleRouteCellClick(id, cellData, i, j);
      },
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

  static isInteractionLocked() {
    return MapRouteController.routeCalculating;
  }

  static isRoadBuildModeActive() {
    return RouteModeController.isRoadBuildModeActive();
  }

  static getRoadBuildSummary() {
    return RouteModeController.getRoadBuildSummary();
  }

  static setRoadBuildSidebarVisibility(hidden) {
    RouteModeController.setRoadBuildSidebarVisibility(hidden);
  }

  static startRoadBuildMode(btnId = "r") {
    RouteModeController.startRoadBuildMode(this, btnId);
  }

  static cancelRoadBuildMode({ silent = false } = {}) {
    RouteModeController.cancelRoadBuildMode(this, { silent });
  }

  static confirmRoadBuild(builds) {
    return RouteModeController.confirmRoadBuild(this, builds);
  }

  // =====================
  // SELECTION STATE PROXIES
  // =====================

  /**
   * Celda actualmente seleccionada en el mapa.
   * @returns {object|null}
   */
  static get activeCell() {
    return MapSelectionController.activeCell;
  }

  /**
   * Modo de interacción actual (`view`, `build`, `manage`).
   * @returns {string}
   */
  static get interactionMode() {
    return MapSelectionController.interactionMode;
  }

  /**
   * Actualiza el modo de interacción actual.
   * @param {string} value - Nuevo modo de interacción.
   * @returns {void}
   */
  static set interactionMode(value) {
    MapSelectionController.interactionMode = value;
  }

  /**
   * Selecciona una celda del mapa.
   * @param {string} id - Identificador de celda.
   * @param {object} cellData - Datos del contenido de la celda.
   * @param {number} i - Índice de fila.
   * @param {number} j - Índice de columna.
   * @returns {void}
   */
  static selectMapCell(id, cellData, i, j) {
    return MapSelectionController.selectMapCell(id, cellData, i, j);
  }

  /**
   * Limpia la celda seleccionada y reinicia el estado de interacción.
   * @returns {void}
   */
  static clearCellSelection() {
    return MapSelectionController.clearCellSelection();
  }

  /**
   * Abre el menú de construcción en el panel lateral.
   * @returns {void}
   */
  static openBuildMenu() {
    return MapSelectionController.openBuildMenu();
  }

  /**
   * Abre el menú de gestión del edificio seleccionado.
   * @returns {void}
   */
  static openManageMenu() {
    return MapSelectionController.openManageMenu();
  }

  // =====================
  // BUILDING OPERATIONS
  // =====================

  /**
   * Renderiza visualmente un edificio dentro de una celda concreta.
   * @param {string} cellId - Id de celda destino.
   * @param {object} building - Instancia de edificio con método `build()`.
   * @returns {HTMLElement|undefined}
   */
  static renderBuildingInCell(cellId, building) {
    const mapItem = document.querySelector(`#map-item-${cellId}`);
    if (!mapItem || !building) return;

    mapItem.querySelector(".building")?.remove();
    mapItem.appendChild(BuildingRenderer.render(building));
    return mapItem;
  }

  /**
   * Reemplaza el edificio de una celda usando el controlador de construcción.
   * @param {string} btnId - Id del botón/tipo de edificio.
   * @param {object} builds - Registro de modelos de edificios.
   * @param {object} cell - Celda objetivo.
   * @returns {object|undefined}
   */
  static replaceCellBuilding(btnId, builds, cell) {
    return MapBuildController.replaceCellBuilding(
      btnId,
      builds,
      cell,
      this.mapModel,
    );
  }

  /**
   * Mueve un edificio desde una celda origen hacia una celda destino.
   * @param {object} sourceCell - Celda origen.
   * @param {object} targetCell - Celda destino.
   * @param {object} builds - Registro de modelos de edificios.
   * @returns {boolean}
   */
  static moveBuildingCell(sourceCell, targetCell, builds) {
    return MapBuildController.moveBuildingCell(
      sourceCell,
      targetCell,
      builds,
      this.mapModel,
    );
  }

  /**
   * Compra y coloca un edificio en una celda.
   * @param {string} btnid - Id del botón/tipo de edificio.
   * @param {object} builds - Registro de modelos de edificios.
   * @param {object} cell - Celda objetivo.
   * @returns {object|boolean}
   */
  static buyBuildingCell(btnid, builds, cell) {
    return MapBuildController.buyBuildingCell(
      btnid,
      builds,
      cell,
      this.mapModel,
      this.city,
    );
  }

  /**
   * Solicita cálculo de ruta enviando roadMatrix + start/end al backend.
   * @param {[number, number]} start - Coordenada origen [i, j].
   * @param {[number, number]} end - Coordenada destino [i, j].
   * @returns {Promise<{ok:boolean, route?:number[][], error?:string, status?:number}>}
   */
  static async calculateMapRoute(start, end) {
    return calculateRoute({
      roadMatrix: this.mapModel?.roadMatrix,
      start,
      end,
    });
  }

  // =====================
  // INTERNAL SETUP
  // =====================

  /**
   * Asigna referencias de ciudad y mapa para uso del controlador.
   * @param {object} cityModel - Modelo de ciudad recibido en la inicialización.
   * @returns {void}
   */
  static setupMapModel(cityModel) {
    this.city = cityModel;
    this.mapModel = this.city.map;
    this.buildingGrid = this.mapModel.grid;
    Logger.log("✅ [MapController] buildingGrid asignado");
  }

  /**
   * Suscribe el observador de cambios de celdas para refrescar render y listeners.
   * @returns {void}
   */
  static bindMapModelObserver() {
    return MapModelObserverBinder.bindCellUpdatedObserver(this);
  }

  // =====================
  // LIFECYCLE
  // =====================

  /**
   * Configura listeners e inicialización de cámara cuando el mapa ya está renderizado.
   * @returns {void}
   */
  static setupMapInteractions() {
    const hasMap = !!this.mapContainerElement.querySelector(".map");
    const hasData = !!LocalStorage.loadData("map");

    if (!hasMap || !hasData) return;

    this.rebindCellListeners();
    this.initializeCamera();
  }

  /**
   * Inicializa el controlador del mapa con el modelo de ciudad.
   * @param {object} cityModel - Instancia del modelo de ciudad con mapa y recursos.
   * @returns {void}
   */
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

    // API pública para que frontend pida ruta y reciba la respuesta cruda del backend.
    Logger.log("✅ [MapController] buildingGrid asignado");
    this.setupMapModel(cityModel);
    this.bindMapModelObserver();

    MapRouteController.configure({
      showToast: (message, type, duration) =>
        ToastService.mostrarToast(message, type, duration),
      selectMapCell: (id, cellData, i, j) => this.selectMapCell(id, cellData, i, j),
      clearCellSelection: () => this.clearCellSelection(),
      setInteractionMode: (mode) => {
        this.interactionMode = mode;
      },
      calculateMapRoute: (start, end) => this.calculateMapRoute(start, end),
    });

    this.setupMapInteractions();
    MapRouteController.bindRouteModeTestControls();

    // Fallback durante arranque asíncrono
    MapCameraController.initializeCameraRetry(() =>
      this.setupMapInteractions(),
    );

    MapEventBinder.bindGlobalClick({
      getActiveCellId: () => this.activeCell?.id || null,
      hasPanned: () => MapCameraController.hasPanned,
      isInteractionLocked: () => this.isInteractionLocked(),
      clearSelection: () => this.clearCellSelection(),
      cancelMoveMode: () => SlideLeftController.cancelMoveMode(),
    });

    // API pública para pruebas/manual desde consola del navegador.
    window.calculateMapRoute = (start, end) =>
      this.calculateMapRoute(start, end);
  }
}
