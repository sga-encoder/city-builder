/**
 * CityExportService
 * Servicio para exportar el estado completo de una ciudad a formato JSON
 * Compatible con HU-021: Exportar Estado de Ciudad a JSON
 */
import { FileManager } from "../../utilis/fileManager.js";
import { ToastService } from "../toast.js";
import { Logger } from "../../utilis/Logger.js";

export class CityExportService {
  /**
   * Exporta una ciudad a un archivo JSON
   * @param {City|Object} cityData - La instancia de ciudad o datos guardados a exportar
   * @returns {boolean} - true si la exportación fue exitosa
   */
  static exportCity(cityData) {
    try {
      if (!cityData || typeof cityData !== "object") {
        throw new Error("Ciudad no válida para exportar");
      }

      // Compilar datos de la ciudad
      const compiledData = this.#compileCityData(cityData);

      // Generar nombre del archivo
      const fileName = this.#generateFileName(cityData.name);

      // Guardar el archivo
      const success = FileManager.saveJSON(fileName, compiledData);

      if (success) {
        Logger.log("✅ [CityExportService] Ciudad exportada correctamente:", fileName);
        ToastService.mostrarToast(`✨ Ciudad "${cityData.name}" exportada correctamente`, "success");
      } else {
        throw new Error("Fallo al guardar el archivo");
      }

      return success;
    } catch (error) {
      Logger.error("❌ [CityExportService] Error exportando ciudad:", error);
      ToastService.mostrarToast(
        `Error al exportar: ${error.message}`,
        "error",
        4000
      );
      return false;
    }
  }

  /**
   * Compila todos los datos de la ciudad en el formato JSON especificado
   * Compatible con datos de City instance y datos guardados en localStorage
   * @private
   */
  static #compileCityData(cityData) {
    const isLiveCity = cityData.map && cityData.citizens !== undefined;
    
