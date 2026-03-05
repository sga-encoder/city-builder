class City {
  constructor(dict) {
    const { id, mayor, name, location, map, initialMoney, initialEnergy, initialWater, initialFood, score } = dict;
    this.id = id;
    this.mayor = mayor;
    this.name = name;
    this.location = location;
    this.map = new Map(map);
    this.resources = {
      money: new Resources(initialMoney, "money", [], []),
      energy: new Resources(initialEnergy, "energy", [], []),
      water: new Resources(initialWater, "water", [], []),
      food: new Resources(initialFood, "food", [], []),
    };
    this.score = score;
  }

  calculatePoints() {
    Resources.calculateAllAmount(this.resources.energy, this.resources.water, this.resources.money, this.resources.food);
  }
}


