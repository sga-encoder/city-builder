import { getBuildSubtypeConfig } from "../../domain/config/runtimeConfig.js";


export class Building {
  static getSubtypeData(type, subtype) {
    return getBuildSubtypeConfig(type, subtype);
  }

  constructor(dict) {
    const { id, type, subtype, cost, energyUsage, waterUsage, model } = dict;
    this.id = id;
    this.type = type;
    this.subtype = subtype;
    this.model = model;

    // Obtener datos de la configuración si no están en el diccionario
    const configData = Building.getSubtypeData(type, subtype);

    this.cost = cost ?? configData.cost;
    this.energyUsage = energyUsage ?? configData.energyUsage;
    this.waterUsage = waterUsage ?? configData.waterUsage;
  }

  build() {
    const building = document.createElement("div");
    building.id = `building-${this.id}`;
    building.classList.add("building", `${this.type}${this.subtype}`);
    building.innerHTML = this.model;
    return building;
  }

  // Nuevo - polimórfico, implementado en subclases
executeTurnLogic(city, buildingData) {
  // Subclasses implementan su propia lógica
  // Modifica resources, population, etc
}

// Helpers
getResourceConsumption(){}  // Retorna {energy, water}
getResourceProduction(){}   // Retorna {energy, water, food, money}
}
