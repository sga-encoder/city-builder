import { Building } from "./Building.js";
import { loadGameplaySettings } from "../../domain/config/gameplaySettings.js";

export class ServicesBuilding extends Building {
  constructor(dict) {
    const { type, subtype } = dict;
    const subtypeData = Building.getSubtypeData(type, subtype);
    const instance = { ...subtypeData, ...dict };
    super(instance);
    this.benefit = instance.benefit;
    this.radius = instance.radius;
  }

  static getServiceSubtypeInfo(subtype) {
    const normalizedSubtype = String(subtype);
    const subtypeData = Building.getSubtypeData("S", normalizedSubtype);
    const isHospital = normalizedSubtype === "3";

    return {
      subtype: normalizedSubtype,
      key: `S${normalizedSubtype}`,
      typeService:
        normalizedSubtype === "1"
          ? "Policia"
          : normalizedSubtype === "2"
            ? "Bomberos"
            : "Hospital",
      energyUsage: subtypeData.energyUsage ?? (isHospital ? 30 : 10),
      waterUsage: subtypeData.waterUsage ?? (isHospital ? 10 : 0),
      benefit: subtypeData.benefit ?? 10,
      radius: subtypeData.radius ?? (isHospital ? 7 : 5),
    };
  }

  executeTurnLogic(city, StatsManager) {
    const subtypeInfo = ServicesBuilding.getServiceSubtypeInfo(this.subtype);
    const gameplaySettings = loadGameplaySettings();
    const energyUsage = Number(subtypeInfo.energyUsage || 0);
    const waterUsage = Number(subtypeInfo.waterUsage || 0);
    const benefit = Number(
      gameplaySettings?.serviceHappinessPerTurn ?? subtypeInfo.benefit ?? 0,
    );

    const energyResource = city?.resources?.energy;
    const waterResource = city?.resources?.water;

    const hasEnergy = !!energyResource && energyResource.canConsume(energyUsage);
    const needsWater = waterUsage > 0;
    const hasWater = !needsWater || (!!waterResource && waterResource.canConsume(waterUsage));
    const isOperational = hasEnergy && hasWater;

    if (isOperational && energyUsage > 0) {
      energyResource.subtract(energyUsage);
      energyResource.turnConsumption =
        Number(energyResource.turnConsumption || 0) + energyUsage;
    }

    if (isOperational && needsWater) {
      waterResource.subtract(waterUsage);
      waterResource.turnConsumption =
        Number(waterResource.turnConsumption || 0) + waterUsage;
    }

    city.activeServicesCount = Number(city.activeServicesCount || 0);
    city.activeServiceBonus = Number(city.activeServiceBonus || 0);

    if (isOperational) {
      city.activeServicesCount += 1;
      city.activeServiceBonus += benefit;
    }

    StatsManager.addStats(`S${this.subtype}`, {
      building: {
        amount: 1,
      },
      consumo: {
        energia: isOperational ? energyUsage : 0,
        agua: isOperational ? waterUsage : 0,
      },
      felicidad: {
        aporte: isOperational ? benefit : 0,
        activos: isOperational ? 1 : 0,
        radio: Number(subtypeInfo.radius || this.radius || 0),
      },
    });
  }
}
