// =====================
// CITY CREATION CONTROLLER
// =====================

import { CityCreationRenderer } from "../../components/cityCreation/Renderer.js";
import { CitySelectionController } from "../citySelection/Controller.js";
import { LocalStorage } from "../../../database/LocalStorage.js";
import { Logger } from "../../utilis/Logger.js";
import { MapResourceCalculator } from "../../services/mapResourceCalculator.js";
import { MapPersistenceService } from "../../services/mapPersistenceService.js";
import { FileManager } from "../../utilis/fileManager.js";

export class CityCreationController {
  constructor() {
    this.renderer = null;
    this.onCityCreated = null;
    this.onBackToMainMenu = null;
  }

  // =====================
  // MOSTRAR FORMULARIO
  // =====================
  show(onCityCreatedCallback, onBackToMainMenuCallback = null) {
    this.onCityCreated = onCityCreatedCallback;
    this.onBackToMainMenu = onBackToMainMenuCallback;
    this.renderer = new CityCreationRenderer();
    this.renderer.render(
      (formData) => this.handleCityCreation(formData),
      () => this.handleBackToMainMenu(),
    );
  }

  handleBackToMainMenu() {
    if (this.renderer) {
      this.renderer.destroy();
    }

    if (this.onBackToMainMenu) {
      this.onBackToMainMenu();
    }
  }

  // =====================
  // MANEJAR CREACIÓN DE CIUDAD
  // =====================
  async handleCityCreation(formData) {
    Logger.log("🏗️ [CityCreation] Creando ciudad con datos:", formData);

    try {
      this.renderer.disableForm(true);
      this.renderer.showSuccess("Creando ciudad...");

      // Cargar configuración
      const config = await FileManager.loadJSON("../../config.json");

      // Crear objeto ciudad con datos iniciales
      const cityData = this.createCityData(formData, config);

      // Guardar en localStorage
      this.saveCityData(cityData);
  // Guardar en lista de ciudades guardadas
  CitySelectionController.saveCityToList(cityData);


      // Esperar un poco para que el usuario vea el mensaje
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Destruir formulario
      if (this.renderer) {
        this.renderer.destroy();
      }

      // Llamar callback
      if (this.onCityCreated) {
        this.onCityCreated(cityData);
      }
    } catch (error) {
      Logger.error("❌ [CityCreation] Error al crear ciudad:", error);
      this.renderer.disableForm(false);
      this.renderer.showError(
        "Error al crear la ciudad. Intenta de nuevo.",
      );
    }
  }

