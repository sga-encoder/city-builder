class Building {
  static buildingConfig = null;

  static async initConfig() {
    if (!Building.buildingConfig) {
      Building.buildingConfig = await FileManager.loadJSON("../../config.json");
    }
    return Building.buildingConfig;
  }

  static getSubtypeData(type, subtype) {
    if (!Building.buildingConfig) {
      console.warn(
        "Building config not initialized. Call Building.initConfig() first.",
      );
      return {};
    }
    return Building.buildingConfig.builds?.[type]?.[subtype] || {};
  }

  constructor(dict) {
    const { id, type, subtype, cost, energyUsage, waterUsage } = dict;
    this.id = id;
    this.type = type;
    this.subtype = subtype;

    // Obtener datos de la configuración si no están en el diccionario
    const configData = Building.getSubtypeData(type, subtype);

    this.cost = cost ?? configData.cost;
    this.energyUsage = energyUsage ?? configData.energyUsage;
    this.waterUsage = waterUsage ?? configData.waterUsage;
  }

  static create(dict) {
    const { type } = dict;

    switch (type) {
      case "R":
        return new ResidentialBuilding(dict);
      case "C":
        return new CommercialBuilding(dict);
      case "I":
        return new IndustryBuilding(dict);
      case "S":
        return new ServicesBuilding(dict);
      case "U":
        return new UtilityPlants(dict);
      case "P":
        return new Park(dict);
      case "g":
      case "r":
      default:
        return new Building(dict);
    }
  }

  build() {
    const building = document.createElement("div");
    building.id = `building-${this.id}`;
    building.classList.add("g");
    if (this.type !== "g") {
      building.classList.add(`${this.type}${this.subtype}`);
    }
    return building;
  }
}
