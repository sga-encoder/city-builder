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

  static getIndustrySubtypeInfo(subtype) {
    const normalizedSubtype = String(subtype);
    const subtypeData = Building.getSubtypeData("I", normalizedSubtype);
    const isFactory = normalizedSubtype === "1";

    return {
      subtype: normalizedSubtype,
      key: `I${normalizedSubtype}`,
      typeIndustry: isFactory ? "Fabrica" : "Granja",
      capacity: subtypeData.capacity ?? (isFactory ? 15 : 8),
      cost: subtypeData.cost ?? (isFactory ? 5000 : 3000),
      energyUsage: subtypeData.energyUsage ?? (isFactory ? 20 : 0),
      waterUsage: subtypeData.waterUsage ?? (isFactory ? 15 : 10),
      benefit: subtypeData.benefit ?? (isFactory ? 800 : 50),
      outputType: isFactory ? "money" : "food",
    };
  }

  executeTurnLogic(city, StatsManager) {
    const subtypeInfo = IndustryBuilding.getIndustrySubtypeInfo(this.subtype);
    const energyUsage = Number(subtypeInfo.energyUsage || 0);
    const waterUsage = Number(subtypeInfo.waterUsage || 0);
    const baseBenefit = Number(subtypeInfo.benefit || 0);

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

    if (subtypeInfo.outputType === "money" && moneyResource && producedAmount > 0) {
      moneyResource.add(producedAmount);
      moneyResource.turnProduction =
        Number(moneyResource.turnProduction || 0) + producedAmount;
    }

    if (subtypeInfo.outputType === "food" && foodResource && producedAmount > 0) {
      foodResource.add(producedAmount);
      foodResource.turnProduction =
        Number(foodResource.turnProduction || 0) + producedAmount;
    }

    StatsManager.addStats(`I${this.subtype}`, {
      building: {
        amount: 1,
      },
      consumo: {
        energia: hasEnergy ? energyUsage : 0,
        agua: hasWater ? waterUsage : 0,
      },
      produccion: {
        dinero: subtypeInfo.outputType === "money" ? producedAmount : 0,
        alimentos: subtypeInfo.outputType === "food" ? producedAmount : 0,
      },
      empleos: {
        ofrecidos: Number(this.capacity || subtypeInfo.capacity || 0),
        ocupados: Number(this.citizens?.length || 0),
      },
      eficiencia: {
        porcentaje: Math.round(productionFactor * 100),
      },
    });
  }
}
