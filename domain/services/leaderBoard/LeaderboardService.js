export class LeaderboardService {
  static buildEntries(cities = [], currentCityId = null) {
    if (!Array.isArray(cities)) {
      return [];
    }

    const allEntries = cities
      .map((city) => this.#normalizeCity(city))
      .filter(Boolean)
      .sort((left, right) => {
        const scoreDiff = right.score - left.score;
        if (scoreDiff !== 0) return scoreDiff;

        const leftUpdatedAt = new Date(left.updatedAt || left.createdAt || 0).getTime();
        const rightUpdatedAt = new Date(right.updatedAt || right.createdAt || 0).getTime();
        const updatedDiff = rightUpdatedAt - leftUpdatedAt;
        if (updatedDiff !== 0) return updatedDiff;

        return left.name.localeCompare(right.name, "es", { sensitivity: "base" });
      })
      .map((entry, index) => ({
        ...entry,
        position: index + 1,
      }));

    // Obtener top 10
    const top10 = allEntries.slice(0, 10);
    
    // Encontrar posición de la ciudad actual en el ranking general
    let currentCityEntry = null;
    if (currentCityId) {
      currentCityEntry = allEntries.find((entry) => String(entry.id) === String(currentCityId));
    }

    return {
      top10,
      currentCity: currentCityEntry,
      totalCities: allEntries.length,
    };
  }

  static buildSummary(data = {}) {
    const entries = Array.isArray(data) ? data : data?.top10 || [];
    const uniqueMayors = new Set(
      entries
        .map((entry) => String(entry.mayorName || "").trim().toLowerCase())
        .filter(Boolean),
    );

    return {
      totalCities: data.totalCities || entries.length,
      totalMayors: uniqueMayors.size,
      bestScore: entries[0]?.score ?? 0,
      averageScore: entries.length
        ? Math.round(
            entries.reduce((acc, entry) => acc + Number(entry.score || 0), 0) /
              entries.length,
          )
        : 0,
    };
  }

  static #normalizeCity(city) {
    if (!city || typeof city !== "object") {
      return null;
    }

    const score = Number(city.score ?? 0);
    const citizens = Array.isArray(city.citizens) ? city.citizens : [];
    const citizensCount = citizens.length;
    
    // Calcular felicidad promedio
    let averageHappiness = 0;
    if (citizensCount > 0) {
      const totalHappiness = citizens.reduce((sum, citizen) => sum + (citizen?.happiness ?? 0), 0);
      averageHappiness = Math.round((totalHappiness / citizensCount + 100) / 2); // Normalizar a 0-100%
      averageHappiness = Math.max(0, Math.min(100, averageHappiness)); // Asegurar rango 0-100
    }

    return {
      id: String(city.id ?? ""),
      name: city.name || "Ciudad sin nombre",
      mayorName: city.mayor?.name || "Desconocido",
      locationName: city.location?.name || "Ubicación desconocida",
      mapSize: Number(city.mapSize ?? 0),
      turn: Number(city.turn ?? 0),
      citizensCount,
      averageHappiness,
      score: Number.isFinite(score) ? score : 0,
      createdAt: city.createdAt || null,
      updatedAt: city.updatedAt || city.createdAt || null,
    };
  }
}