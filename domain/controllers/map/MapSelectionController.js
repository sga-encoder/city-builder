class MapSelectionController {
  static activeCell = null;
  static interactionMode = "view";
  
  static selectMapCell(id, cellData, i, j) {
    if (this.activeCell) {
      document
        .querySelector(`#map-item-${this.activeCell.id}`)
        ?.classList.remove("selected");
      SlideLeftController.setMenuState("none");
    }

    this.activeCell = { id, cellData, i, j };
    document.querySelector(`#map-item-${id}`).classList.add("selected");
    LocalStorage.saveData("selectedCell", JSON.stringify(this.activeCell));
  }

  static openBuildMenu() {
    SlideLeftController.setMenuState("build");
  }

  static openManageMenu() {
    SlideLeftController.setMenuState("manage");
  }

  static clearCellSelection() {
    if (this.activeCell) {
      document
        .querySelector(`#map-item-${this.activeCell.id}`)
        ?.classList.remove("selected");
      this.activeCell = null;
      LocalStorage.saveData("selectedCell", null);
      this.interactionMode = "view";
      SlideLeftController.setMenuState("none");
    }
  }
}
