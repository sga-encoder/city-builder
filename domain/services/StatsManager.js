export class StatsManager {
  static stats = {}; // { [subtipo]: { consumo: {...}, produccion: {...}, ... } }
  static observers = [];

  // Inicializa o resetea las estadísticas
  static reset(subtype = null) {
    if (subtype !== null) {
      delete this.stats[subtype];
    } else {
      this.stats = {};
    }
    this.save();
    this.notify();
  }

  // Agrega consumo/producción/ocupación para un subtipo
  static addStats(subtype, data) {
    if (!this.stats[subtype]) {
      this.stats[subtype] = {};
    }
    // Solo agrega/actualiza los campos que se reciben
    if (Object.keys(data).length) {
      for (const key in data) {
        for (const subkey in data[key]) {
          if (!this.stats[subtype][key]) this.stats[subtype][key] = {};
          this.stats[subtype][key][subkey] =
            (this.stats[subtype][key][subkey] || 0) + data[key][subkey];
        }
      }
    }
    this.save();
    this.notify();
  }

  // Obtener estadísticas de un subtipo
  static getStats(subtype) {
    return this.stats[subtype] || null;
  }

  // Obtener todas las estadísticas
  static getAllStats() {
    return this.stats;
  }

  // Guardar en localStorage
  static save() {
    localStorage.setItem("buildingStats", JSON.stringify(this.stats));
  }

  // Cargar de localStorage
  static load() {
    const data = localStorage.getItem("buildingStats");
    if (data) this.stats = JSON.parse(data);
    this.notify();

  }

  // Métodos de observador
  static addObserver(callback) {
    if (typeof callback === "function") this.observers.push(callback);
  }

  static removeObserver(callback) {
    this.observers = this.observers.filter(obs => obs !== callback);
  }

  static notify() {
    for (const fn of this.observers) {
      try {
        fn(this.stats);
      } catch (e) {
        // Manejo simple de errores en callbacks
        console.error("StatsManager observer error:", e);
      }
    }
  }
}
