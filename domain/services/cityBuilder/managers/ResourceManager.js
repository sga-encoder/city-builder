import { LocalStorage } from "../../../../../database/localStorage.js";
import { Logger } from "../../../utilis/Logger.js";
import { CitySelectionController } from "../../../controllers/citySelection/Controller.js";

export class CityBuilderResourceManager {
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

    CitySelectionController.syncActiveCitySnapshot();
  }

  static registerObservers(city) {
    const save = () => CityBuilderResourceManager.saveResources(city);
    Object.values(city.resources).forEach((resource) => {
      resource.addObserver(save);
    });
    // Guardar recursos iniciales
    save();
  }
}
