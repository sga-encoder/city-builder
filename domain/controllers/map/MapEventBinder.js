class MapEventBinder {
  static #globalClickBound = false;
  static #mapClickHandler = null;

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
