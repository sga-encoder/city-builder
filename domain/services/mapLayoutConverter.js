import { Logger } from "../utilis/Logger.js";
import { createBuilding } from "../../models/building/buildingFactory.js";

/**
 * Servicio para convertir layouts de mapa (string[][]) a instancias de Building.
 * Facilita la creación de objetos Building a partir de un layout cargado.
 */
export class MapLayoutConverter {
  /**
   * Convierte un layout de strings a una grilla de Building objects.
   * @param {string[][]} layout - Grilla con notación de celdas (p.ej., [["g", "R1"], ...])
   * @param {object} buildsConfig - Configuración de construcciones desde config.json
   * @param {object} svgModels - Cargador de modelos SVG
   * @returns {object[][]} Grilla de Building objects
   */
  static layoutToBuildingGrid(layout, buildsConfig, svgModels) {
    if (!layout || !Array.isArray(layout) || layout.length === 0) {
      Logger.warn("[MapLayoutConverter] Layout inválido");
      return [];
    }

    const grid = [];
    const size = layout.length;

    for (let i = 0; i < size; i++) {
      const row = [];
      for (let j = 0; j < layout[i].length; j++) {
        const cellStr = layout[i][j];
        const building = this.cellToBuilding(cellStr, i, j, buildsConfig, svgModels);
        row.push(building);
      }
      grid.push(row);
    }

    Logger.log(`[MapLayoutConverter] Grilla convertida: ${size}x${size}`);
    return grid;
  }

  /**
   * Convierte una celda individual (string) a un objeto Building.
   * @param {string} cellStr - Notación de celda (p.ej., "R1", "C2", "g")
   * @param {number} i - Fila
   * @param {number} j - Columna
   * @param {object} buildsConfig - Configuración de construcciones
   * @param {object} svgModels - Cargador de modelos SVG
   * @returns {object} Building object o ground si es inválido
   */
  static cellToBuilding(cellStr, i, j, buildsConfig, svgModels) {
    if (!cellStr || typeof cellStr !== "string") {
      return this.createGroundBuilding(i, j);
    }

    const type = cellStr[0];
    const subtype = cellStr.slice(1) || "";
    const cellId = `${String(i).padStart(2, "0")}${String(j).padStart(2, "0")}`;

    // Validar que el tipo existe en configuración
    if (!buildsConfig || !buildsConfig[type]) {
      Logger.warn(`[MapLayoutConverter] Tipo de construcción desconocido: ${cellStr}`);
      return this.createGroundBuilding(i, j);
    }

    // Obtener modelo SVG
    const modelKey = subtype === "" ? type : `${type}.${subtype}`;
    const model = svgModels?.getModel?.(modelKey) || null;

    // Crear instancia del edificio
    try {
      const building = createBuilding({ id: cellId, type, subtype, model });
      return building;
    } catch (error) {
      Logger.error(`[MapLayoutConverter] Error creando Building ${cellStr}:`, error);
      return this.createGroundBuilding(i, j);
    }
  }

  /**
   * Crea un Building de terreno (ground).
   * @param {number} i - Fila
   * @param {number} j - Columna
   * @returns {object} Building de terreno
   */
  static createGroundBuilding(i, j) {
    const cellId = `${String(i).padStart(2, "0")}${String(j).padStart(2, "0")}`;
    return createBuilding({ id: cellId, type: "g", subtype: "", model: null });
  }

  /**
   * Valida que el layout sea compatible con la configuración de construcciones.
   * @param {string[][]} layout - Layout a validar
   * @param {object} buildsConfig - Configuración de construcciones
   * @returns {object} {valid: boolean, errors: string[]}
   */
  static validateLayoutAgainstConfig(layout, buildsConfig) {
    const errors = [];

    if (!layout || !Array.isArray(layout)) {
      return { valid: false, errors: ["Layout inválido o no es un array"] };
    }

    for (let i = 0; i < layout.length; i++) {
      for (let j = 0; j < layout[i].length; j++) {
        const cellStr = layout[i][j];
        if (!cellStr || typeof cellStr !== "string") {
          errors.push(`Celda [${i},${j}] no es un string válido`);
          continue;
        }

        const type = cellStr[0];
        if (!buildsConfig?.[type]) {
          errors.push(`Celda [${i},${j}]: tipo "${type}" desconocido`);
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Serializa una grilla de Buildings a layout string para almacenamiento.
   * @param {object[][]} grid - Grilla de Building objects
   * @returns {string[][]} Layout serializado
   */
  static gridToLayout(grid) {
    if (!grid || !Array.isArray(grid)) {
      return [];
    }

    return grid.map((row) =>
      row.map((building) => {
        if (!building) return "g";
        const type = building.type || "g";
        const subtype = building.subtype || "";
        return `${type}${subtype}`;
      }),
    );
  }
}
