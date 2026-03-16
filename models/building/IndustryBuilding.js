import { Building } from "./Building.js";

export class IndustryBuilding extends Building {
  constructor(dict) {
    const { type, subtype } = dict;
    const subtypeData = Building.getSubtypeData(type, subtype);
    const instance = { ...subtypeData, ...dict };
    super(instance);
    this.capacity = instance.capacity;
    this.benefit = instance.benefit;
    this.citizens = [];
  }
}
