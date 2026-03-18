import { Building } from "./Building.js";

export class CommercialBuilding extends Building {
  constructor(dict) {
    const { type, subtype } = dict;
    const subtypeData = Building.getSubtypeData(type, subtype);
    const instance = { ...subtypeData, ...dict };
    super(instance);
    this.capacity = instance.capacity;
    this.income = instance.income;
    this.citizens = [];
  }

  executeTurnLogic(city, buildingData) {
  }
}