    return {
      // Información básica de la ciudad
      cityName: cityData.name || "Sin nombre",
      mayor: this.#getMayorName(cityData),
      
      // Información del mapa
      gridSize: this.#getGridSize(cityData.map || cityData.mapData),
      coordinates: this.#getCoordinates(cityData.location),
      
      // Estado del juego
      turn: cityData.turn || 0,
      score: cityData.score || 0,
      
      // Datos del mapa (disposición de terreno)
      map: isLiveCity ? this.#getMapLayoutFromLive(cityData.map) : this.#getMapLayout(cityData),
      
      // Edificios construidos
      buildings: isLiveCity ? this.#getBuildingsDataFromLive(cityData.map) : this.#getBuildingsData(cityData),
      
      // Carreteras
      roads: isLiveCity ? this.#getRoadsDataFromLive(cityData.map) : this.#getRoadsData(cityData),
      
      // Recursos
      resources: isLiveCity ? this.#getResourcesDataFromLive(cityData.resources) : this.#getResourcesData(cityData),
      
      // Ciudadanos
      citizens: isLiveCity ? this.#getCitizensDataFromLive(cityData.citizens) : this.#getCitizensData(cityData),
      population: isLiveCity ? (cityData.citizens?.length || 0) : (cityData.population || 0),
      
      // Estadísticas generales
      happiness: isLiveCity ? this.#getAverageHappinessFromLive(cityData.citizens) : this.#getAverageHappiness(cityData),
      
      // Metadatos
      exportedAt: new Date().toISOString(),
      version: "1.0",
    };
  }

  /**
   * Obtiene el nombre del alcalde
   * @private
   */
  static #getMayorName(cityData) {
    if (typeof cityData.mayor === "object" && cityData.mayor?.name) {
      return cityData.mayor.name;
    }
    return cityData.mayor || "Desconocido";
  }

  /**
   * Obtiene el tamaño de la grilla (versión Cidade viva)
   * @private
   */
  static #getGridSize(mapData) {
    if (!mapData) {
      return { width: 0, height: 0 };
    }

    // Si es una instancia viva
    if (mapData.grid && Array.isArray(mapData.grid)) {
      const height = mapData.grid.length;
      const width = height > 0 ? mapData.grid[0].length : 0;
      return { width, height };
    }

    // Si es datos guardados (mapData.width/height)
    return { width: mapData.width || 0, height: mapData.height || 0 };
  }

  /**
   * Obtiene las coordenadas de ubicación
   * @private
   */
  static #getCoordinates(location) {
    if (!location) {
      return { lat: 0, lon: 0, name: "Desconocida" };
    }

    return {
      lat: location.lat || location.latitude || 0,
      lon: location.lon || location.longitude || 0,
      name: location.name || "Desconocida",
    };
  }

  /**
   * Obtiene el layout del mapa desde una instancia viva
   * @private
   */
  static #getMapLayoutFromLive(map) {
    if (!map || !map.grid || !Array.isArray(map.grid)) {
      return [];
    }

    return map.grid.map((row) =>
      row.map((cell) => ({
        type: cell?.type || "ground",
        building: cell?.building?.id || null,
        buildingType: cell?.building?.type || null,
      }))
    );
  }

  /**
   * Obtiene el layout del mapa desde datos guardados
   * @private
   */
  static #getMapLayout(cityData) {
    if (cityData.mapData && Array.isArray(cityData.mapData)) {
      return cityData.mapData;
    }
    return [];
  }

  /**
   * Extrae información de edificios desde instancia viva
   * @private
   */
  static #getBuildingsDataFromLive(map) {
    if (!map || !map.buildings || !Array.isArray(map.buildings)) {
      return [];
    }

    return map.buildings.map((building) => ({
      id: building.id || null,
      type: building.type || null,
      subtype: building.subtype || null,
      position: {
        x: building.x || building.position?.x || 0,
        y: building.y || building.position?.y || 0,
      },
      health: building.health || 100,
      productivity: building.productivity || 1,
    }));
  }

  /**
   * Extrae información de edificios desde datos guardados
   * @private
   */
  static #getBuildingsData(cityData) {
    if (cityData.buildings && Array.isArray(cityData.buildings)) {
      return cityData.buildings;
    }
    return [];
  }

  /**
   * Extrae información de carreteras desde instancia viva
   * @private
   */
  static #getRoadsDataFromLive(map) {
    if (!map || !map.roads || !Array.isArray(map.roads)) {
      return [];
    }

    return map.roads.map((road) => ({
      id: road.id || null,
      position: {
        x: road.x || road.position?.x || 0,
        y: road.y || road.position?.y || 0,
      },
      type: road.type || "road",
    }));
  }

  /**
   * Extrae información de carreteras desde datos guardados
   * @private
   */
  static #getRoadsData(cityData) {
    if (cityData.roads && Array.isArray(cityData.roads)) {
      return cityData.roads;
    }
    return [];
  }

  /**
   * Obtiene información de recursos desde instancia viva
   * @private
   */
  static #getResourcesDataFromLive(resources) {
    if (!resources || typeof resources !== "object") {
      return {
        money: 0,
        energy: 0,
        water: 0,
        food: 0,
      };
    }

    return {
      money: resources.money?.amount || 0,
      energy: resources.energy?.amount || 0,
      water: resources.water?.amount || 0,
      food: resources.food?.amount || 0,
    };
  }

  /**
   * Obtiene información de recursos desde datos guardados
   * @private
   */
  static #getResourcesData(cityData) {
    if (cityData.resources) {
      return {
        money: cityData.resources.money || 0,
        energy: cityData.resources.energy || 0,
        water: cityData.resources.water || 0,
        food: cityData.resources.food || 0,
      };
    }
    return { money: 0, energy: 0, water: 0, food: 0 };
  }

  /**
   * Extrae información de ciudadanos desde instancia viva
   * @private
   */
  static #getCitizensDataFromLive(citizens) {
    if (!Array.isArray(citizens)) {
      return [];
    }

    return citizens.map((citizen) => ({
      id: citizen.id || null,
      name: citizen.name || "Ciudadano",
      age: citizen.age || 0,
      happiness: citizen.happiness || 50,
      job: citizen.job || null,
      home: citizen.home || null,
      employed: citizen.employed !== undefined ? citizen.employed : false,
    }));
  }

  /**
   * Extrae información de ciudadanos desde datos guardados
   * @private
   */
  static #getCitizensData(cityData) {
    if (cityData.citizens && Array.isArray(cityData.citizens)) {
      return cityData.citizens;
    }
    return [];
  }

  /**
   * Calcula la felicidad promedio desde instancia viva
   * @private
   */
  static #getAverageHappinessFromLive(citizens) {
    if (!Array.isArray(citizens) || citizens.length === 0) {
      return 0;
    }

    const totalHappiness = citizens.reduce(
      (sum, citizen) => sum + (citizen?.happiness || 0),
      0
    );

    return Math.round((totalHappiness / citizens.length) * 100) / 100;
  }

  /**
   * Calcula la felicidad promedio desde datos guardados
   * @private
   */
  static #getAverageHappiness(cityData) {
    return cityData.happiness || 0;
  }

  /**
   * Genera el nombre del archivo con patrón: ciudad_{nombre}_{fecha}.json
   * @private
   */
  static #generateFileName(cityName) {
    const sanitizedName = (cityName || "ciudad")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");

    const dateStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    return `ciudad_${sanitizedName}_${dateStr}.json`;
  }
}
