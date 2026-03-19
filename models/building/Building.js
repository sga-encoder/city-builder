import { getBuildSubtypeConfig } from "../../domain/config/runtimeConfig.js";


export class Building {
  static getSubtypeData(type, subtype) {
    return getBuildSubtypeConfig(type, subtype);
  }

  constructor(dict) {
    const { id, type, subtype, model, cost, energyUsage, waterUsage, requiredRoad, requireEmptyCell, name } = dict;
    this.id = id;
    this.type = type;
    this.subtype = subtype;
    this.model = model;

    // Obtener datos de la configuración si no están en el diccionario
    const configData = Building.getSubtypeData(type, subtype);
    this.name = name ?? configData.name;
    this.cost = cost ?? configData.cost;
    this.energyUsage = energyUsage ?? configData.energyUsage;
    this.waterUsage = waterUsage ?? configData.waterUsage;
    this.requiredRoad = requiredRoad ?? configData.requiredRoad;
    this.requireEmptyCell = requireEmptyCell ?? configData.requireEmptyCell;

  }


// eslint-disable-next-line no-unused-vars
executeTurnLogic(city, buildingData) {
  // Subclasses implementan su propia lógica
  // Modifica resources, population, etc
}

// Helpers
getResourceConsumption(){}  // Retorna {energy, water}
getResourceProduction(){}   // Retorna {energy, water, food, money}
}
