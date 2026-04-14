import { Map as CityMap } from "../../../../models/Map.js";
import { createBuilding } from "../../../../models/building/buildingFactory.js";
import { Logger } from "../../../utilis/Logger.js";
import { ToastService } from "../../../services/toast.js";
import { SaveManager } from "../../../services/cityBuilder/managers/SaveManager.js";
export class MapBuildController {

  static getBuildingToBuy(btnid) {
    const [selectedEntry] = CityMap.buildingInstanceMap(btnid);
    return selectedEntry?.[1] || null;
  }

  static syncRoadMatrixCell(mapModel, i, j, buildingType) {
    if (!mapModel?.roadMatrix?.[i]) return;
    mapModel.roadMatrix[i][j] = String(buildingType || "") === "r" ? 1 : 0;
  }

  static hasAdjacentRoad(grid, i, j) {
    const neighbors = [
      [i - 1, j],
      [i + 1, j],
      [i, j - 1],
      [i, j + 1],
      [i - 1, j - 1],
      [i - 1, j + 1],
      [i + 1, j - 1],
      [i + 1, j + 1],
    ];

    return neighbors.some(([ni, nj]) => grid?.[ni]?.[nj]?.type === "r");
  }

  static validateBuildPlacement({ btnid, cell, mapModel, city, buildingToBuy }) {
    if (!btnid || !cell || !mapModel || !city || !buildingToBuy) {
      return { ok: false, message: "No se puede construir: datos incompletos." };
    }

    if (buildingToBuy.requireEmptyCell && cell.cellData?.type !== "g") {
      return {
        ok: false,
        message: "No se puede construir: la celda no está vacía.",
      };
    }

    if (!city.canBuyBuilding(buildingToBuy)) {
      return {
        ok: false,
        message: `Fondos insuficientes: necesitas $${buildingToBuy.cost}.`,
      };
    }

    if (
      buildingToBuy.requiredRoad &&
      !this.hasAdjacentRoad(mapModel.grid, cell.i, cell.j)
    ) {
      return {
        ok: false,
        message: "No se puede construir: necesitas una vía adyacente.",
      };
    }
    return { ok: true, message: "OK" };
  }

  /**
   * Compra un edificio y lo coloca en la celda indicada.
   * @param {string} btnid - Id del botón/tipo de edificio.
   * @param {object} builds - Registro de modelos de edificios.
   * @param {object} cell - Celda destino.
   * @param {object} mapModel - Modelo del mapa.
   * @param {object} city - Modelo de ciudad.
   * @returns {object|boolean}
   */
  static buyBuildingCell(btnid, builds, cell, mapModel, city) {
    const buildingToBuy = this.getBuildingToBuy(btnid);

    if (!buildingToBuy) {
      Logger.warn("⚠️ [MapController] No se encontró building para", btnid);
      ToastService.mostrarToast("No se encontró el edificio seleccionado.", "error", 3000);
      return false;
    }

    const validation = this.validateBuildPlacement({
      btnid,
      cell,
      mapModel,
      city,
      buildingToBuy,
    });

    if (!validation.ok) {
      Logger.warn("⚠️ [MapController] Validación de construcción falló:", validation.message);
      ToastService.mostrarToast(validation.message, "error", 3000);
      return false;
    }

    if (!city.buyBuilding(buildingToBuy)) {
      Logger.warn(
        "⚠️ [MapController] No se pudo completar la compra para",
        btnid,
      );
      ToastService.mostrarToast("No hay dinero suficiente para construir.", "error", 3000);
      return false;
    }

    const result = this.replaceCellBuilding(btnid, builds, cell, mapModel);
    
    if (!result || result?.instance === null) {
      // Revertir descuento si no se pudo colocar en el mapa.
      city.resources.money.add(buildingToBuy.cost);
      Logger.warn(
        "⚠️ [MapController] No se pudo colocar el edificio en el mapa",
      );
      ToastService.mostrarToast("No se pudo colocar el edificio en el mapa.", "error", 3000);
      return false;
    }

    Logger.log("✅ [MapController] Edificio comprado y colocado en el mapa");
    ToastService.mostrarToast("Edificio comprado y colocado en el mapa", "success", 3000);
    
    // 💾 Guardar después de construir
    SaveManager.saveGame();
    
    return result;
  }

