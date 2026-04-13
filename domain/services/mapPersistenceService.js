import { Logger } from "../utilis/Logger.js";
import { LocalStorage } from "../../database/localStorage.js";

/**
 * Servicio para manejar persistencia de mapas en localStorage.
 * Simplifica guardar y cargar layouts de mapas.
 */
export class MapPersistenceService {
  /**
   * Guarda un layout de mapa en localStorage con metadata.
   * @param {string[][]} layout - Layout del mapa (string[][])
   * @param {object} metadata - Metadata del mapa {cityId, cityName, size, buildingCount}
   * @returns {boolean} true si se guardó exitosamente
   */
  static saveMapLayout(layout, metadata = {}) {
    try {
      if (!layout || !Array.isArray(layout)) {
        Logger.warn("[MapPersistence] Layout inválido");
        return false;
      }

      const mapData = {
        layout,
        metadata: {
          size: layout.length,
          timestamp: new Date().toISOString(),
          ...metadata,
        },
      };

      LocalStorage.saveData("map", JSON.stringify(layout));
      LocalStorage.saveData("mapMetadata", JSON.stringify(mapData.metadata));

      Logger.log(
        `[MapPersistence] Mapa guardado: ${layout.length}x${layout.length}`
      );
      return true;
    } catch (error) {
      Logger.error("[MapPersistence] Error guardando mapa:", error);
      return false;
    }
  }

  /**
   * Carga un layout de mapa desde localStorage.
   * @returns {object} {layout: string[][], metadata: object} o null si no existe
   */
  static loadMapLayout() {
    try {
      const mapRaw = LocalStorage.loadData("map");
      const metadataRaw = LocalStorage.loadData("mapMetadata");

      if (!mapRaw) {
        Logger.log("[MapPersistence] No hay mapa guardado");
        return null;
      }

      const layout = JSON.parse(mapRaw);
      const metadata = metadataRaw ? JSON.parse(metadataRaw) : {};

      if (!Array.isArray(layout)) {
        Logger.warn("[MapPersistence] Layout guardado no es un array");
        return null;
      }

      Logger.log(
        `[MapPersistence] Mapa cargado: ${layout.length}x${layout.length}`
      );
      return { layout, metadata };
    } catch (error) {
      Logger.error("[MapPersistence] Error cargando mapa:", error);
      return null;
    }
  }

  /**
   * Limpia el mapa guardado.
   * @returns {boolean}
   */
  static clearMapLayout() {
    try {
      LocalStorage.saveData("map", JSON.stringify([]));
      LocalStorage.saveData("mapMetadata", JSON.stringify({}));
      Logger.log("[MapPersistence] Mapa limpiado");
      return true;
    } catch (error) {
      Logger.error("[MapPersistence] Error limpiando mapa:", error);
      return false;
    }
  }

  /**
   * Obtiene información sobre el mapa guardado sin cargar todo el layout.
   * @returns {object} {hasMap: boolean, size: number, timestamp: string}
   */
  static getMapInfo() {
    try {
      const metadataRaw = LocalStorage.loadData("mapMetadata");
      if (!metadataRaw) {
        return { hasMap: false, size: 0, timestamp: null };
      }

      const metadata = JSON.parse(metadataRaw);
      return {
        hasMap: true,
        size: metadata.size || 0,
        timestamp: metadata.timestamp || null,
        cityName: metadata.cityName || "Desconocida",
      };
    } catch (error) {
      Logger.error("[MapPersistence] Error obteniendo info del mapa:", error);
      return { hasMap: false, size: 0, timestamp: null };
    }
  }
}
