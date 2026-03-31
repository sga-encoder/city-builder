import { SVGInjector } from "../../../utilis/SVGInjector.js";

export class AssetsPhase {
  static async execute({ data }) {
    const builds = await SVGInjector.create(data.builds);
    const icons = await SVGInjector.create(data.icons);
    return { builds, icons };
  }
}