  // =====================
  // CREAR OBJETO CIUDAD
  // =====================
  createCityData(formData, config) {
    // Determinar el layout del mapa
    let mapLayout = formData.mapLayout 
      ? formData.mapLayout 
      : this.createDefaultLayout(formData.mapSize);

    // Determinar el tamaño del mapa (usar tamaño del layout cargado si existe)
    const mapSize = formData.mapLayout ? formData.mapLayout.length : formData.mapSize;

    // Calcular recursos iniciales
    let initialResources = {
      money: 50000,
      energy: Number(formData?.initialResources?.energy ?? 0),
      water: Number(formData?.initialResources?.water ?? 0),
      food: Number(formData?.initialResources?.food ?? 0),
    };

    // Si se cargó un mapa, calcular recursos basado en los edificios
    if (formData.mapLayout && config?.builds) {
      const calculatedResources = MapResourceCalculator.calculateInitialResources(
        mapLayout,
        config.builds
      );
      
      // Usar recursos calculados + los recursos especificados manualmente
      initialResources.energy += calculatedResources.energy;
      initialResources.water += calculatedResources.water;
      initialResources.food += calculatedResources.food;
      
      Logger.log(
        "🗺️ [CityCreation] Recursos calculados del mapa:",
        calculatedResources
      );
    }

    const cityData = {
      id: `city_${Date.now()}`,
      name: formData.cityName,
      mayor: {
        name: formData.mayorName,
        joinDate: new Date().toISOString(),
      },
      location: {
        name: formData.region.name,
        latitude: formData.region.lat,
        longitude: formData.region.lon,
      },
      mapSize: mapSize,
      initialResources,
      map: {
        layout: mapLayout,
      },
      score: 0,
      turn: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    Logger.log("🏛️ [CityCreation] Ciudad creada:", cityData);
    return cityData;
  }

  // =====================
  // CREAR DISEÑO POR DEFECTO DEL MAPA
  // =====================
  createDefaultLayout(size) {
    return Array(size)
      .fill(null)
      .map(() => Array(size).fill("g"));
  }

  // =====================
  // GUARDAR DATOS DE CIUDAD EN LOCALSTORAGE
  // =====================
  saveCityData(cityData) {
    try {
      // Guardar configuración ciudad
      const cityConfig = {
        id: cityData.id,
        name: cityData.name,
        mayor: cityData.mayor,
        location: cityData.location,
        mapSize: cityData.mapSize,
        createdAt: cityData.createdAt,
        updatedAt: cityData.updatedAt,
        turn: cityData.turn,
      };

      LocalStorage.saveData("cityConfig", JSON.stringify(cityConfig));

      // Guardar recursos iniciales
      const resources = {
        money: cityData.initialResources.money,
        energy: cityData.initialResources.energy,
        water: cityData.initialResources.water,
        food: cityData.initialResources.food,
      };

      LocalStorage.saveData("resources", JSON.stringify(resources));

      // Guardar mapa usando MapPersistenceService
      MapPersistenceService.saveMapLayout(cityData.map.layout, {
        cityId: cityData.id,
        cityName: cityData.name,
      });

      // Guardar turno
      LocalStorage.saveData("turn", JSON.stringify(cityData.turn));

      // Guardar ciudadanos
      LocalStorage.saveData("citizens", JSON.stringify([]));

      // Guardar score
      LocalStorage.saveData("score", JSON.stringify(cityData.score));

      Logger.log("💾 [CityCreation] Datos guardados en localStorage");

      return true;
    } catch (error) {
      Logger.error("❌ [CityCreation] Error al guardar en localStorage:", error);
      throw error;
    }
  }

  // =====================
  // VERIFICAR SI EXISTE CIUDAD GUARDADA
  // =====================
  static hasSavedCity() {
    const cityConfig = LocalStorage.loadData("cityConfig");
    return cityConfig !== null && cityConfig !== undefined;
  }

  // =====================
  // CARGAR CIUDAD GUARDADA
  // =====================
  static loadSavedCity() {
    try {
      const cityConfig = LocalStorage.loadData("cityConfig");
      const resources = LocalStorage.loadData("resources");
      const map = LocalStorage.loadData("map");
      const turn = LocalStorage.loadData("turn");
      const citizens = LocalStorage.loadData("citizens");
      const score = LocalStorage.loadData("score");

      if (!cityConfig) {
        return null;
      }

      return {
        ...JSON.parse(cityConfig),
        initialResources: resources ? JSON.parse(resources) : {},
        map: {
          layout: map ? JSON.parse(map) : [],
        },
        turn: turn ? JSON.parse(turn) : 0,
        citizens: citizens ? JSON.parse(citizens) : [],
        score: score ? JSON.parse(score) : 0,
      };
    } catch (error) {
      Logger.error("❌ [CityCreation] Error al cargar ciudad guardada:", error);
      return null;
    }
  }

  // =====================
  // LIMPIAR CIUDAD GUARDADA
  // =====================
  static clearSavedCity() {
    try {
      LocalStorage.saveData("cityConfig", null);
      LocalStorage.saveData("resources", null);
      LocalStorage.saveData("map", null);
      LocalStorage.saveData("turn", null);
      LocalStorage.saveData("citizens", null);
      LocalStorage.saveData("score", null);

      Logger.log("🗑️ [CityCreation] Ciudad guardada eliminada");
      return true;
    } catch (error) {
      Logger.error("❌ [CityCreation] Error al limpiar ciudad guardada:", error);
      return false;
    }
  }
}
