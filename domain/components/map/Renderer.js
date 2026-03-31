import { CellBuilder } from "./CellBuilder.js";
import { CssReloadObserverManager } from "../../utilis/CssManager/ObserverManager.js";
import { LayoutCalculator } from "./LayoutCalculator.js";
import { RehydrateService } from "./RehydrateService.js";

export class MapRenderer {
  static _cssReloadUnsubscribe = null;
  /**
   * Renderiza el mapa en el DOM y devuelve la grilla de instancias Building.
   * @param {object} params
   * @param {string}   params.containerSelector  Selector del contenedor (#map)
   * @param {string[][]} params.layout           Grilla con tipos de celda
   * @param {object}   params.svgModels          Modelos SVG cargados
   * @returns {{ grid: Building[][] }}
   */

  static buildMapContainer(container) {
    const mapEl = document.createElement("div");
    mapEl.classList.add("map");
    container.appendChild(mapEl);

    const mapContainer = document.createElement("div");
    mapContainer.classList.add("map-container");
    mapEl.appendChild(mapContainer);
    return mapContainer;
  }

    static buildGrid({ layout, width, height, svgModels, mapContainer, sheet }) {
    const grid = [];
    for (let i = 0; i < layout.length; i++) {
      const row = [];
      for (let j = 0; j < layout.length; j++) {
        const building = CellBuilder.build({
          i, j, width, height, layout, svgModels, mapContainer, sheet
        });
        row.push(building);
      }
      grid.push(row);
    }
    return grid;
  }

  static render({ containerSelector, layout, svgModels }) {
    const container = document.querySelector(containerSelector);
    const sheet = document.styleSheets[0];

    // ── Calcular tamaño de celdas ──────────────────────────────────────────
    const size = LayoutCalculator.calculateCellSize(container, layout);
    const { width, height } = size;
    LayoutCalculator.applyGlobalMapRules(sheet, layout, size);

    // ── Crear elemento raíz del mapa ──────────────────────────────────────
    const mapContainer = this.buildMapContainer(container);

    // ── Crear celdas ──────────────────────────────────────────────────────
    const grid = this.buildGrid({ layout, width, height, svgModels, mapContainer, sheet });

    return { grid };
  }

  // Métodos estáticos adicionales fuera de la clase
  static observeCSSReload(rehydrateFn) {
    if (typeof rehydrateFn !== "function") return;
    if (MapRenderer._cssReloadUnsubscribe) return;

    MapRenderer._cssReloadUnsubscribe = CssReloadObserverManager.addObserver(() => {
      rehydrateFn();
    });
  }

  static stopObserveCSSReload() {
    if (!MapRenderer._cssReloadUnsubscribe) return;
    MapRenderer._cssReloadUnsubscribe();
    MapRenderer._cssReloadUnsubscribe = null;
  }


  static rehydrateCSS({ containerSelector, layout }) {
    RehydrateService.rehydrateCSS({ containerSelector, layout });
  }
};
