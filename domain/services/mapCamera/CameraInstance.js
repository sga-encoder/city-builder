

import { LocalStorage } from "../../../database/LocalStorage.js";

export class CameraInstanceManager {
  static #camera = null;
  static #storageKey = "mapCameraState";

  /**
   * Guarda la instancia de la cámara globalmente.
   * @param {MapCamera} instance
   */
  static setInstance(instance) {
    this.#camera = instance;
  }

  /**
   * Obtiene la instancia actual de la cámara.
   * @returns {MapCamera|null}
   */
  static getInstance() {
    return this.#camera;
  }

  /**
   * Guarda el estado de la cámara en localStorage.
   * @param {{zoom:number, pan:{x:number, y:number}}} state
   */
  static saveState(state) {
    try {
      LocalStorage.saveData(this.#storageKey, JSON.stringify(state));
    } catch (e) {
      console.warn("Failed to save camera state:", e);
      // Opcional: manejar error
    }
  }

  /**
   * Recupera el estado de la cámara desde localStorage.
   * @returns {{zoom:number, pan:{x:number, y:number}}|null}
   */
  static loadState() {
    try {
      const raw = LocalStorage.loadData(this.#storageKey);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.warn("Failed to load camera state:", e);
      return null;
    }
  }
}