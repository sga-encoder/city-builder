import { Building } from "./Building.js";
import { MapController } from "../../domain/controllers/MapController.js";
/**
 * Representa un edificio residencial en la ciudad.
 * Define costos, capacidad y consumo de recursos según el subtipo.
 *
 * @class ResidentialBuilding
 * @extends Building
 *
 * @param {Object} dict - Datos del edificio residencial
 * @param {string} dict.id - Identificador único del edificio
 * @param {string} dict.type - Tipo de edificio ('R')
 * @param {number} dict.subtype - Subtipo de vivienda (1 o 2) *
 *
 * @example
 * const house = new ResidentialBuilding({
 *   id: '00',
 *   type: 'R',
 *   subtype: 1
 * });
 */
export class ResidentialBuilding extends Building {
  static pendingBuildSubtype = null;
  static pendingBuilds = null;
  static isPlacingFromPendingMode = false;
  static hooksInstalled = false;

  constructor(dict) {
    const { type, subtype } = dict;
    const subtypeData = Building.getSubtypeData(type, subtype);
    const instance = { ...subtypeData, ...dict };
    super(instance);
    this.capacity = instance.capacity;
    this.citizens = [];
  }

  static getResidentialSubtypeInfo(subtype) {
    const normalizedSubtype = String(subtype);
    const subtypeData = Building.getSubtypeData("R", normalizedSubtype);
    const isHouse = normalizedSubtype === "1";
    return {
      subtype: normalizedSubtype,
      key: `R${normalizedSubtype}`,
      typeResidential: isHouse ? "Casa" : "Apartamento",
      capacity: subtypeData.capacity ?? (isHouse ? 4 : 12),
      cost: subtypeData.cost ?? (isHouse ? 1000 : 3000),
      energyUsage: subtypeData.energyUsage ?? 0,
      waterUsage: subtypeData.waterUsage ?? 0,
    };
  }

  static isResidentialSelection(buildId) {
    return buildId === "R1" || buildId === "R2";
  }

  static getCellCoordinatesById(cellId) {
    if (typeof cellId !== "string" || cellId.length < 4) {
      return null;
    }

    const mid = Math.floor(cellId.length / 2);
    const i = Number(cellId.slice(0, mid));
    const j = Number(cellId.slice(mid));

    if (Number.isNaN(i) || Number.isNaN(j)) {
      return null;
    }

    return { i, j };
  }

  static hasAdjacentRoad(grid, i, j) {
    const neighbors = [
      [i - 1, j],
      [i + 1, j],
      [i, j - 1],
      [i, j + 1],
    ];

    return neighbors.some(([ni, nj]) => {
      const neighbor = grid?.[ni]?.[nj];
      return neighbor?.type === "r";
    });
  }

  static validatePlacement(cell, city) {
    const grid = MapController?.buildingGrid;
    if (!grid) {
      return {
        ok: false,
        message: "Error: mapa no disponible para construir.",
      };
    }

    if (!cell || !cell.cellData) {
      return { ok: false, message: "Error: celda invalida." };
    }

    if (cell.cellData.type !== "g") {
      return {
        ok: false,
        message: "No se puede construir: la celda ya tiene un edificio.",
      };
    }

    if (!this.hasAdjacentRoad(grid, cell.i, cell.j)) {
      return {
        ok: false,
        message: "No se puede construir: necesitas una via adyacente.",
      };
    }

    const subtypeInfo = this.getResidentialSubtypeInfo(
      this.pendingBuildSubtype,
    );

    const money = city?.resources?.money?.amount ?? 0;

    if (money < subtypeInfo.cost) {
      return {
        ok: false,
        message: `Fondos insuficientes: necesitas $${subtypeInfo.cost}.`,
      };
    }

    return { ok: true, message: "OK" };
  }

