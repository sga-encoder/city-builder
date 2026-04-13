import { SlideLeftBuildMenuBuilder } from "./Build.js";
import { SlideLeftManageMenuBuilder } from "./Manage.js";
import { SlideLeftSelectionBuildingMenuBuilder } from "./SelectionBuilding.js";
import { BuildMenuController } from "../../../controllers/slideLeft/menu/Build.js";
import { ManageMenuController } from "../../../controllers/slideLeft/menu/Manage.js";
import { SelectBuildingMenuController } from "../../../controllers/slideLeft/menu/SelectBuilding.js";

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
    console.log("[SlideLeftMenuRenderer.render] Called with menuState:", state.menuState);
    
    const slot = this.#getSlot(logger);
    if (!slot) {
      console.error("[SlideLeftMenuRenderer.render] Slot no encontrado!");
      return;
    }

    logger.log("[SlideLeft][renderMenu] render state:", state.menuState);
    slot.innerHTML = "";
    const sheets = document.styleSheets[1];

    console.log("[SlideLeftMenuRenderer.render] About to switch on:", state.menuState);
    console.log("[SlideLeftMenuRenderer.render] constants.MENU_STATE:", constants.MENU_STATE);

    switch (state.menuState) {
      case constants.MENU_STATE.BUILD:
        console.log("[SlideLeftMenuRenderer.render] Renderizando BUILD menu");
        this.#renderBuildMenu(slot, context, sheets);
        break;
      case constants.MENU_STATE.MANAGE:
        console.log("[SlideLeftMenuRenderer.render] Renderizando MANAGE menu");
        this.#renderManageMenu(slot, context, sheets);
        break;
      case constants.MENU_STATE.SELECT_BUILDING:
        console.log("[SlideLeftMenuRenderer.render] Renderizando SELECT_BUILDING menu");
        this.#renderSelectBuildingMenu(slot, context, sheets);
        break;
      default:
        console.log("[SlideLeftMenuRenderer.render] Default case, renderizando SELECT_BUILDING");
        // this.#renderManageMenu(slot, context, sheets);
        this.#renderSelectBuildingMenu(slot, context, sheets);
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
    BuildMenuController.bind(m01, context);
    slot.appendChild(m01);
  }

  static #renderManageMenu(slot, context, sheets) {
    try {
      console.log("[SlideLeftMenuRenderer.#renderManageMenu] Starting render");
      const { icons, logger } = context;
      console.log("[SlideLeftMenuRenderer.#renderManageMenu] icons available:", !!icons);
      
      const m02 = SlideLeftManageMenuBuilder.build(icons, sheets);
      console.log("[SlideLeftMenuRenderer.#renderManageMenu] Menu built, buttons count:", m02.querySelectorAll(".button").length);
      
      logger.log("[SlideLeft][menu-02] Renderizado con éxito", {
        buttons: m02.querySelectorAll(".button").length,
        hasIcons: !!icons,
      });
      ManageMenuController.bind(m02, context);
      console.log("[SlideLeftMenuRenderer.#renderManageMenu] Controller bound");
      
      slot.appendChild(m02);
      console.log("[SlideLeftMenuRenderer.#renderManageMenu] Menu appended to slot");
    } catch (error) {
      console.error("[SlideLeftMenuRenderer.#renderManageMenu] Error renderizando menú manage:", error);
      const fallback = document.createElement("div");
      fallback.classList.add("container-buttons", "menu-02");
      fallback.textContent = "Error al cargar el menú de gestión";
      slot.appendChild(fallback);
    }
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
    SelectBuildingMenuController.bind(m03, context);
    slot.appendChild(m03);
    m03.scrollLeft = 0;
  }
}
