class Building {


  static getSubtypeData(type, subtype) {
    if (!City.CityConfig) {
      console.warn(
        "Building config not initialized. Call Building.initConfig() first.",
      );
      return {};
    }
    return City.CityConfig.builds?.[type]?.[subtype] || {};
  }

  constructor(dict) {
    const { id, type, subtype, cost, energyUsage, waterUsage, model} = dict; 
    this.id = id;
    this.type = type;
    this.subtype = subtype;
    this.model = model;

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
    building.classList.add("building", `${this.type}${this.subtype}`);
    building.innerHTML = this.model;
    return building;
  }
}
