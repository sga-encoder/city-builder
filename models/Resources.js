import{ Logger } from "../domain/utilis/Logger.js";

export class Resources {
  constructor(initialAmount, type, unit, consumed) {
    this.type = type;
    this.generatedAmount = 0;
    this.consumed = Boolean(consumed);
    this.unit = unit;
    this.amount = Number.isFinite(initialAmount) ? initialAmount : 0;
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
    const parsedValue = Number(value);
    if (!Number.isFinite(parsedValue) || parsedValue < 0) {
      Logger.warn("⚠️ [Resources] add() recibió valor inválido:", value);
      return this.amount;
    }

    Logger.log("💰 [Resources] Agregando", parsedValue, this.type, "(total:", this.amount + parsedValue + ")");
    this.amount += parsedValue;
    this.notifyObservers();
    return this.amount;
  }

  // Subtract resources
  subtract(value) {
    const parsedValue = Number(value);
    if (!Number.isFinite(parsedValue) || parsedValue < 0) {
      Logger.warn("⚠️ [Resources] subtract() recibió valor inválido:", value);
      return this.amount;
    }

    if (this.amount < parsedValue) {
      Logger.warn(
        "⚠️ [Resources] No hay suficiente",
        this.type,
        "para restar",
        parsedValue,
        "(disponible:",
        this.amount,
        ")",
      );
      return this.amount;
    }

    Logger.log("📉 [Resources] Restando", parsedValue, this.type, "(total:", this.amount - parsedValue + ")");
    this.amount -= parsedValue;
    this.notifyObservers();
    return this.amount;
  }

  // Set resource amount directly
  setAmount(value) {
    const parsedValue = Number(value);
    if (!Number.isFinite(parsedValue)) {
      Logger.warn("⚠️ [Resources] setAmount() recibió valor inválido:", value);
      return this.amount;
    }

    this.amount = Math.max(0, parsedValue);
    this.notifyObservers();
    return this.amount;
  }

  canConsume(value) {
    const parsedValue = Number(value);
    if (!Number.isFinite(parsedValue) || parsedValue < 0) {
      return false;
    }
    return this.amount >= parsedValue;
  }

  // applyDelta(delta) {
  //   const parsedDelta = Number(delta);
  //   if (!Number.isFinite(parsedDelta)) {
  //     Logger.warn("⚠️ [Resources] applyDelta() recibió valor inválido:", delta);
  //     return this.amount;
  //   }

  //   if (parsedDelta >= 0) {
  //     return this.add(parsedDelta);
  //   }

  //   return this.subtract(Math.abs(parsedDelta));
  // }

  // calculateAmount() {
  //   const generated = Number(this.generatedAmount);
  //   if (!Number.isFinite(generated) || generated < 0) {
  //     Logger.warn("⚠️ [Resources] generatedAmount inválido:", this.generatedAmount);
  //     return this.amount;
  //   }

  //   if (this.consumed) {
  //     return this.subtract(generated);
  //   }

  //   return this.add(generated);
  // }

  // static calculateAllAmount(energy, water, money, food) {
  //   if (!(energy instanceof Resources) || energy.type !== "energy") {
  //     return false;
  //   }
  //   if (!(water instanceof Resources) || water.type !== "water") {
  //     return false;
  //   }
  //   if (!(money instanceof Resources) || money.type !== "money") {
  //     return false;
  //   }
  //   if (!(food instanceof Resources) || food.type !== "food") {
  //     return false;
  //   }

  //   return (
  //     energy.calculateAmount() +
  //     water.calculateAmount() +
  //     money.calculateAmount() +
  //     food.calculateAmount()
  //   );
  // }
}