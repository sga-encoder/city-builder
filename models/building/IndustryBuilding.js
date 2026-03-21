import { Building } from "./Building.js";

export class IndustryBuilding extends Building {
  constructor(dict) {
    const { type, subtype } = dict;
    const subtypeData = Building.getSubtypeData(type, subtype);
    const instance = { ...subtypeData, ...dict };
    super(instance);
    this.unit = instance.unit;
    this.productionType = instance.productionType;
    this.capacity = instance.capacity;
    this.production = instance.production;
    this.citizens = [];
  }

  executeTurnLogic(city, StatsManager) {
    const energyUsage = Number(this.energyUsage || 0);
    const waterUsage = Number(this.waterUsage || 0);
    const baseBenefit = Number(this.production || 0);

    const energyResource = city?.resources?.energy;
    const waterResource = city?.resources?.water;
    const moneyResource = city?.resources?.money;
    const foodResource = city?.resources?.food;

    const requiresEnergy = energyUsage > 0;
    const requiresWater = waterUsage > 0;

    const hasEnergy =
      !requiresEnergy ||
      (!!energyResource && energyResource.canConsume(energyUsage));
    const hasWater =
      !requiresWater ||
      (!!waterResource && waterResource.canConsume(waterUsage));

    if (hasEnergy && requiresEnergy) {
      energyResource.subtract(energyUsage);
      energyResource.turnConsumption =
        Number(energyResource.turnConsumption || 0) + energyUsage;
    }

    if (hasWater && requiresWater) {
      waterResource.subtract(waterUsage);
      waterResource.turnConsumption =
        Number(waterResource.turnConsumption || 0) + waterUsage;
    }

    const fullProduction = hasEnergy && hasWater;
    const productionFactor = fullProduction ? 1 : 0.5;
    const producedAmount = Math.round(baseBenefit * productionFactor);

    if (this.productionType === "money" && moneyResource && producedAmount > 0) {
      moneyResource.add(producedAmount);
      moneyResource.turnProduction =
        Number(moneyResource.turnProduction || 0) + producedAmount;
    }

    if (this.productionType === "food" && foodResource && producedAmount > 0) {
      foodResource.add(producedAmount);
      foodResource.turnProduction =
        Number(foodResource.turnProduction || 0) + producedAmount;
    }

    const production = {};
    if (this.productionType === "money") production.money = producedAmount;
    if (this.productionType === "food") production.food = producedAmount;
    StatsManager.addStats(`I${this.subtype}`, {
      building: {
        amount: 1,
      },
      consumption: {
        energy: hasEnergy ? energyUsage : 0,
        water: hasWater ? waterUsage : 0,
      },
      production,
      employment: {
        jobCapacity: this.capacity || 0,
        workers: Number(this.citizens?.length || 0),
      },
      efficiency: {
        percentage: Math.round(productionFactor * 100),
      },
    });
  }
}
