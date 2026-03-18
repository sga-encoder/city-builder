import { SlideLeftController } from "../SlideLeftController.js";
import { Logger } from "../../utilis/Logger.js";

export class MapEventBinder {
  static #globalClickBound = false;
  static #mapClickHandler = null;

  /**
   * Registra el listener principal de clic sobre celdas del mapa.
   * @param {object} params - Dependencias y callbacks de interacción.
   * @param {HTMLElement} params.mapContainerElement - Contenedor raíz del mapa.
   * @param {object[][]} params.buildingGrid - Matriz de datos/instancias por celda.
   * @param {() => boolean} params.hasPanned - Indica si hubo paneo reciente.
   * @param {(id: string, cellData: object, i: number, j: number) => void} params.onSelectGround - Callback para celda de terreno.
   * @param {(id: string, cellData: object, i: number, j: number) => void} params.onSelectBuilding - Callback para celda con edificio.
   * @param {(cellRef: object) => boolean} params.onTryMove - Callback para intentar mover edificio.
   * @param {() => void} [params.onPersistMap] - Callback opcional para persistencia.
   * @returns {void}
   */
  static bindMapClick({
    mapContainerElement,
    buildingGrid,
    hasPanned,
    onSelectGround,
    onSelectBuilding,
    onTryMove,
    onPersistMap,
  }) {
    const mapRoot = mapContainerElement?.querySelector(".map");
    if (!mapRoot) return;

    if (this.#mapClickHandler) {
      mapRoot.removeEventListener("click", this.#mapClickHandler);
    }

    this.#mapClickHandler = (e) => {
      if (hasPanned()) return;

      const item = e.target.closest(".map-item");
      if (!item) return;

      e.stopPropagation();

      const id = item.id?.replace("map-item-", "");
      if (!id) return;

      const i = Number.parseInt(id.slice(0, 2), 10);
      const j = Number.parseInt(id.slice(2, 4), 10);
      const cellData = buildingGrid?.[i]?.[j];
      if (!cellData) return;

      if (SlideLeftController.moveMode) {
        const moved = onTryMove({ id, cellData, i, j });
        if (moved) return;
      }

      if (cellData.type === "g") {
        onSelectGround(id, cellData, i, j);
      } else {
        onSelectBuilding(id, cellData, i, j);
      }
    };

    mapRoot.addEventListener("click", this.#mapClickHandler);

    onPersistMap?.();
  }

  /**
   * Registra un listener global de documento para limpiar selección o cancelar movimiento.
   * @param {object} params - Dependencias y callbacks globales.
   * @param {() => (string|null)} params.getActiveCellId - Obtiene el id de la celda activa.
   * @param {() => boolean} params.hasPanned - Indica si hubo paneo reciente.
   * @param {() => void} params.clearSelection - Limpia selección activa.
   * @param {() => void} params.cancelMoveMode - Cancela modo movimiento.
   * @returns {void}
   */
  static bindGlobalClick({
    getActiveCellId,
    hasPanned,
    clearSelection,
    cancelMoveMode,
  }) {
    if (this.#globalClickBound) return;
    this.#globalClickBound = true;
    document.addEventListener("click", (e) => {
      const inSlideLeft = !!e.target.closest("#slide-left");
      const inMap = !!e.target.closest("#map");
      const inMapItem = !!e.target.closest(".map-item");

      Logger.log("🖱️ [MapController] Global click", {
        inSlideLeft,
        inMap,
        inMapItem,
        activeCellId: getActiveCellId(),
      });

      // Cualquier interacción en el menú lateral no debe limpiar selección.
      if (inSlideLeft) {
        return;
      }

      if (inMapItem) return;

      if (inMap) {
        if (!hasPanned()) {
          clearSelection();
          cancelMoveMode();
        }
        return;
      }

      if (!inSlideLeft) {
        clearSelection();
        cancelMoveMode();
      }
    });
  }
}
