import { SlideLeftConstants } from "./constants.js";
export class SlideLeftState {
  /**
   * Estado estático compartido para el flujo del controlador del panel izquierdo.
   * Este objeto actúa como fuente única de verdad para controlador y servicios.
   */
  static menuState = SlideLeftConstants.MENU_STATE.NONE;
  static city = null;
  static icons = null;
  static sheets = null;

  static resourceObjects = null;
  static containerElement = null;
  static moveMode = false;
  static selectedCell = null;
  static sourceBuilding = null;
  static builds = null;
}
