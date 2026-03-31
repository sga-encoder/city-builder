import { MapCameraController } from "../../controllers/map/CameraController.js";
import { CellBuilder } from "./CellBuilder.js";
import { CssManagerRule } from "../../utilis/CssManager/RuleManager.js";
import { CssReloadObserverManager } from "../../utilis/CssManager/ObserverManager.js";

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

  static calculateCellSize(container, layout) {
    let rawWidth = container.offsetWidth / layout.length;
    let width = Math.max(20, Math.round(rawWidth / 20) * 20);
    let height = width * 0.6;
    return { width, height };
  }

  static applyGlobalMapRules(sheet, layout, { width, height }) {

    const widthMap = width * layout.length;
    const heightMap = height * layout.length;

    // ── Usar CssRuleManager para la regla global del mapa ────────────────────────────────
    CssManagerRule.insertCssRule(
      sheet,
      ".map",
      `width:${widthMap}px; height:${heightMap}px; --size:${layout.length};`
    );

    CssManagerRule.insertCssRule(
      sheet,
      ".building",
      `width:${width}px; height:${width}px;`
    );
    
  }

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

  // Nuevo helper: rehydrateCellRules
  static rehydrateCellRules({ layout, width, height, sheet }) {
    for (let i = 0; i < layout.length; i++) {
      for (let j = 0; j < layout.length; j++) {
        const { left, top, indexZ } = CellBuilder.getCellPosition(i, j, width, layout.length);
        const id = CellBuilder.getCellId(i, j);
        CellBuilder.insertCellRule(sheet, id, i, j, left, top, width, height, indexZ);
      }
    }
  }

  static render({ containerSelector, layout, svgModels }) {
    const container = document.querySelector(containerSelector);
    const sheet = document.styleSheets[0];

    // ── Calcular tamaño de celdas ──────────────────────────────────────────
    const size = this.calculateCellSize(container, layout);
    const { width, height } = size;
    this.applyGlobalMapRules(sheet, layout, size);

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
    const container = document.querySelector(containerSelector);
    if (!container) return;
    const sheet = document.styleSheets[0];

    // 1. Calcular tamaño de celdas
    const size = this.calculateCellSize(container, layout);
    const { width, height } = size;

    // 2. Re-aplicar reglas globales
    this.applyGlobalMapRules(sheet, layout, size);

    // Re-inserta reglas de celdas
    this.rehydrateCellRules({ layout, width, height, sheet });

    // --- Hot reload CSS: reconectar MapCamera al nuevo stylesheet ---
    MapCameraController.onStyleSheetReplaced(document.styleSheets[0]);
  }
};
