import { Building } from "./Building.js";

export class Park extends Building {
  constructor(dict) {
    const { type, subtype } = dict;
    const subtypeData = Building.getSubtypeData(type, subtype);
    const instance = { ...subtypeData, ...dict };
    super(instance);
    this.benefit = instance.benefit;
  }

  executeTurnLogic(city, StatsManager) {
    const benefit = Number(this.benefit || 5);

    city.activeParkBonus = Number(city.activeParkBonus || 0);
    city.activeParksCount = Number(city.activeParksCount || 0);

    city.activeParkBonus += benefit;
    city.activeParksCount += 1;

    StatsManager.addStats(`P${this.subtype || "1"}`, {
      building: {
        amount: 1,
      },
      felicidad: {
        aporte: benefit,
      },
      consumo: {
        energia: 0,
        agua: 0,
      },
      empleo: {
        capacidad: 0,
      },
    });
  }
}
