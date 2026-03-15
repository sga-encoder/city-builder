class SlideLeftMoveBuildingService {
  /**
    * Intenta mover el edificio seleccionado actualmente a una celda objetivo.
    * @param {object} targetCell - Celda destino del mapa.
    * @param {object} context - Dependencias y callbacks del servicio.
    * @param {object} context.state - Estado compartido del panel izquierdo.
    * @param {object} context.logger - Utilidad de logging.
    * @param {object} context.mapController - API del controlador del mapa.
    * @param {() => void} context.cancelMoveMode - Callback para salir del modo movimiento.
   * @returns {boolean}
   */
  static completeMoveBuilding(targetCell, context) {
    const { state, logger, mapController, cancelMoveMode } = context;

    if (!targetCell) return false;

    logger.log(
      "🚚 [SlideLeft] completeMoveBuilding desde",
      state.selectedCell?.id,
      "a",
      targetCell.id,
    );

    if (!state.moveMode || !state.selectedCell || !state.builds) {
      logger.warn("⚠️ [SlideLeft] No está en modo movimiento");
      return false;
    }

    if (targetCell.id === state.selectedCell.id) {
      cancelMoveMode();
      return false;
    }

    if (!state.selectedCell) return false;

    if (targetCell.cellData.type !== "g") {
      logger.warn("⚠️ [SlideLeft] Celda destino no está vacía");
      console.warn("Target cell is not empty");
      cancelMoveMode();
      return false;
    }

    const moved = mapController.moveBuildingCell(
      state.selectedCell,
      targetCell,
      state.builds,
    );

    if (!moved) {
      cancelMoveMode();
      return false;
    }

    logger.log("✅ [SlideLeft] Edificio movido exitosamente");
    cancelMoveMode();
    return true;
  }

  /**
    * Reinicia el modo movimiento y elimina clases transitorias de la UI.
    * @param {object} state - Estado compartido del panel izquierdo.
   * @returns {void}
   */
  static cancelMoveMode(state) {
    if (state.sourceBuilding) {
      const sourceBuildingItem = document.querySelector(
        `#map-item-${state.sourceBuilding}`,
      );
      sourceBuildingItem?.classList.remove("moving");
    }

    const mapContainer = document.querySelector("#map");
    mapContainer?.classList.remove("move-mode");

    state.moveMode = false;
    state.selectedCell = null;
    state.sourceBuilding = null;
  }
}
