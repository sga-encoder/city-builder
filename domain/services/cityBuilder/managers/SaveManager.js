import { LocalStorage } from "../../../../database/LocalStorage.js";
import { ToastService } from "../../toast.js";
import { Logger } from "../../../utilis/Logger.js";
import { CitySelectionController } from "../../../controllers/citySelection/Controller.js";
import { TurnToolsStats } from "../../../utilis/devUtils/components/turnTools/Stats/Renderer.js";

export class SaveManager {
  static AUTO_SAVE_INTERVAL = 30000; // 30 segundos
  static timerId = null;
  static cityRef = null;
  static turnSystemRef = null;

  static init(city, turnSystem) {
    this.cityRef = city;
    this.turnSystemRef = turnSystem;
    this.startAutoSave();
    this.createIndicator();
  }

  static startAutoSave() {
    this.stopAutoSave();
    this.timerId = setInterval(() => {
      this.saveGame({ isAuto: true });
    }, this.AUTO_SAVE_INTERVAL);
  }

  static stopAutoSave() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  static createIndicator() {
    let indicator = document.getElementById("save-indicator");
    if (!indicator) {
      indicator = document.createElement("div");
      indicator.id = "save-indicator";
      indicator.className = "save-indicator hidden";
      indicator.innerHTML = `<span>💾</span> Guardando...`;
      document.body.appendChild(indicator);
    }
  }

  static showIndicator() {
    const indicator = document.getElementById("save-indicator");
    if (indicator) {
      indicator.classList.remove("hidden");
      setTimeout(() => indicator.classList.add("hidden"), 1500);
    }
  }

  static generateSnapshot() {
    if (!this.cityRef || !this.turnSystemRef) return null;

    const city = this.cityRef;
    const turnSystem = this.turnSystemRef;

    // Serializar Mapa
    const serializedGrid = city.map?.grid?.map(row => 
      row.map(cell => {
        if (!cell || cell === "g") return "g";
        if (typeof cell === "object") {
          return { ...cell };
        }
        return cell;
      })
    ) || [];

    // Serializar Ciudadanos
    const serializedCitizens = city.citizens?.map(c => ({
      id: c.id,
      name: c.name,
      happiness: c.happiness ?? 0,
      hasJob: Boolean(c.hasJob),
      hasHome: Boolean(c.hasHome),
      jobRef: c.job?.id || null,
      homeRef: c.home?.id || null
    })) || [];

    const statsHistory = TurnToolsStats.statsHistory?.slice(-20) || [];

    const snapshot = {
      id: city.id,
      name: city.name,
      mayor: city.mayor,
      location: city.location,
      mapSize: city.map?.grid?.length || 30,
      turn: turnSystem.currentTurn || city.turn || 0,
      score: Number(city.score || 0),
      grid: serializedGrid,
      resources: { ...city.resources },
      citizens: serializedCitizens,
      citizensCount: serializedCitizens.length,
      createdAt: city.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statsHistory,
    };

    return snapshot;
  }

  static saveGame({ isAuto = false } = {}) {
    if (!this.cityRef) return false;

    try {
      this.showIndicator();
      
      const snapshot = this.generateSnapshot();
      if (!snapshot) return false;

      // Actualizar el "SaveSlot" o la sesión activa config
      LocalStorage.saveData("map", JSON.stringify(snapshot.grid));
      LocalStorage.saveData("score", JSON.stringify(snapshot.score));
      LocalStorage.saveData("citizens", JSON.stringify(snapshot.citizens));
      LocalStorage.saveData("turnLogs", JSON.stringify(snapshot.statsHistory));
      
      // Construir objeto base de configuración
      const cityConfigStr = LocalStorage.loadData("cityConfig") || "{}";
      const cityConfig = { ...JSON.parse(cityConfigStr), ...snapshot };
      LocalStorage.saveData("cityConfig", JSON.stringify(cityConfig));

      // Guardar también en la lista de ciudades global del Controller
      CitySelectionController.syncActiveCitySnapshot(snapshot);

      if (!isAuto) {
        ToastService.mostrarToast("Partida guardada manualmente", "success");
      } else {
        Logger.log("💾 [SaveManager] Autoguardado exitoso.");
      }
      return true;
    } catch (error) {
      Logger.error("❌ [SaveManager] Error al guardar partida:", error);
      if (!isAuto) {
        ToastService.mostrarToast("Error al guardar la partida", "error");
      }
      return false;
    }
  }

  static hasSavedGame() {
    const cityConfig = LocalStorage.loadData("cityConfig");
    return cityConfig !== null;
  }

  static deleteSavedGame() {
    const confirmDelete = confirm("⚠️ ¿Estás seguro de que deseas eliminar la partida guardada? Todo el progreso actual se perderá.");
    if (confirmDelete) {
      LocalStorage.removeData("cityConfig");
      LocalStorage.removeData("map");
      LocalStorage.removeData("score");
      LocalStorage.removeData("citizens");
      ToastService.mostrarToast("Partida eliminada", "info");
      return true;
    }
    return false;
  }
}
