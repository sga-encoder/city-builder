const API_BASE_URL = "https://api-colombia.com/api/v1";

const CAPITAL_COORDINATES = {
  "Arauca": { lat: 7.0907, lon: -70.7617 },
  "Armenia": { lat: 4.5339, lon: -75.6811 },
  "Barranquilla": { lat: 10.9639, lon: -74.7964 },
  "Bogota D.C.": { lat: 4.711, lon: -74.0721 },
  "Bogota": { lat: 4.711, lon: -74.0721 },
  "Bucaramanga": { lat: 7.1193, lon: -73.1227 },
  "Cali": { lat: 3.4516, lon: -76.532 },
  "Cartagena": { lat: 10.391, lon: -75.4794 },
  "Cucuta": { lat: 7.8891, lon: -72.4967 },
  "Florencia": { lat: 1.6144, lon: -75.6062 },
  "Ibague": { lat: 4.4389, lon: -75.2322 },
  "Inirida": { lat: 3.8653, lon: -67.9239 },
  "Leticia": { lat: -4.2153, lon: -69.9406 },
  "Manizales": { lat: 5.0703, lon: -75.5138 },
  "Medellin": { lat: 6.2442, lon: -75.5812 },
  "Mitu": { lat: 1.2537, lon: -70.234 },
  "Mocoa": { lat: 1.1528, lon: -76.6521 },
  "Monteria": { lat: 8.7479, lon: -75.8814 },
  "Neiva": { lat: 2.9386, lon: -75.2819 },
  "Pasto": { lat: 1.2136, lon: -77.2811 },
  "Pereira": { lat: 4.8143, lon: -75.6946 },
  "Popayan": { lat: 2.4448, lon: -76.6147 },
  "Puerto Carreno": { lat: 6.1848, lon: -67.4932 },
  "Quibdo": { lat: 5.6947, lon: -76.6611 },
  "Riohacha": { lat: 11.5444, lon: -72.9072 },
  "San Andres": { lat: 12.5847, lon: -81.7006 },
  "San Jose del Guaviare": { lat: 2.5719, lon: -72.6459 },
  "Santa Marta": { lat: 11.2408, lon: -74.199 },
  "Sincelejo": { lat: 9.3047, lon: -75.3978 },
  "Tunja": { lat: 5.5446, lon: -73.3579 },
  "Valledupar": { lat: 10.4631, lon: -73.2532 },
  "Villavicencio": { lat: 4.142, lon: -73.6266 },
  "Yopal": { lat: 5.347, lon: -72.3958 },
};

export class ColombiaApi {
  static normalizeName(name = "") {
    return String(name)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  static async getDepartments() {
    const response = await fetch(`${API_BASE_URL}/Department`);
    if (!response.ok) {
      throw new Error(`Error API Colombia: ${response.status}`);
    }

    const departments = await response.json();
    return Array.isArray(departments) ? departments : [];
  }

  static getCoordinatesForCapital(capitalName) {
    const normalized = this.normalizeName(capitalName);
    return CAPITAL_COORDINATES[normalized] || null;
  }

  static mapDepartmentToCapital(department) {
    const capital = department?.cityCapital;
    if (!capital?.name) return null;

    const coordinates = this.getCoordinatesForCapital(capital.name);
    if (!coordinates) return null;

    return {
      id: capital.id,
      name: capital.name,
      lat: coordinates.lat,
      lon: coordinates.lon,
      department: department.name,
    };
  }

  static async getDepartmentCapitals() {
    const departments = await this.getDepartments();

    const capitals = departments
      .map((department) => this.mapDepartmentToCapital(department))
      .filter(Boolean);

    const uniqueById = [];
    const seen = new Set();

    capitals.forEach((capital) => {
      if (seen.has(capital.id)) return;
      seen.add(capital.id);
      uniqueById.push(capital);
    });

    return uniqueById.sort((a, b) => a.name.localeCompare(b.name, "es-CO"));
  }
}
