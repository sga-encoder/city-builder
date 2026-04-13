import { Logger } from "../utilis/Logger.js";

export class MapResourceCalculator {
  static calculateInitialResources(layout, buildsConfig) {
    const resources = {
      money: 50000,
      energy: 0,
      water: 0,
      food: 0,
    };

    if (!layout || !buildsConfig) {
      Logger.warn("[MapResourceCalculator] Config inválida, retornando recursos por defecto");
      return resources;
    }

    for (let row of layout) {
      for (let cellStr of row) {
        const type = cellStr[0];
        const subtype = cellStr.slice(1) || "";

        if (type === "g" || type === "r") {
          continue;
        }

        const buildConfig = this.getBuildConfig(buildsConfig, type, subtype);
        if (!buildConfig) {
          Logger.warn(`[MapResourceCalculator] No se encontró config para ${cellStr}`);
          continue;
        }

        const production = Number(buildConfig.production) || 0;
        const productionType = buildConfig.productionType || "";

        // Sumar recursos basado en la producción de cada edificio
        if (productionType === "energy") {
          resources.energy += Math.max(100, production);
        } else if (productionType === "water") {
          resources.water += Math.max(50, production);
        } else if (productionType === "food") {
          resources.food += Math.max(50, production);
        }
      }
    }

    return resources;
  }

  static getBuildConfig(buildsConfig, type, subtype) {
    if (!buildsConfig || !buildsConfig[type]) {
      return null;
    }

    const subtypeKey = subtype || "";
    return buildsConfig[type][subtypeKey] || null;
  }
}
