import { Map as CityMap } from "../../../../models/Map.js";
import { RoutingModeController } from "./RoutingMode.js";

export class SelectBuildingMenuController {
  /**
   * Vincula interacciones de clic para el menu-03 (selección de edificio).
   * @param {HTMLElement} menuElement - Elemento raíz del menú renderizado.
   * @param {object} context - Contexto compartido de interacción del panel izquierdo.
   * @returns {void}
   */
  static bind(menuElement, context) {
    const { state, constants, logger, mapController, setMenuState } = context;
    const acceptedIds = new Set(CityMap.typeBuildingAcceptedMap);
    const routingModeContext = {
      state,
      constants,
      mapController,
      setMenuState,
      logger,
    };

    RoutingModeController.renderRoadActions(routingModeContext);

    menuElement.addEventListener("click", (e) => {
      e.stopPropagation();

      if (mapController?.isInteractionLocked?.()) {
        return;
      }

      const btn = e.target.closest(".button");

      logger.log("[SlideLeft][menu-03 click]", {
        hasButton: !!btn,
        buttonId: btn?.id || null,
        validButton: btn ? acceptedIds.has(btn.id) : false,
        hasActiveCell: !!mapController.activeCell,
        activeCellId: mapController.activeCell?.id || null,
      });

      if (!btn || !acceptedIds.has(btn.id)) return;

      if (RoutingModeController.activateFromSelectBuilding(btn.id, routingModeContext)) {
        return;
      }

      if (RoutingModeController.guardBuildWhileRoadMode(routingModeContext)) {
        return;
      }

      const cell = mapController.activeCell;
      if (!cell) {
        logger.warn(
          "[SlideLeft][menu-03] No hay activeCell al intentar construir",
        );
        return;
      }

      const buildResult = mapController.buyBuildingCell(btn.id, state.builds, cell);
      if (!buildResult) {
        return;
      }

      setMenuState(constants.MENU_STATE.NONE);
      mapController.clearCellSelection();
    });
  }
}
