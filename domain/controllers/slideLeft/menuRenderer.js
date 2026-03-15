class SlideLeftMenuRenderer {
  /**
    * Renderiza la variante de menú actual dentro de `#slide-left .menu-slot`.
    * @param {object} context - Contexto de renderizado e interacción.
    * @param {object} context.state - Objeto de estado compartido del panel izquierdo.
    * @param {object} context.constants - Mapa de constantes del menú.
    * @param {object} context.logger - Utilidad de logging.
    * @param {object} context.icons - Recursos de iconos.
    * @param {object} context.builds - Definiciones de edificios.
    * @param {(nextState: string) => void} context.setMenuState - Callback de transición de estado.
   * @returns {void}
   */
  static render(context) {
    const { state, constants, logger, icons, builds, setMenuState } = context;

    const slot = document.querySelector("#slide-left .menu-slot");
    if (!slot) {
      logger.warn("[SlideLeft][renderMenu] No se encontro .menu-slot");
      logger.warn("⚠️ [SlideLeft] No se encontro .menu-slot");
      return;
    }

    logger.log("[SlideLeft][renderMenu] render state:", state.menuState);

    slot.innerHTML = "";
    const sheets = document.styleSheets[1];

    switch (state.menuState) {
      case constants.MENU_STATE.BUILD: {
        const m01 = createMenu01(icons, sheets);
        logger.log("[SlideLeft][menu-01] Renderizado", {
          hasIcons: !!icons,
          hasBuilds: !!builds,
        });

        BuildMenuHandler.bind(m01, context);
        slot.appendChild(m01);
        break;
      }

      case constants.MENU_STATE.MANAGE: {
        const m02 = createMenu02(icons, sheets);
        ManageMenuHandler.bind(m02, context);
        slot.appendChild(m02);
        break;
      }

      case constants.MENU_STATE.SELECT_BUILDING: {
        const m03 = createMenu03(builds, sheets);
        const renderedButtons = m03.querySelectorAll(".button").length;
        logger.log("[SlideLeft][menu-03] Renderizado", {
          buttons: renderedButtons,
          hasBuilds: !!builds,
          state: state.menuState,
        });

        SelectBuildingMenuHandler.bind(m03, context);
        slot.appendChild(m03);
        m03.scrollLeft = 0;
        break;
      }

      default:
        break;
    }
  }
}
