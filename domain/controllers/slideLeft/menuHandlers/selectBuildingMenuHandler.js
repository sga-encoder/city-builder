class SelectBuildingMenuHandler {
  static bind(menuElement, context) {
    const { state, constants, logger, mapController, setMenuState } = context;
    const acceptedIds = new Set(Map.typeBuildingAcceptedMap);

    menuElement.addEventListener("click", (e) => {
      e.stopPropagation();
      const btn = e.target.closest(".button");

      logger.log("[SlideLeft][menu-03 click]", {
        hasButton: !!btn,
        buttonId: btn?.id || null,
        validButton: btn ? acceptedIds.has(btn.id) : false,
        hasActiveCell: !!mapController.activeCell,
        activeCellId: mapController.activeCell?.id || null,
      });

      if (!btn || !acceptedIds.has(btn.id)) return;

      const cell = mapController.activeCell;
      if (!cell) {
        logger.warn(
          "[SlideLeft][menu-03] No hay activeCell al intentar construir",
        );
        return;
      }

      mapController.buyBuildingCell(btn.id, state.builds, cell);
      setMenuState(constants.MENU_STATE.NONE);
      mapController.clearCellSelection();
    });
  }
}
