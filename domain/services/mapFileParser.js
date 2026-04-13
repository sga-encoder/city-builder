import { Logger } from "../utilis/Logger.js";

export class MapFileParser {
  static VALID_TYPES = ["g", "r", "R", "C", "I", "S", "U", "P"];

  static parseMapFile(content) {
    if (!content || typeof content !== "string") {
      return { valid: false, error: "Archivo vacío o inválido" };
    }

    const lines = content.split("\n").map((line) => line.trim());
    const nonEmptyLines = lines.filter((line) => line.length > 0);

    if (nonEmptyLines.length === 0) {
      return { valid: false, error: "El archivo no contiene datos de mapa" };
    }

    const layout = [];
    let error = null;
    let errorRow = 0;

    for (let i = 0; i < nonEmptyLines.length; i++) {
      const line = nonEmptyLines[i];
      const row = this.parseLine(line);

      if (!row.valid) {
        error = row.error;
        errorRow = i + 1;
        break;
      }

      layout.push(row.data);
    }

    if (error) {
      return { valid: false, error, errorRow };
    }

    const sizeCheck = this.validateMapSize(layout);
    if (!sizeCheck.valid) {
      return { valid: false, error: sizeCheck.error };
    }

    return {
      valid: true,
      layout,
      size: layout.length,
      stats: this.calculateMapStats(layout),
    };
  }

  static parseLine(line) {
    if (!line || line.length === 0) {
      return { valid: false, error: "Línea vacía" };
    }

    // Formato recomendado: celdas separadas por espacios/tabulaciones.
    const tokenizedCells = line.split(/\s+/).filter(Boolean);
    if (tokenizedCells.length > 1) {
      for (let idx = 0; idx < tokenizedCells.length; idx++) {
        const tokenValidation = this.validateCellToken(tokenizedCells[idx]);
        if (!tokenValidation.valid) {
          return {
            valid: false,
            error: `Celda inválida '${tokenizedCells[idx]}' en columna ${idx + 1}`,
          };
        }
      }

      return { valid: true, data: tokenizedCells };
    }

    const cells = [];
    let i = 0;

    while (i < line.length) {
      const char = line[i];

      if (/\s/.test(char)) {
        i += 1;
        continue;
      }

      if (!this.VALID_TYPES.includes(char)) {
        return {
          valid: false,
          error: `Carácter inválido '${char}' en posición ${i + 1}`,
        };
      }

      let cellStr = char;

      if (char !== "g" && i + 1 < line.length && /[0-9]/.test(line[i + 1])) {
        cellStr += line[i + 1];
        i += 2;
      } else {
        i += 1;
      }

      cells.push(cellStr);
    }

    if (cells.length === 0) {
      return { valid: false, error: "Línea sin celdas válidas" };
    }

    return { valid: true, data: cells };
  }

  static validateCellToken(token) {
    if (!token || typeof token !== "string") {
      return { valid: false };
    }

    const type = token[0];
    const subtype = token.slice(1);

    if (!this.VALID_TYPES.includes(type)) {
      return { valid: false };
    }

    if ((type === "g" || type === "r") && subtype !== "") {
      return { valid: false };
    }

    if (type !== "g" && type !== "r" && !/^\d$/.test(subtype)) {
      return { valid: false };
    }

    return { valid: true };
  }

  static validateMapSize(layout) {
    if (layout.length < 15) {
      return {
        valid: false,
        error: `Mapa muy pequeño (${layout.length}x${layout.length}). Mínimo: 15x15`,
      };
    }

    if (layout.length > 30) {
      return {
        valid: false,
        error: `Mapa muy grande (${layout.length}x${layout.length}). Máximo: 30x30`,
      };
    }

    const expectedWidth = layout.length;
    for (let i = 0; i < layout.length; i++) {
      if (layout[i].length !== expectedWidth) {
        return {
          valid: false,
          error: `Fila ${i + 1} tiene ${layout[i].length} celdas, esperado ${expectedWidth}`,
        };
      }
    }

    return { valid: true };
  }

  static calculateMapStats(layout) {
    const stats = {
      totalCells: layout.length * layout.length,
      groundCells: 0,
      roadCells: 0,
      buildings: {},
    };

    const buildingCount = {};

    for (let row of layout) {
      for (let cell of row) {
        const type = cell[0];

        if (type === "g") {
          stats.groundCells += 1;
        } else if (type === "r") {
          stats.roadCells += 1;
        } else {
          const key = cell;
          buildingCount[key] = (buildingCount[key] || 0) + 1;
          stats.buildings[key] = buildingCount[key];
        }
      }
    }

    return stats;
  }

  static convertLayoutToGrid(layout, buildsConfig) {
    const grid = [];

    for (let i = 0; i < layout.length; i++) {
      const row = [];
      for (let j = 0; j < layout[i].length; j++) {
        const cellStr = layout[i][j];
        const type = cellStr[0];
        const subtype = cellStr.slice(1) || "";

        row.push({
          type,
          subtype,
          cellStr,
        });
      }
      grid.push(row);
    }

    return grid;
  }
}
