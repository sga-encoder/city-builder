export class TurnValidator {
  static validateCity(city) {
    if (!city) return { valid: false, errors: ["City nula"] };
    const errors = [];

    const hasValidId =
      (typeof city.id === "number" && Number.isFinite(city.id)) ||
      (typeof city.id === "string" && city.id.trim().length > 0);

    if (!hasValidId) errors.push("City.id inválido");
    if (!city.name || typeof city.name !== "string")
      errors.push("City.name inválido");
    if (!city.map) errors.push("City.map ausente");
    if (!city.resources) errors.push("City.resources ausente");

    // Validar recursos
    const res = this.validateResources(city);
    if (!res.valid) errors.push(...res.errors);

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static validateResources(city) {
    if (!city.resources)
      return { valid: false, errors: ["City.resources ausente"] };
    const errors = [];
    const types = ["money", "energy", "water", "food"];

    for (const t of types) {
      const r = city.resources[t];
      if (!r) {
        errors.push(`Resource ${t} ausente`);
        continue;
      }
      if (typeof r.amount !== "number")
        errors.push(`Resource ${t}.amount inválido`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static getValidationStats(city) {
    const cityRes = this.validateCity(city);
    return {
      cityValid: cityRes.valid,
      cityErrors: cityRes.errors,
      resourceValid: this.validateResources(city).valid,
      buildingCount: city.getResidentialBuildings
        ? city.getResidentialBuildings().length
        : 0,
    };
  }
}
