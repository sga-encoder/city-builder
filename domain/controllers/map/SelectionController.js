import { SlideLeftController } from "../slideLeft/Controller.js";
import { LocalStorage } from "../../../database/LocalStorage.js";

export class MapSelectionController {
  /** @type {object|null} */
  static activeCell = null;

  /** @type {string} */
  static interactionMode = "view";

  /**
   * Selecciona una celda en el mapa y persiste la referencia seleccionada.
   * @param {string} id - Id de celda.
   * @param {object} cellData - Datos del contenido de la celda.
   * @param {number} i - Índice de fila.
   * @param {number} j - Índice de columna.
   * @returns {void}
   */
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

  /**
   * Cambia el panel lateral al menú de construcción.
   * @returns {void}
   */
  static openBuildMenu() {
    SlideLeftController.setMenuState("build");
  }

  /**
   * Cambia el panel lateral al menú de gestión.
   * @returns {void}
   */
  static openManageMenu() {
    SlideLeftController.setMenuState("manage");
  }

  /**
   * Limpia la selección activa y restablece el modo de interacción.
   * @returns {void}
   */
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
