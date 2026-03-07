class City {
  static CityConfig = null;

  static async initConfig() {
    if (!City.CityConfig) {
      City.CityConfig = await FileManager.loadJSON("../../config.json");
    }
    return City.CityConfig;
  }
  constructor(dict) {
    const {
      id,
      mayor,
      name,
      location,
      map,
      initial,
      score,
    } = dict;
    this.id = id;
    this.mayor = mayor;
    this.name = name;
    this.location = location;
    this.map = new Map(map);
    this.resources = {
      money: new Resources(initial.money, "money", [], []),
      energy: new Resources(initial.energy, "energy", [], []),
      water: new Resources(initial.water, "water", [], []),
      food: new Resources(initial.food, "food", [], []),
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


