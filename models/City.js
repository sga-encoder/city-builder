import { Map as CityMap } from "./Map.js";
import { Resources } from "./Resources.js";
import { Logger } from "../domain/utilis/Logger.js";

export class City {
  constructor(dict) {
    Logger.log("🏛️ [City] Constructor llamado");
    const { id, mayor, name, location, map, initial, score, turn } = dict;
    this.id = id;
    this.mayor = mayor;
    this.name = name;
    this.location = location;
    Logger.log("🗺️ [City] Creando Map con layout:", map.layout?.length);
    this.map = new CityMap(map);
    Logger.log("✅ [City] Map creado, grid:", this.map?.grid?.length);
    this.resources = {
      money: new Resources(initial.money, "money", "$", []),
      energy: new Resources(initial.energy, "energy", "kWh", []),
      water: new Resources(initial.water, "water", "L", []),
      food: new Resources(initial.food, "food", "Kg", []),
    };
    this.citizens = [];
    this.citizenCounter = 0;
    this.score = score;
    if (turn !== undefined) {
      this.turn = turn;
    } else {
      this.turn = 0;
    }
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

  getTypeBuildings(type) {
    const grid = this.map?.grid;
    if (!Array.isArray(grid)) return [];

    return grid
      .flat()
      .filter((building) => building?.type === type);
  }

  // Observers para turnos
  // addTurnObserver(callback) {}
  // notifyTurnObservers(turnData) {}
}
