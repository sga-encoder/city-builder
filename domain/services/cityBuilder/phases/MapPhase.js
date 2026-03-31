import { MapRenderer } from "../../../components/map/Renderer.js";

export class MapPhase {
  static buildRenderParams({ savedLayout, builds, createDefaultLayout }) {
    const layout = savedLayout || createDefaultLayout();
    return {
      containerSelector: "#map",
      layout,
      svgModels: builds,
    };
  }

  static execute({ savedLayout, builds, createDefaultLayout }) {
    const mapRenderParams = this.buildRenderParams({
      savedLayout,
      builds,
      createDefaultLayout,
    });

    const { grid } = MapRenderer.render(mapRenderParams);
    return { grid, mapRenderParams };
  }

  static setupCssRehydrate(getMapRenderParams) {
    MapRenderer.observeCSSReload(() => {
      const params = getMapRenderParams();
      if (params) {
        MapRenderer.rehydrateCSS(params);
      }
    });
  }
}
