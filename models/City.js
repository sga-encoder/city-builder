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

  calculatePoints() {
    Resources.calculateAllAmount(
      this.resources.energy,
      this.resources.water,
      this.resources.money,
      this.resources.food,
    );
  }
}


