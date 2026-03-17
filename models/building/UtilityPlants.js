import { Building } from "./Building.js";

export class UtilityPlants extends Building {
  constructor(dict) {
    const { type, subtype } = dict;
    const subtypeData = Building.getSubtypeData(type, subtype);
    const instance = { ...subtypeData, ...dict };
    super(instance);
    this.production = instance.production;
  }

  generation(production) {
    // TODO: Implement production generation logic
    return production;
  }

  executeTurnLogic(city, buildingData) {
    // 1. Consumir energía
    // 2. Producir comida
    // 3. Generar ingresos
    // 4. Registrar en buildingData
  }
}
