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

    const formatSigned = (value) => {
      const rounded = Math.round(Number(value || 0));
      return `${rounded > 0 ? "+" : ""}${rounded}`;
    };

    const setTooltip = (li, lines) => {
      if (!li) return;
      li.classList.add("has-tooltip");
      li.setAttribute("data-tooltip", lines.join("\n"));
    };

    const clearTooltip = (li) => {
      if (!li) return;
      li.classList.remove("has-tooltip");
      li.removeAttribute("data-tooltip");
    };

    const createUpdateCallback = (type, unit, resourceRef) => {
      return (newValue) => {
        if (resourceElements[type]) {
          const li = resourceElements[type];
          const contentP = li.querySelector(".content");
          if (contentP) {
            const   production = Number(resourceRef?.turnProduction || 0);
            const consumption = Number(resourceRef?.turnConsumption || 0);
            const showProductionConsumption =
              type === "energy" || type === "water";

            if (type === "money") {
              const amount = Math.round(Number(newValue || 0));
              contentP.textContent = `$${amount.toLocaleString("en-US")}`;

              contentP.classList.remove("money-high", "money-mid", "money-low");
              if (amount < 1000) {
                contentP.classList.add("money-low");
              } else if (amount < 5000) {
                contentP.classList.add("money-mid");
              } else if (amount > 10000) {
                contentP.classList.add("money-high");
              }

              const refreshMoneyTooltip = () => {
                const liveProduction = Math.round(
                  Number(resourceRef?.turnProduction || 0),
                );
                setTooltip(li, [
                  `Dinero que se suma cada turno: $${liveProduction.toLocaleString("en-US")}`,
                ]);
              };

              // Render inmediato + microtask para leer turnProduction actualizado
              // cuando el turno termine de mutar el recurso en este mismo tick.
              refreshMoneyTooltip();
              Promise.resolve().then(refreshMoneyTooltip);
              return;
            }

            if (showProductionConsumption) {
              contentP.textContent = `${production} / ${consumption} unidades`;

              setTooltip(li, [
                `Produccion detallada: ${production} unidades/turno`,
                `Consumo detallado: ${consumption} unidades/turno`,
                `Balance neto: ${formatSigned(production - consumption)} unidades por consumir`,
              ]);
            } else if (type === "citizens") {
              contentP.textContent = `${newValue} ciudadanos`;
              clearTooltip(li);
            } else {
              contentP.textContent = `${newValue}${unit}`;

              setTooltip(li, [
                `Produccion detallada: ${production} ${unit}`.trim(),
                `Consumo detallado: ${consumption} ${unit}`.trim(),
                `Balance neto: ${formatSigned(production - consumption)} ${unit}`.trim(),
              ]);
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
