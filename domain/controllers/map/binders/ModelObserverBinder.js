export class MapModelObserverBinder {
  /**
   * Registra observer para cambios de celdas y refresca vista/listeners.
   * @param {typeof MapController} controller - Controlador del mapa.
   * @returns {void}
   */
  static bindCellUpdatedObserver(controller) {
    if (!controller?.mapModel?.addObserver) return;

    controller.mapModel.addObserver((change) => {
      if (change.type === "cell-updated") {
        controller.renderBuildingInCell(change.id, change.current);
        controller.rebindCellListeners();
      }
    });
  }
}
