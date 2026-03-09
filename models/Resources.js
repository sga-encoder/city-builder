class Resources {
  constructor(initialAmount, type, unit, consumed) {
    this.type = type;
    this.generatedAmount = 0;
    this.consumed = consumed;
    this.unit = unit;
    this.amount = initialAmount || 0;
    this.observers = [];
  }

  // Add observer callback to notify when amount changes
  addObserver(callback) {
    this.observers.push(callback);
  }

  // Remove observer
  removeObserver(callback) {
    this.observers = this.observers.filter((obs) => obs !== callback);
  }

  // Notify all observers of changes
  notifyObservers() {
    this.observers.forEach((callback) => callback(this.amount));
  }

  // Add resources
  add(value) {
    Logger.log("💰 [Resources] Agregando", value, this.type, "(total:", this.amount + value + ")");
    this.amount += value;
    this.notifyObservers();
    return this.amount;
  }

  // Subtract resources
  subtract(value) {
    Logger.log("📉 [Resources] Restando", value, this.type, "(total:", this.amount - value + ")");
    this.amount -= value;
    this.notifyObservers();
    return this.amount;
  }

  // Set resource amount directly
  setAmount(value) {
    this.amount = value;
    this.notifyObservers();
    return this.amount;
  }

  calculateAmount() {
    switch (this.consumed) {
      case false: //suma a los recursos
        this.amount += this.generatedAmount;
      case true: //resta a los recursos
        this.amount -= this.generatedAmount;
      default:
        print("Error: Invalid consumed value");

        return this.amount;
    }
  }

  static calculateAllAmount(energy, water, money, food) {
    if (energy instanceof Resources && energy.type !== "energy") {
      return false;
    }
    if (water instanceof Resources && water.type !== "water") {
      return false;
    }
    if (money instanceof Resources && money.type !== "money") {
      return false;
    }
    if (food instanceof Resources && food.type !== "food") {
      return false;
    }

    return (
      energy.calculateAmount() +
      water.calculateAmount() +
      money.calculateAmount() +
      food.calculateAmount()
    );
  }
}