export class StatsManager {
  static stats = {}; // { [subtipo]: { consumo: {...}, produccion: {...}, ... } }

  // Inicializa o resetea las estadísticas
  static reset(subtype = null) {
    if (subtype !== null) {
      delete this.stats[subtype];
    } else {
      this.stats = {};
    }   
    this.save();
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
  }
}
