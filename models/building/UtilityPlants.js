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
    return production;
  }

  executeTurnLogic(city, StatsManager) {
    const production = Number(this.production || 0);
    const energyResource = city?.resources?.energy;
    const waterResource = city?.resources?.water;

    if (this.subtype === "1") {
      if (energyResource && production > 0) {
        energyResource.add(production);
        energyResource.turnProduction =
          Number(energyResource.turnProduction || 0) + production;
      }

      StatsManager.addStats("U1", {
        building: { amount: 1 },
        consumo: { energia: 0 },
        produccion: { energia: production },
      });
      return;
    }

    if (this.subtype === "2") {
      const energyCost = 20;
      const canOperate = !!energyResource && energyResource.canConsume(energyCost);

      if (canOperate) {
        energyResource.subtract(energyCost);
        energyResource.turnConsumption =
          Number(energyResource.turnConsumption || 0) + energyCost;

        if (waterResource && production > 0) {
          waterResource.add(production);
          waterResource.turnProduction =
            Number(waterResource.turnProduction || 0) + production;
        }
      }

      StatsManager.addStats("U2", {
        building: { amount: 1 },
        consumo: { energia: canOperate ? energyCost : 0 },
        produccion: { agua: canOperate ? production : 0 },
      });
    }
  }
}
