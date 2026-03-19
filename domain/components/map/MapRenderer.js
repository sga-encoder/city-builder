import { createBuilding } from "../../../models/building/buildingFactory.js";
import { BuildingRenderer } from "../building/BuildingRenderer.js";
export class MapRenderer {
  /**
   * Renderiza el mapa en el DOM y devuelve la grilla de instancias Building.
   * @param {object} params
   * @param {string}   params.containerSelector  Selector del contenedor (#map)
   * @param {string[][]} params.layout           Grilla con tipos de celda
   * @param {object}   params.svgModels          Modelos SVG cargados
   * @returns {{ grid: Building[][] }}
   */
  static render({ containerSelector, layout, svgModels }) {
    const container = document.querySelector(containerSelector);
    const sheet = document.styleSheets[0];

    // ── Calcular tamaño de celdas ──────────────────────────────────────────
    let rawWidth = container.offsetWidth / layout.length;
    let width = Math.max(20, Math.round(rawWidth / 20) * 20);
    let height = width * 0.6;
    const widthMap = width * layout.length;
    const heightMap = height * layout.length;

    // ── Insertar regla CSS global del mapa ────────────────────────────────
    const ruleMap = `.map{ --width-map:${widthMap}px; --height-map:${heightMap}px; --size:${layout.length}; }`;
    sheet.insertRule(ruleMap, sheet.cssRules.length);

    // ── Crear elemento raíz del mapa ──────────────────────────────────────
    const mapEl = document.createElement("div");
    mapEl.classList.add("map");
    container.appendChild(mapEl);

    const mapContainer = document.createElement("div");
    mapContainer.classList.add("map-container");
    mapEl.appendChild(mapContainer);

    // ── Crear celdas ──────────────────────────────────────────────────────
    const grid = [];

    for (let i = 0; i < layout.length; i++) {
      const row = [];
      for (let j = 0; j < layout.length; j++) {
        const id = `${String(i).padStart(2, "0")}${String(j).padStart(2, "0")}`;

        const left = (i + j) * (width / 2);
        const top = (i - j) * (width / 4);
        const indexZ = layout.length  - j ;

        const ruleCell = `#map-item-${id}{ --i:${i}; --j:${j}; --top:${top}px; --left:${left}px; --height:${height}px; --width:${width}px; --z-index:${indexZ}; }`;
        sheet.insertRule(ruleCell, sheet.cssRules.length);

        const type = layout[i][j][0];
        const subtype = layout[i][j][1] ?? "";
        const modelKey = subtype === "" ? type : `${type}.${subtype}`;
        const model = svgModels.getModel(modelKey);

        const building = createBuilding({ id, type, subtype, model });

        const col = document.createElement("div");
        col.classList.add("map-item");
        col.id = `map-item-${id}`;
        col.appendChild(BuildingRenderer.render(building));
        mapContainer.appendChild(col);

        row.push(building);
      }
      grid.push(row);
    }

    return { grid };
  }
}
