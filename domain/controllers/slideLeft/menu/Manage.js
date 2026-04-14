import { runPressAnimation } from "../../../utilis/runPressAnimation.js";
export class ManageMenuController {
  /**
    * Vincula interacciones de clic para el menu-02 (acciones de gestión).
    * @param {HTMLElement} menuElement - Elemento raíz del menú renderizado.
    * @param {object} context - Contexto compartido de interacción del panel izquierdo.
   * @returns {void}
   */
  static bind(menuElement, context) {
    if (!menuElement || !context) {
      console.error("[ManageMenuController] menuElement o context inválidos");
      return;
    }

    try {
      const { state, constants, mapController, setMenuState } = context;

      menuElement.addEventListener("click", async (e) => {
        e.stopPropagation();

        try {
          if (mapController?.isInteractionLocked?.()) {
            return;
          }

          const btn = e.target.closest(".button");
          if (!btn) return;

          const cell = mapController.activeCell;
          if (!cell) {
            console.warn("[ManageMenuController] No hay celda activa");
            return;
          }

          await runPressAnimation(btn);

          if (btn.id === "move") {
            state.moveMode = true;
            state.selectedCell = cell;
            state.sourceBuilding = cell.id;
            document
              .querySelector(`#map-item-${state.sourceBuilding}`)
              ?.classList.add("moving");
            document.querySelector("#map")?.classList.add("move-mode");
            setMenuState(constants.MENU_STATE.NONE);
            mapController.clearCellSelection();
          } else if (btn.id === "info") {
            mapController.openBuildingInfoPanel(cell);
          } else if (btn.id === "destroy") {
            const demolished = mapController.demolishCell(cell);
            if (!demolished) {
              console.warn("[ManageMenuController] No se pudo demoler la celda activa");
              return;
            }
            setMenuState(constants.MENU_STATE.NONE);
            mapController.clearCellSelection();
          }
        } catch (clickError) {
          console.error("[ManageMenuController] Error procesando clic:", clickError);
        }
      });
    } catch (bindError) {
      console.error("[ManageMenuController] Error bindeando evento:", bindError);
    }
  }
}
