import { CssManagerRule } from "../../utilis/CssManager/RuleManager.js";

export class LayoutCalculator {
  static calculateCellSize(container, layout) {
    const rawWidth = container.offsetWidth / layout.length;
    const width = Math.max(20, Math.round(rawWidth / 20) * 20);
    const height = width * 0.6;
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
