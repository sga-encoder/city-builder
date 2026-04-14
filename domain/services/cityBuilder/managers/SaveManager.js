import { LocalStorage } from "../../../../database/localStorage.js";
import { ToastService } from "../../toast.js";
import { Logger } from "../../../utilis/Logger.js";
import { CitySelectionController } from "../../../controllers/citySelection/Controller.js";

/**
 * SaveManager - Sistema centralizado de guardado
 * Responsable de guardar y restaurar todo el estado del juego
 */
export class SaveManager {
  static AUTO_SAVE_INTERVAL = 20000; // 20 segundos
  static timerId = null;
  static cityRef = null;
  static turnSystemRef = null;
  static lastSaveTime = 0;

  static init(city, turnSystem) {
    this.cityRef = city;
    this.turnSystemRef = turnSystem;
    this.startAutoSave();
    this.createIndicator();
    Logger.log("💾 [SaveManager] Inicializado");
  }

  static startAutoSave() {
    this.stopAutoSave();
    this.timerId = setInterval(() => {
      this.quickSave();
    }, this.AUTO_SAVE_INTERVAL);
  }

  static stopAutoSave() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  static createIndicator() {
    try {
      let indicator = document.getElementById("save-indicator");
      if (!indicator) {
        indicator = document.createElement("div");
        indicator.id = "save-indicator";
        indicator.className = "save-indicator hidden";
        indicator.innerHTML = `<span>💾</span> Guardando...`;
        document.body.appendChild(indicator);
      }
    } catch (e) {
      // Ignorar errores de DOM
    }
  }

  static showIndicator() {
    try {
      const indicator = document.getElementById("save-indicator");
      if (indicator) {
        indicator.classList.remove("hidden");
        setTimeout(() => indicator.classList.add("hidden"), 1000);
      }
    } catch (e) {
      // Ignorar errores
    }
  }

  /**
   * Guardado rápido sin mostrar mensaje
   * Se usa para auto-guardado periódico
   */
  static quickSave() {
    if (!this.cityRef || !this.turnSystemRef) return false;

    try {
      const now = Date.now();
      if (now - this.lastSaveTime < 10000) return false; // Evitar guardado muy frecuente

      return this.#performSave(false);
    } catch (error) {
      Logger.warn("⚠️ [SaveManager] Error en quickSave:", error.message);
      return false;
    }
  }

  /**
   * Guardado manual (muestra indicador)
   * Se usa cuando el usuario presiona guardar o eventos críticos
   */
  static saveGame() {
    try {
      this.showIndicator();
      const success = this.#performSave(true);
      if (success) {
        ToastService.mostrarToast("✅ Partida guardada", "success");
      }
      return success;
    } catch (error) {
      Logger.error("❌ [SaveManager] Error guardando:", error);
      ToastService.mostrarToast("❌ Error al guardar", "error");
      return false;
    }
  }

  /**
   * Realiza el guardado efectivo
   * @private
   */
  static #performSave(showLog = true) {
    if (!this.cityRef || !this.turnSystemRef) return false;

    try {
      const city = this.cityRef;
      const turnSystem = this.turnSystemRef;

      // Construcción completa del estado
      const completeState = {
        // Grid del mapa
        grid: this.#serializeGrid(city.map?.grid || []),

        // Ciudadanos
        citizens: this.#serializeCitizens(city.citizens || []),

        // Recursos
        resources: {
          money: city.resources?.money?.amount || 50000,
          energy: city.resources?.energy?.amount || 100,
          water: city.resources?.water?.amount || 100,
          food: city.resources?.food?.amount || 100,
        },

        // Información de la ciudad
        cityConfig: {
          id: city.id,
          name: city.name,
          mayor: city.mayor,
          location: city.location,
          createdAt: city.createdAt,
        },

        // Estado del juego
        turn: turnSystem.currentTurn || city.turn || 0,
        score: Number(city.score || 0),
        
        // Metadata
        timestamp: new Date().toISOString(),
      };

      // Guardar como JSON único (nuevo sistema centralizado)
      const serialized = JSON.stringify(completeState);
      LocalStorage.saveData("gameState", serialized);

      // ✅ TAMBIÉN guardar en keys antiguas para compatibilidad con MapPhase + CityPhase
      LocalStorage.saveData("map", JSON.stringify(completeState.grid)); // MapPhase busca array de strings aquí
      LocalStorage.saveData("score", JSON.stringify(completeState.score));
      LocalStorage.saveData("citizens", JSON.stringify(completeState.citizens));
      LocalStorage.saveData("turn", JSON.stringify(completeState.turn));
      LocalStorage.saveData("resources", JSON.stringify(completeState.resources));
      LocalStorage.saveData("cityConfig", JSON.stringify(completeState.cityConfig));

      this.lastSaveTime = Date.now();

      if (showLog) {
        Logger.log("✅ [SaveManager] Guardado completado");
      }

      // Sincronizar con UI
      try {
        CitySelectionController.syncActiveCitySnapshot(completeState);
      } catch (e) {
        Logger.warn("⚠️ Sincronización parcial");
      }

      return true;
    } catch (error) {
      Logger.error("❌ [SaveManager] Error en #performSave:", error);
      return false;
    }
  }

  /**
   * Serializa la cuadrícula manteniendo formato consistente
   * @private
   */
  static #serializeGrid(grid) {
    if (!Array.isArray(grid)) return [];

    return grid.map((row) => {
      if (!Array.isArray(row)) return [];
      return row.map((cell) => {
        if (typeof cell === "string") return cell;
        if (cell?.type && cell?.subtype !== undefined) {
          return `${cell.type}${cell.subtype}`;
        }
        return "g";
      });
    });
  }

  /**
   * Serializa ciudadanos
   * @private
   */
  static #serializeCitizens(citizens) {
    if (!Array.isArray(citizens)) return [];

    return citizens.map((c) => ({
      id: c?.id,
      name: c?.name || "Ciudadano",
      happiness: Number(c?.happiness || 0),
      hasJob: Boolean(c?.hasJob),
      hasHome: Boolean(c?.hasHome),
      home: c?.home ? { type: c.home.type, subtype: c.home.subtype } : null,
      job: c?.job ? { type: c.job.type, subtype: c.job.subtype } : null,
    }));
  }

  /**
   * Verifica si hay guardado disponible
   */
  static hasSavedGame() {
    return LocalStorage.loadData("gameState") !== null;
  }

  /**
   * Elimina el guardado
   */
  static deleteSavedGame() {
    if (confirm("⚠️ ¿Eliminar la partida guardada?")) {
      LocalStorage.saveData("gameState", null);
      return true;
    }
    return false;
  }
}
