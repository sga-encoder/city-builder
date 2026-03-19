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

  static getCommercialSubtypeInfo(subtype) {
    const normalizedSubtype = String(subtype);
    const subtypeData = Building.getSubtypeData("C", normalizedSubtype);
    const isStore = normalizedSubtype === "1";

    return {
      subtype: normalizedSubtype,
      key: `C${normalizedSubtype}`,
      typeCommercial: isStore ? "Tienda" : "Centro Comercial",
      capacity: subtypeData.capacity ?? (isStore ? 6 : 20),
      cost: subtypeData.cost ?? (isStore ? 2000 : 8000),
      energyUsage: subtypeData.energyUsage ?? (isStore ? 8 : 25),
      income: subtypeData.income ?? (isStore ? 500 : 2000),
    };
  }

  executeTurnLogic(city, StatsManager) {
    const subtypeInfo = CommercialBuilding.getCommercialSubtypeInfo(this.subtype);
    const energyUsage = Number(subtypeInfo.energyUsage || 0);
    const income = Number(subtypeInfo.income || 0);

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
      consumo: {
        energia: hasElectricity ? energyUsage : 0,
      },
      produccion: {
        dinero: hasElectricity ? income : 0,
      },
      empleos: {
        ofrecidos: Number(this.capacity || subtypeInfo.capacity || 0),
        ocupados: Number(this.citizens?.length || 0),
      },
    });
  }
}
