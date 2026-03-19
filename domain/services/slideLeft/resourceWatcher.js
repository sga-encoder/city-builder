export class SlideLeftResourceWatcher {
  /**
    * Suscribe observadores de recursos y mantiene sincronizadas las etiquetas de UI.
    * @param {HTMLElement} container - Contenedor raíz del panel izquierdo.
    * @param {object} resourceObjects - Recursos observables indexados por nombre.
   * @returns {void}
   */
  static start(container, resourceObjects) {
    if (!resourceObjects || !container) return;

    const resourcesDiv = container.querySelector(".resources");
    if (!resourcesDiv || !resourcesDiv._resourceElements) return;

    const resourceElements = resourcesDiv._resourceElements;

    const createUpdateCallback = (type, unit, resourceRef) => {
      return (newValue) => {
        if (resourceElements[type]) {
          const li = resourceElements[type];
          const contentP = li.querySelector(".content");
          if (contentP) {
            const production = Number(resourceRef?.turnProduction || 0);
            const showTurnGenerationOnly = type === "energy" || type === "water";

            if (showTurnGenerationOnly) {
              contentP.textContent = `${production}${unit}/turno`;
            } else {
              contentP.textContent = `${newValue}${unit}`;
            }
          }
        }
      };
    };

    Object.keys(resourceObjects).forEach((resource) => {
      const resourceRef = resourceObjects[resource];
      const { type, unit, amount } = resourceRef;
      const callback = createUpdateCallback(type, unit, resourceRef);

      resourceObjects[resource].addObserver(callback);

      if (!resourcesDiv._observerCallbacks) {
        resourcesDiv._observerCallbacks = {};
      }
      resourcesDiv._observerCallbacks[type] = callback;

      callback(amount);
    });
  }
}
