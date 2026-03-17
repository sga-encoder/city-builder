import { Building } from "./Building.js";
/**
 * Representa un edificio residencial en la ciudad.
 * Define costos, capacidad y consumo de recursos según el subtipo.
 *
 * @class ResidentialBuilding
 * @extends Building
 *
 * @param {Object} dict - Datos del edificio residencial
 * @param {string} dict.id - Identificador único del edificio
 * @param {string} dict.type - Tipo de edificio ('R')
 * @param {number} dict.subtype - Subtipo de vivienda (1 o 2) *
 *
 * @example
 * const house = new ResidentialBuilding({
 *   id: '00',
 *   type: 'R',
 *   subtype: 1
 * });
 */
export class ResidentialBuilding extends Building {
  constructor(dict) {
    const { type, subtype } = dict;
    const subtypeData = Building.getSubtypeData(type, subtype);
    const instance = { ...subtypeData, ...dict };
    super(instance);
    this.capacity = instance.capacity;
    this.citizens = [];
  }

  static getResidentialSubtypeInfo(subtype) {
    const normalizedSubtype = String(subtype);
    const subtypeData = Building.getSubtypeData("R", normalizedSubtype);
    const isHouse = normalizedSubtype === "1";
    return {
      subtype: normalizedSubtype,
      key: `R${normalizedSubtype}`,
      typeResidential: isHouse ? "Casa" : "Apartamento",
      capacity: subtypeData.capacity ?? (isHouse ? 4 : 12),
      cost: subtypeData.cost ?? (isHouse ? 1000 : 3000),
      energyUsage: subtypeData.energyUsage ?? 0,
      waterUsage: subtypeData.waterUsage ?? 0,
    };
  }

  executeTurnLogic(city, buildingData = {}) {
    const energyUsage = Number(this.energyUsage || 0);
    const waterUsage = Number(this.waterUsage || 0);

    const energyResource = city?.resources?.energy;
    const waterResource = city?.resources?.water;

    const canConsumeEnergy =
      !!energyResource &&
      typeof energyResource.canConsume === "function" &&
      energyResource.canConsume(energyUsage);
    const canConsumeWater =
      !!waterResource &&
      typeof waterResource.canConsume === "function" &&
      waterResource.canConsume(waterUsage);

    if (canConsumeEnergy && energyUsage > 0) {
      energyResource.consume(energyUsage);
    }

    if (canConsumeWater && waterUsage > 0) {
      waterResource.consume(waterUsage);
    }

    if (canConsumeEnergy) {
      buildingData.totalEnergyConsumed =
        Number(buildingData.totalEnergyConsumed || 0) + energyUsage;
    } else {
      buildingData.energyShortageBuildings =
        Number(buildingData.energyShortageBuildings || 0) + 1;
    }

    if (canConsumeWater) {
      buildingData.totalWaterConsumed =
        Number(buildingData.totalWaterConsumed || 0) + waterUsage;
    } else {
      buildingData.waterShortageBuildings =
        Number(buildingData.waterShortageBuildings || 0) + 1;
    }

    return {
      id: this.id,
      type: this.type,
      subtype: this.subtype,
      energyUsage,
      waterUsage,
      energyConsumed: canConsumeEnergy ? energyUsage : 0,
      waterConsumed: canConsumeWater ? waterUsage : 0,
      hasEnergyShortage: !canConsumeEnergy,
      hasWaterShortage: !canConsumeWater,
    };
  }
}
