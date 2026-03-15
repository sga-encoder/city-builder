class BuildMenuHandler {
    /**
        * Vincula interacciones de clic para el menu-01 (entrada de construcción).
        * @param {HTMLElement} menuElement - Elemento raíz del menú renderizado.
        * @param {object} context - Contexto compartido de interacción del panel izquierdo.
     * @returns {void}
     */
    static bind(menuElement, context) {
        const { logger, constants, setMenuState, state } = context;

        menuElement.addEventListener("click", (e) => {
            // Evita que el handler global cierre el menú durante este mismo click.
            e.stopPropagation();
            const buildBtn = e.target.closest("#build");
            logger.log("[SlideLeft][menu-01 click]", {
                clicked: !!buildBtn,
                targetId: e.target?.id || null,
                currentState: state.menuState,
            });

            if (buildBtn) {
                logger.log("[SlideLeft] Transición a menu-03 solicitada");
                setMenuState(constants.MENU_STATE.SELECT_BUILDING);
            }
        });
  }
}
