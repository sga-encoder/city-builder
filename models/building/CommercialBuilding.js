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

  executeTurnLogic(city, StatsManager) {
    const energyUsage = this.energyUsage
    const income = Number(this.income || 0);

    const energyResource = city?.resources?.energy;
    const moneyResource = city?.resources?.money;

    const hasElectricity = !!energyResource && energyResource.canConsume(energyUsage);

    if (hasElectricity && energyUsage > 0) {
      energyResource.subtract(energyUsage);
      energyResource.turnConsumption =
        Number(energyResource.turnConsumption || 0) + energyUsage;
    }

    if (hasElectricity && moneyResource && income > 0) {
      moneyResource.add(income);
      moneyResource.turnProduction =
        Number(moneyResource.turnProduction || 0) + income;
    }

    StatsManager.addStats(`C${this.subtype}`, {
      building: {
        amount: 1,
      },
      consumption: {
        energy: energyUsage
      },
      production: {
        money: hasElectricity ? income : 0,
      },
      employment: {
        jobCapacity: this.capacity || 0,
        workers: this.citizens?.length || 0,
      }
    });
  }
}
