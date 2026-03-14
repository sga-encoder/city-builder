class City {
  constructor(dict) {
    Logger.log("🏛️ [City] Constructor llamado");
    const { id, mayor, name, location, map, initial, score } = dict;
    this.id = id;
    this.mayor = mayor;
    this.name = name;
    this.location = location;
    Logger.log("🗺️ [City] Creando Map con layout:", map.layout?.length);
    this.map = new Map(map);
    Logger.log("✅ [City] Map creado, grid:", this.map?.grid?.length);
    this.resources = {
      money: new Resources(initial.money, "money", "$", []),
      energy: new Resources(initial.energy, "energy", "kWh", []),
      water: new Resources(initial.water, "water", "L", []),
      food: new Resources(initial.food, "food", "Kg", []),
    };
    this.score = score;
  }

  canBuyBuilding(building) {
    if (!building || typeof building.cost !== "number") {
      Logger.warn("⚠️ [City] building inválido en canBuyBuilding:", building);
      return false;
    }
    const cost = building.cost;
    const moneyAmount = this.resources.money.amount;
    return moneyAmount >= cost;
  }

  buyBuilding(building) {
    if (!building || typeof building.cost !== "number") {
      Logger.warn("⚠️ [City] building inválido en buyBuilding:", building);
      return false;
    }
    const cost = building.cost;
    const moneyAmount = this.resources.money.amount;

    if (this.canBuyBuilding(building)) {
      this.resources.money.subtract(cost);
      Logger.log(
        "🏗️ [City] Edificio comprado por",
        cost,
        "dinero restante:",
        this.resources.money.amount,
      );
      return true;
    } else {
      Logger.warn(
        "⚠️ [City] No hay suficiente dinero para comprar el edificio. Costo:",
        cost,
        "dinero disponible:",
        moneyAmount,
      );
      return false;
    }
  }

  calculatePoints() {
    Resources.calculateAllAmount(
      this.resources.energy,
      this.resources.water,
      this.resources.money,
      this.resources.food,
    );
  }
}


