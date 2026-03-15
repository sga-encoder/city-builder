class ManageMenuHandler {
    static bind(menuElement, context) {
        const { state, constants, mapController, setMenuState } = context;

      menuElement.addEventListener("click", (e) => {
        e.stopPropagation();
        const btn = e.target.closest(".button");
        if (!btn) return;
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
        if (btn.id === "destroy") {
          mapController.replaceCellBuilding("g", state.builds, cell);
          setMenuState(constants.MENU_STATE.NONE);
          mapController.clearCellSelection();
        }
      });
  }
}
