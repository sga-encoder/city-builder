import { Building } from "./Building.js";

export class Park extends Building {
  constructor(dict) {
    const { type, subtype } = dict;
    const subtypeData = Building.getSubtypeData(type, subtype);
    const instance = { ...subtypeData, ...dict };
    super(instance);
    this.benefit = instance.benefit;
  }
  executeTurnLogic(city, buildingData) {
  }
}
