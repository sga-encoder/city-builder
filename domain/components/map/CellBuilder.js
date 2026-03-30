import { createBuilding } from "../../../models/building/buildingFactory.js";
import { BuildingRenderer } from "../building/Renderer.js";
import { CssManagerRule } from "../../utilis/CssManager/RuleManager.js";

/**
 * Fábrica de celdas del mapa: crea la celda, su regla CSS y su elemento visual.
 */
export class CellBuilder {
    static getCellId(i, j) {
        return `${String(i).padStart(2, "0")}${String(j).padStart(2, "0")}`;
    }

    static getCellPosition(i, j, width, layoutLength) {
        const left = (i + j) * (width / 2);
        const top = (i - j) * (width / 4);
        const indexZ = layoutLength - j;
        return { left, top, indexZ };
    }
    static insertCellRule(sheet, id, i, j, left, top, width, height, indexZ) {
        CssManagerRule.insertCssRule(
            sheet,
            `#map-item-${id}`,
            `--i:${i}; --j:${j}; top:${top}px; left:${left}px; height:${height}px; width:${width}px; z-index:${indexZ};`
        );
    }

    static createBuildingInstance(id, i, j, layout, svgModels) {
        const type = layout[i][j][0];
        const subtype = layout[i][j][1] ?? "";
        const modelKey = subtype === "" ? type : `${type}.${subtype}`;
        const model = svgModels.getModel(modelKey);
        return createBuilding({ id, type, subtype, model });
    }

     static appendCellElement(id, building, mapContainer) {
        const col = document.createElement("div");
        col.classList.add("map-item");
        col.id = `map-item-${id}`;
        col.appendChild(BuildingRenderer.render(building));
        mapContainer.appendChild(col);
    }

    /**
     * Crea una celda del mapa, su regla CSS y su elemento visual.
     * @param {object} params - Parámetros de la celda.
     * @returns {Building} - Instancia lógica para la grilla.
     */
    static build({ i, j, width, height, layout, svgModels, mapContainer, sheet }) {
        // Calcula el ID único de la celda
        const id = this.getCellId(i, j);

        // Calcula la posición y el z-index de la celda
        const { left, top, indexZ } = this.getCellPosition(i, j, width, layout.length);

        // Inserta la regla CSS para la celda
        this.insertCellRule(sheet, id, i, j, left, top, width, height, indexZ);

        // Obtiene el tipo y subtipo de edificio
        const building = this.createBuildingInstance(id, i, j, layout, svgModels);


        // Crea la instancia lógica y el elemento visual
        this.appendCellElement(id, building, mapContainer);

        // Devuelve la instancia lógica para la grilla
        return building;
    }
}