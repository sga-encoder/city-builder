import { SlideLeftBuildMenuBuilder } from "./Build.js";
import { SlideLeftManageMenuBuilder } from "./Manage.js";
import { SlideLeftSelectionBuildingMenuBuilder } from "./SelectionBuilding.js";
import { BuildMenuHandler } from "../../../controllers/slideLeft/menuHandlers/buildMenuHandler.js";
import { ManageMenuHandler } from "../../../controllers/slideLeft/menuHandlers/manageMenuHandler.js";
import { SelectBuildingMenuHandler } from "../../../controllers/slideLeft/menuHandlers/selectBuildingMenuHandler.js";

export class SlideLeftMenuRenderer {
  /**
    * Renderiza la variante de menú actual dentro de `#slide-left .menu-slot`.
    * @param {object} context - Contexto de renderizado e interacción.
    * @param {object} context.state - Objeto de estado compartido del panel izquierdo.
    * @param {object} context.constants - Mapa de constantes del menú.
    * @param {object} context.logger - Utilidad de logging.
    * @param {object} context.icons - Recursos de iconos.
    * @param {object} context.builds - Definiciones de edificios.
   * @returns {void}
   */
  static render(context) {
    const { state, constants, logger } = context;
    const slot = this.#getSlot(logger);
    if (!slot) return;

    logger.log("[SlideLeft][renderMenu] render state:", state.menuState);
    slot.innerHTML = "";
    const sheets = document.styleSheets[1];

    switch (state.menuState) {
      case constants.MENU_STATE.BUILD:
        this.#renderBuildMenu(slot, context, sheets);
        break;
      case constants.MENU_STATE.MANAGE:
        this.#renderManageMenu(slot, context, sheets);
        break;
      case constants.MENU_STATE.SELECT_BUILDING:
        this.#renderSelectBuildingMenu(slot, context, sheets);
        break;
      default:
        break;
    }
  }

  static #getSlot(logger) {
    const slot = document.querySelector("#slide-left .menu-slot");
    if (!slot) {
      logger.warn("[SlideLeft][renderMenu] No se encontro .menu-slot");
      logger.warn("⚠️ [SlideLeft] No se encontro .menu-slot");
      return null;
    }
    return slot;
  }

  static #renderBuildMenu(slot, context, sheets) {
    const { icons, builds, logger } = context;
    const m01 = SlideLeftBuildMenuBuilder.build(icons, sheets);
    logger.log("[SlideLeft][menu-01] Renderizado", {
      hasIcons: !!icons,
      hasBuilds: !!builds,
    });
    BuildMenuHandler.bind(m01, context);
    slot.appendChild(m01);
  }

  static #renderManageMenu(slot, context, sheets) {
    const { icons } = context;
    const m02 = SlideLeftManageMenuBuilder.build(icons, sheets);
    ManageMenuHandler.bind(m02, context);
    slot.appendChild(m02);
  }

  static #renderSelectBuildingMenu(slot, context, sheets) {
    const { builds, logger, state } = context;
    const m03 = SlideLeftSelectionBuildingMenuBuilder.build(builds, sheets);
    const renderedButtons = m03.querySelectorAll(".button").length;
    logger.log("[SlideLeft][menu-03] Renderizado", {
      buttons: renderedButtons,
      hasBuilds: !!builds,
      state: state.menuState,
    });
    SelectBuildingMenuHandler.bind(m03, context);
    slot.appendChild(m03);
    m03.scrollLeft = 0;
  }
}