  static countResidentialBuildings() {
    const grid = MapController?.buildingGrid || [];
    let count = 0;

    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        if (grid[i][j]?.type === "R") {
          count += 1;
        }
      }
    }

    return count;
  }

  static ensureToastContainer() {
    let container = document.querySelector("#residential-toast-container");
    if (container) return container;

    container = document.createElement("div");
    container.id = "residential-toast-container";
    container.style.position = "fixed";
    container.style.right = "16px";
    container.style.bottom = "16px";
    container.style.zIndex = "9999";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "8px";
    container.style.pointerEvents = "none";
    document.body.appendChild(container);
    return container;
  }

  static notify(message, type = "info") {
    const container = this.ensureToastContainer();
    const toast = document.createElement("div");

    const bgByType = {
      success: "#1f7a1f",
      error: "#9b1c1c",
      info: "#1f4f8a",
      warning: "#8a5f1f",
    };

    toast.textContent = message;
    toast.style.background = bgByType[type] || bgByType.info;
    toast.style.color = "#fff";
    toast.style.padding = "10px 12px";
    toast.style.borderRadius = "8px";
    toast.style.fontSize = "13px";
    toast.style.maxWidth = "320px";
    toast.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.25)";
    toast.style.opacity = "0";
    toast.style.transform = "translateY(8px)";
    toast.style.transition = "opacity 180ms ease, transform 180ms ease";

    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
    });

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(8px)";
      setTimeout(() => toast.remove(), 200);
    }, 2600);
  }

  static applyBuildCursor(enabled) {
    const map = document.querySelector("#map");
    if (!map) return;

    const cursorValue = enabled ? "crosshair" : "default";
    map.style.cursor = cursorValue;

    document.querySelectorAll("#map .map-item").forEach((item) => {
      item.style.cursor = cursorValue;
    });
  }

  static updateResidentialMenuInfo() {
    const slot = document.querySelector("#slide-left .menu-slot");
    if (!slot) return;

    const menu03 = slot.querySelector(".menu-03");
    if (!menu03) return;

    let info = slot.querySelector("#residential-build-info");
    if (!info) {
      info = document.createElement("div");
      info.id = "residential-build-info";
      info.style.marginTop = "10px";
      info.style.padding = "10px";
      info.style.borderRadius = "8px";
      info.style.background = "rgba(20, 30, 45, 0.85)";
      info.style.color = "#f7f9fc";
      info.style.fontSize = "12px";
      info.style.lineHeight = "1.45";
      slot.appendChild(info);
    }

    const house = this.getResidentialSubtypeInfo("1");
    const apartment = this.getResidentialSubtypeInfo("2");
    const total = this.countResidentialBuildings();

    info.innerHTML = `
      <div>Residencial disponible:</div>
      <div>Casa: capacidad ${house.capacity}, costo $${house.cost}</div>
      <div>Apartamento: capacidad ${apartment.capacity}, costo $${apartment.cost}</div>
      <div>Total residenciales: ${total}</div>
    `;
  }

  static clearPendingBuildMode() {
    this.pendingBuildSubtype = null;
    this.pendingBuilds = null;
    this.applyBuildCursor(false);
  }

  static armPendingResidentialBuild(buildId, builds) {
    this.pendingBuildSubtype = buildId[1];
    this.pendingBuilds = builds;
    this.applyBuildCursor(true);

    const subtypeInfo = this.getResidentialSubtypeInfo(
      this.pendingBuildSubtype,
    );
    this.notify(
      `Modo construccion activo: ${subtypeInfotypeResidential}. Haz click en una celda vacia adyacente a una via.`,
      "info",
    );
  }

  static consumeUtilitiesIfAvailable(city) {
    const subtypeInfo = this.getResidentialSubtypeInfo(
      this.pendingBuildSubtype,
    );
    const energy = city?.resources?.energy;
    const water = city?.resources?.water;

    const hasEnergy = energy && energy.amount >= subtypeInfo.energyUsage;
    const hasWater = water && water.amount >= subtypeInfo.waterUsage;

    if (hasEnergy) {
      energy.subtract(subtypeInfo.energyUsage);
    } else {
      this.notify(
        `Advertencia: energia insuficiente para consumo residencial (${subtypeInfo.energyUsage} kWh).`,
        "warning",
      );
    }

    if (hasWater) {
      water.subtract(subtypeInfo.waterUsage);
    } else {
      this.notify(
        `Advertencia: agua insuficiente para consumo residencial (${subtypeInfo.waterUsage} L).`,
        "warning",
      );
    }
  }

  static placePendingResidentialBuildByCellId(cellId) {
    if (!this.pendingBuildSubtype || !this.pendingBuilds) return false;

    const coords = this.getCellCoordinatesById(cellId);
    if (!coords) {
      this.notify("No se pudo identificar la celda seleccionada.", "error");
      return true;
    }

    const cellData = MapController?.buildingGrid?.[coords.i]?.[coords.j];
    const city = SlideLeftController?.city;
    const cell = {
      id: cellId,
      cellData,
      i: coords.i,
      j: coords.j,
    };

    const validation = this.validatePlacement(cell, city);
    if (!validation.ok) {
      this.notify(validation.message, "error");
      return true;
    }

    const subtypeInfo = this.getResidentialSubtypeInfo(
      this.pendingBuildSubtype,
    );
    city.resources.money.subtract(subtypeInfo.cost);

    this.isPlacingFromPendingMode = true;
    MapController.replaceCellBuilding(
      `R${this.pendingBuildSubtype}`,
      this.pendingBuilds,
      cell,
    );
    this.isPlacingFromPendingMode = false;

    this.consumeUtilitiesIfAvailable(city);
    const residentialCount = this.countResidentialBuildings();

    this.notify(
      `${subtypeInfotypeResidential} construido con exito. Residenciales totales: ${residentialCount}.`,
      "success",
    );

    this.clearPendingBuildMode();
    SlideLeftController?.setMenuState("none");
    MapController?.clearCellSelection();
    this.updateResidentialMenuInfo();
    return true;
  }

  static installRuntimeHooks() {
    if (this.hooksInstalled) return;

    const dependenciesReady =
      typeof MapController !== "undefined" &&
      typeof SlideLeftController !== "undefined";

    if (!dependenciesReady) return;

    const originalReplaceCellBuilding =
      MapController.replaceCellBuilding.bind(MapController);
    MapController.replaceCellBuilding = (btnId, builds, cell) => {
      if (
        this.isResidentialSelection(btnId) &&
        !this.isPlacingFromPendingMode
      ) {
        this.armPendingResidentialBuild(btnId, builds);
        return null;
      }

      return originalReplaceCellBuilding(btnId, builds, cell);
    };

    const originalSetMenuState =
      SlideLeftController.setMenuState.bind(SlideLeftController);
    SlideLeftController.setMenuState = (newState) => {
      const response = originalSetMenuState(newState);
      if (newState === "select-building") {
        this.updateResidentialMenuInfo();
      }
      if (newState !== "select-building" && !this.pendingBuildSubtype) {
        this.applyBuildCursor(false);
      }
      return response;
    };

    document.addEventListener(
      "click",
      (event) => {
        if (!this.pendingBuildSubtype) return;

        const mapItem = event.target.closest(".map-item");
        if (!mapItem) return;

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        const cellId = mapItem.id.replace("map-item-", "");
        this.placePendingResidentialBuildByCellId(cellId);
      },
      true,
    );

    this.hooksInstalled = true;
    Logger.log(
      "✅ [ResidentialBuilding] Hooks de construccion residencial activos",
    );
  }
  executeTurnLogic(city, buildingData) {
  }
}

const setupResidentialHooksInterval = setInterval(() => {
  ResidentialBuilding.installRuntimeHooks();
  if (ResidentialBuilding.hooksInstalled) {
    clearInterval(setupResidentialHooksInterval);
  }
}, 120);
