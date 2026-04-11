import { runPressAnimation } from "../../../utilis/runPressAnimation.js";
export class ManageMenuController {
  /**
    * Vincula interacciones de clic para el menu-02 (acciones de gestión).
    * @param {HTMLElement} menuElement - Elemento raíz del menú renderizado.
    * @param {object} context - Contexto compartido de interacción del panel izquierdo.
   * @returns {void}
   */
  static bind(menuElement, context) {
    const { state, constants, mapController, setMenuState } = context;

    menuElement.addEventListener("click", async (e) => {
      e.stopPropagation();

      if (mapController?.isInteractionLocked?.()) {
        return;
      }

      const btn = e.target.closest(".button");
      if (!btn) return;
      await runPressAnimation(btn);
      const cell = mapController.activeCell;
      if (!cell) return;

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
      }
      if (btn.id === "info") {
        mapController.openBuildingInfoPanel(cell);
      }
      if (btn.id === "destroy") {
        mapController.replaceCellBuilding("g", state.builds, cell);
        setMenuState(constants.MENU_STATE.NONE);
        mapController.clearCellSelection();
      }
    });
  }
}
