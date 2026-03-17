import { LocalStorage } from "../../../database/LocalStorage.js";
import { Logger } from "../utilis/Logger.js";

export class ResourceManager {
  static getSavedResources() {
    const raw = LocalStorage.loadData("resources");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      Logger.warn("Error al parsear recursos guardados");
      return null;
    }
  }

  static saveResources(city) {
    LocalStorage.saveData(
      "resources",
      JSON.stringify({
        money: city.resources.money.amount,
        energy: city.resources.energy.amount,
        water: city.resources.water.amount,
        food: city.resources.food.amount,
      }),
    );
  }

  static registerObservers(city) {
    const save = () => ResourceManager.saveResources(city);
    Object.values(city.resources).forEach((resource) => {
      resource.addObserver(save);
    });
    // Guardar recursos iniciales
    save();
  }
}
