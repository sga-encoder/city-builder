export class LeaderboardService {
  static buildEntries(cities = []) {
    if (!Array.isArray(cities)) {
      return [];
    }

    return cities
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
  }

  static buildSummary(entries = []) {
    const uniqueMayors = new Set(
      entries
        .map((entry) => String(entry.mayorName || "").trim().toLowerCase())
        .filter(Boolean),
    );

    return {
      totalCities: entries.length,
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

    return {
      id: String(city.id ?? ""),
      name: city.name || "Ciudad sin nombre",
      mayorName: city.mayor?.name || "Desconocido",
      locationName: city.location?.name || "Ubicación desconocida",
      mapSize: Number(city.mapSize ?? 0),
      turn: Number(city.turn ?? 0),
      citizensCount: Array.isArray(city.citizens) ? city.citizens.length : Number(city.citizensCount ?? 0),
      score: Number.isFinite(score) ? score : 0,
      createdAt: city.createdAt || null,
      updatedAt: city.updatedAt || city.createdAt || null,
    };
  }
}