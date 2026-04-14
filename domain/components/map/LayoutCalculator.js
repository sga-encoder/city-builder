import { CssManagerRule } from "../../utilis/CssManager/RuleManager.js";

export class LayoutCalculator {
  static calculateCellSize(container, layout) {
    const rawWidth = container.offsetWidth / layout.length;
    const unit = Math.max(1, Math.round(rawWidth / 20));
    const width = unit * 20;
    const height = unit * 10;
    return { width, height };
  }

  static applyGlobalMapRules(sheet, layout, { width, height }) {
    const widthMap = width * layout.length;
    const heightMap = height * layout.length;

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
}