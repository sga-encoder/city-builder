import { createBuilding } from "./building/buildingFactory.js";
import { LocalStorage } from "../database/localStorage.js";
export class Map {
  static typeBuildingAcceptedMap = [];

  static buildAcceptedTypes(buildsConfig) {
    if (!buildsConfig || typeof buildsConfig !== "object") return [];

    const acceptedTypes = [];

    Object.entries(buildsConfig).forEach(([type, subtypes]) => {
      if (!subtypes || typeof subtypes !== "object") return;

      Object.keys(subtypes).forEach((subtype) => {
        acceptedTypes.push(`${type}${subtype || ""}`);
      });
    });

    return [...new Set(acceptedTypes)];
  }

  static buildingInstanceMap(type = null) {
    const data = this.typeBuildingAcceptedMap.map((typeId) => {
      const type = typeId[0];
      const subtype = typeId.slice(1) || "";

      return [
        typeId,
        createBuilding({
          id: null,
          type,
          subtype,
          model: null,
        }),
      ];
    });
    if (type === null) {
      return data;
    } else {
      return data.filter(([typeId]) => typeId.startsWith(type));
    }
  }

  constructor({ grid, buildsConfig }) {
    this.observers = [];
    this.persistDebounce = null;
    Map.typeBuildingAcceptedMap = Map.buildAcceptedTypes(buildsConfig);
    this.grid = grid;
    this.schedulePersist();
    this.notifyObservers({ type: "map-initialized", size: grid.length });
  }

  addObserver(callback) {
    if (typeof callback === "function") this.observers.push(callback);
  }

  removeObserver(callback) {
    this.observers = this.observers.filter((obs) => obs !== callback);
  }

  notifyObservers(payload) {
    this.observers.forEach((callback) => callback(payload));
  }

  schedulePersist() {
    clearTimeout(this.persistDebounce);
    this.persistDebounce = setTimeout(() => {
      LocalStorage.saveData("map", JSON.stringify(this.toSerializableGrid()));
    }, 120);
  }

  toSerializableGrid() {
    return this.grid.map((row) => row.map((building) => ({ ...building })));
  }

  setBuildingAt(i, j, building) {
    if (!this.grid?.[i]?.[j]) return false;

    const previous = this.grid[i][j];
    this.grid[i][j] = building;

    this.schedulePersist();
    this.notifyObservers({
      type: "cell-updated",
      i,
      j,
      id: building.id,
      previous,
      current: building,
    });

    return true;
  }

  moveBuilding(fromI, fromJ, toI, toJ, groundBuildingFactory) {
    const source = this.grid?.[fromI]?.[fromJ];
    const target = this.grid?.[toI]?.[toJ];
    if (!source || !target) return false;
    if (target.type !== "g") return false;

    const ground = groundBuildingFactory(source.id, fromI, fromJ);
    // Mantener consistencia: la instancia movida ahora pertenece a la celda destino.
    source.id = target.id;
    this.grid[fromI][fromJ] = ground;
    this.grid[toI][toJ] = source;

    this.schedulePersist();
    this.notifyObservers({
      type: "cell-updated",
      i: fromI,
      j: fromJ,
      id: ground.id,
      current: ground,
    });
    this.notifyObservers({
      type: "cell-updated",
      i: toI,
      j: toJ,
      id: source.id,
      current: source,
    });

    return true;
  }
}
