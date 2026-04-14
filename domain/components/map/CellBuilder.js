import { createBuilding } from "../../../models/building/buildingFactory.js";
import { BuildingRenderer } from "../building/Renderer.js";
import { CssManagerRule } from "../../utilis/CssManager/RuleManager.js";

/**
 * Fábrica de celdas del mapa: crea la celda, su regla CSS y su elemento visual.
 */
export class CellBuilder {
    static normalizeCellSize(width, height) {
        const unit = Math.max(1, Math.round(width / 20));
        const snappedWidth = unit * 20;
        const snappedHeight = height ?? unit * 10;
        return { width: snappedWidth, height: snappedHeight };
    }

    static getCellId(i, j) {
        return `${String(i).padStart(2, "0")}${String(j).padStart(2, "0")}`;
    }

    static getCellPosition(i, j, width, layoutLength) {
        const unit = Math.max(1, Math.round(width / 20));
        const stepX = 10 * unit;
        const stepY = 5 * unit;
        const left = (i + j) * stepX;
        const top  = (i - j) * stepY;
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
        const normalizedSize = this.normalizeCellSize(width, height);
        const normalizedWidth = normalizedSize.width;
        const normalizedHeight = normalizedSize.height;

        const id = this.getCellId(i, j);
        const { left, top, indexZ } = this.getCellPosition(i, j, normalizedWidth, layout.length);
        this.insertCellRule(sheet, id, i, j, left, top, normalizedWidth, normalizedHeight, indexZ);
        const building = this.createBuildingInstance(id, i, j, layout, svgModels);
        this.appendCellElement(id, building, mapContainer);
        return building;
    }
}