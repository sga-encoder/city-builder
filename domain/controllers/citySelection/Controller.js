// =====================
// CITY SELECTION CONTROLLER
// =====================

import { CitySelectionRenderer } from "../../components/citySelection/Renderer.js";
import { LocalStorage } from "../../../database/localStorage.js";
import { Logger } from "../../utilis/Logger.js";

export class CitySelectionController {
  constructor() {
    this.renderer = null;
    this.onCitySelected = null;
    this.onNewGame = null;
  }

  // =====================
  // MOSTRAR PANTALLA DE SELECCIÓN
  // =====================
  show(onCitySelectedCallback, onNewGameCallback) {
    this.onCitySelected = onCitySelectedCallback;
    this.onNewGame = onNewGameCallback;

    const savedCities = CitySelectionController.getAllSavedCities();
    Logger.log("🏙️ [CitySelection] Ciudades guardadas encontradas:", savedCities.length);

    this.renderer = new CitySelectionRenderer();
    this.renderer.render(
      savedCities,
      (cityData) => this.handleCitySelection(cityData),
      () => this.handleNewGame(),
    );
  }

  // =====================
  // MANEJAR SELECCIÓN DE CIUDAD
  // =====================
  handleCitySelection(cityData) {
    // Si es una eliminación
    if (cityData.action === "delete") {
      CitySelectionController.deleteSavedCity(cityData.cityId);
      Logger.log("🗑️ [CitySelection] Ciudad eliminada:", cityData.cityId);
      
      // Volver a mostrar la pantalla de selección
      setTimeout(() => {
        this.show(this.onCitySelected, this.onNewGame);
      }, 300);
      return;
    }

    // Si es una carga de ciudad
    Logger.log("📂 [CitySelection] Cargando ciudad:", cityData.name);
    
    // Cargar datos en localStorage
    this.loadCityToStorage(cityData);

    if (this.onCitySelected) {
      this.onCitySelected(cityData);
    }
  }

  // =====================
  // MANEJAR NUEVA CIUDAD
  // =====================
  handleNewGame() {
    Logger.log("✨ [CitySelection] Creando nueva ciudad");
    if (this.onNewGame) {
      this.onNewGame();
    }
  }

  // =====================
  // CARGAR CIUDAD A LOCALSTORAGE
  // =====================
  loadCityToStorage(cityData) {
    try {
      // Cargar configuración de ciudad
      LocalStorage.saveData("cityConfig", JSON.stringify({
        id: cityData.id,
        name: cityData.name,
        mayor: cityData.mayor,
        location: cityData.location,
        mapSize: cityData.mapSize,
        createdAt: cityData.createdAt,
        updatedAt: new Date().toISOString(),
        turn: cityData.turn,
      }));

      // Cargar recursos
      LocalStorage.saveData("resources", JSON.stringify(cityData.initialResources || {
        money: 50000,
        energy: 0,
        water: 0,
        food: 0,
      }));

      // Cargar mapa
      LocalStorage.saveData("map", JSON.stringify(cityData.map?.layout || []));

      // Cargar turno
      LocalStorage.saveData("turn", JSON.stringify(cityData.turn || 0));

      // Cargar ciudadanos
      LocalStorage.saveData("citizens", JSON.stringify(cityData.citizens || []));

      // Cargar score
      LocalStorage.saveData("score", JSON.stringify(cityData.score || 0));

      Logger.log("💾 [CitySelection] Ciudad cargada en localStorage");
    } catch (error) {
      Logger.error("❌ [CitySelection] Error al cargar ciudad:", error);
    }
  }

  // =====================
  // OBTENER TODAS LAS CIUDADES GUARDADAS (ESTÁTICO)
  // =====================
  static getAllSavedCities() {
    try {
      const citiesRaw = LocalStorage.loadData("savedCities");
      if (citiesRaw) {
        return JSON.parse(citiesRaw);
      }
    } catch (error) {
      Logger.error("❌ [CitySelection] Error al cargar ciudades guardadas:", error);
    }
    return [];
  }

  // =====================
  // GUARDAR NUEVA CIUDAD A LA LISTA (ESTÁTICO)
  // =====================
  static saveCityToList(cityData) {
    try {
      const allCities = CitySelectionController.getAllSavedCities();
      
      // Verificar si la ciudad ya existe
      const existingIndex = allCities.findIndex(c => c.id === cityData.id);
      if (existingIndex !== -1) {
        allCities[existingIndex] = cityData;
      } else {
        allCities.push(cityData);
      }

      LocalStorage.saveData("savedCities", JSON.stringify(allCities));
      Logger.log("💾 [CitySelection] Ciudad guardada en lista:", cityData.name);
      return true;
    } catch (error) {
      Logger.error("❌ [CitySelection] Error al guardar ciudad en lista:", error);
      return false;
    }
  }

  // =====================
  // ELIMINAR CIUDAD GUARDADA (ESTÁTICO)
  // =====================
  static deleteSavedCity(cityId) {
    try {
      let allCities = CitySelectionController.getAllSavedCities();
      allCities = allCities.filter(c => c.id !== cityId);
      LocalStorage.saveData("savedCities", JSON.stringify(allCities));
      Logger.log("🗑️ [CitySelection] Ciudad eliminada:", cityId);
      return true;
    } catch (error) {
      Logger.error("❌ [CitySelection] Error al eliminar ciudad:", error);
      return false;
    }
  }

  // =====================
  // LIMPIAR TODAS LAS CIUDADES (ESTÁTICO)
  // =====================
  static clearAllCities() {
    try {
      LocalStorage.saveData("savedCities", JSON.stringify([]));
      Logger.log("🗑️ [CitySelection] Todas las ciudades eliminadas");
      return true;
    } catch (error) {
      Logger.error("❌ [CitySelection] Error al limpiar ciudades:", error);
      return false;
    }
  }

  // =====================
  // VERIFICAR SI HAY CIUDADES GUARDADAS (ESTÁTICO)
  // =====================
  static hasSavedCities() {
    const cities = CitySelectionController.getAllSavedCities();
    return cities && cities.length > 0;
  }
}