  /**
   * Compra y coloca un mismo edificio en múltiples celdas de una sola vez.
   * Se cobra solo una vez al confirmar por el total de celdas válidas.
   * @param {string} btnid - Id del botón/tipo de edificio.
   * @param {object} builds - Registro de modelos de edificios.
   * @param {object[]} cells - Celdas destino.
   * @param {object} mapModel - Modelo del mapa.
   * @param {object} city - Modelo de ciudad.
   * @returns {{ok: boolean, builtCount?: number, cost?: number, message?: string}}
   */
  static buyBuildingCellsBatch(btnid, builds, cells, mapModel, city) {
    const buildingToBuy = this.getBuildingToBuy(btnid);
    if (!buildingToBuy) {
      return { ok: false, message: "No se encontró el edificio seleccionado." };
    }

    if (!Array.isArray(cells) || cells.length === 0) {
      return { ok: false, message: "No hay celdas seleccionadas para construir." };
    }

    const invalidCell = cells.find((cell) =>
      !this.validateBuildPlacement({
        btnid,
        cell,
        mapModel,
        city,
        buildingToBuy: {
          ...buildingToBuy,
          cost: 0,
        },
      }).ok,
    );

    if (invalidCell) {
      return {
        ok: false,
        message: `No se puede construir en la celda ${invalidCell.id}.`,
      };
    }

    const totalCost = Number(buildingToBuy.cost || 0) * cells.length;
    if ((city?.resources?.money?.amount ?? 0) < totalCost) {
      return {
        ok: false,
        message: `Fondos insuficientes: necesitas $${totalCost}.`,
      };
    }

    city.resources.money.subtract(totalCost);

    let builtCount = 0;
    for (const cell of cells) {
      const result = this.replaceCellBuilding(btnid, builds, cell, mapModel);
      if (!result || result?.instance === null) {
        city.resources.money.add(totalCost);
        return {
          ok: false,
          message: "No se pudo colocar una o más vías en el mapa.",
        };
      }
      builtCount += 1;
    }

    // 💾 Guardar después de construcción en lote
    SaveManager.saveGame();

    return {
      ok: true,
      builtCount,
      cost: totalCost,
    };
  }

  /**
   * Reemplaza el contenido de una celda por un nuevo edificio.
   * @param {string} btnId - Id del botón/tipo de edificio.
   * @param {object} builds - Registro de modelos de edificios.
   * @param {object} cell - Celda destino.
   * @param {object} mapModel - Modelo del mapa.
   * @returns {{instance: object}|undefined}
   */
  static replaceCellBuilding(btnId, builds, cell, mapModel) {
    Logger.log("🏭 [MapController] changeBuild:", btnId, "en celda", cell.id);
    console.log("🏭 [MapController] changeBuild:", btnId, "en celda", cell.id);

    if (!mapModel) {
      Logger.error("❌ [MapController] No hay mapModel");
      return;
    }

    const [type, subtype] = [btnId[0], btnId[1]];
    const modelKey = subtype ? `${type}.${subtype}` : type;

    const building = createBuilding({
      id: cell.id,
      type,
      subtype,
      model: builds.getModel(modelKey),
    });

    // Asignar la instancia directamente (no copia plana)
    const updated = mapModel.setBuildingAt(cell.i, cell.j, building);
    if (!updated) {
      Logger.warn("⚠️ [MapController] No se pudo reemplazar celda ocupada", {
        i: cell.i,
        j: cell.j,
        requested: `${type}${subtype || ""}`,
      });
      return { instance: null };
    }

    // Regla explícita: carretera => 1, cualquier otro edificio => 0.
    this.syncRoadMatrixCell(mapModel, cell.i, cell.j, type);

    Logger.log("✅ [MapController] Edificio cambiado exitosamente");
    return building ;
  }

  /**
   * Mueve un edificio entre dos celdas del mapa.
   * @param {object} sourceCell - Celda origen.
   * @param {object} targetCell - Celda destino.
   * @param {object} builds - Registro de modelos de edificios.
   * @param {object} mapModel - Modelo del mapa.
   * @returns {boolean}
   */
  static moveBuildingCell(sourceCell, targetCell, builds, mapModel) {
    if (!mapModel || !sourceCell || !targetCell || !builds) return false;
    if (targetCell.cellData?.type !== "g") return false;

    const sourceType = mapModel.grid?.[sourceCell.i]?.[sourceCell.j]?.type;

    const moved = mapModel.moveBuilding(
      sourceCell.i,
      sourceCell.j,
      targetCell.i,
      targetCell.j,
      (sourceId) =>
        createBuilding({
          id: sourceId,
          type: "g",
          subtype: "",
          model: builds.getModel("g"),
        }),
    );

    if (!moved) return false;

    // Al mover: origen siempre 0. Destino 1 solo si lo movido era carretera.
    this.syncRoadMatrixCell(mapModel, sourceCell.i, sourceCell.j, "g");
    this.syncRoadMatrixCell(mapModel, targetCell.i, targetCell.j, sourceType);

    return true;
  }
}
