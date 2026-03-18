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

  executeTurnLogic(city, StatsManager) {
    const energyUsage = Number(this.energyUsage || 0);
    const waterUsage = Number(this.waterUsage || 0);

    const energyResource = city?.resources?.energy;
    const waterResource = city?.resources?.water;

    const canConsumeEnergy =
      !!energyResource && energyResource.canConsume(energyUsage);
    const canConsumeWater =
      !!waterResource && waterResource.canConsume(waterUsage);

    if (canConsumeEnergy && energyUsage > 0) {
      energyResource.subtract(energyUsage);
    }

    if (canConsumeWater && waterUsage > 0) {
      waterResource.subtract(waterUsage);
    }

    StatsManager.addStats(
      `R${this.subtype}`,
      {
        building: {
          amount: 1,
        },
        consumo: {
          energia: canConsumeEnergy ? energyUsage : 0,
          agua: canConsumeWater ? waterUsage : 0,
        },
        ocupacion: {
          actual: this.citizens?.length || 0,
          max: this.capacity || 0,
        },
      },
    );
  }
}
