import { MapCameraController } from "../../controllers/map/subControllers/CameraController.js";
import { CellBuilder } from "./CellBuilder.js";
import { LayoutCalculator } from "./LayoutCalculator.js";

export class RehydrateService {
  static rehydrateCellRules({ layout, width, height, sheet }) {
    for (let i = 0; i < layout.length; i++) {
      for (let j = 0; j < layout.length; j++) {
        const { left, top, indexZ } = CellBuilder.getCellPosition(i, j, width, layout.length);
        const id = CellBuilder.getCellId(i, j);
        CellBuilder.insertCellRule(sheet, id, i, j, left, top, width, height, indexZ);
      }
    }
  }

  static rehydrateCSS({ containerSelector, layout }) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const sheet = document.styleSheets[0];
    const size = LayoutCalculator.calculateCellSize(container, layout);
    const { width, height } = size;

    LayoutCalculator.applyGlobalMapRules(sheet, layout, size);
    this.rehydrateCellRules({ layout, width, height, sheet });

    MapCameraController.onStyleSheetReplaced(document.styleSheets[0]);
  }
}
