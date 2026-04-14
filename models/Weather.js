export class Weather {
  constructor({
    cityName,
    temperatureC,
    condition,
    humidity,
    windKmh,
    iconKey,
    updatedAt,
    mainCondition,
    iconCode,
  } = {}) {
    this.cityName = Weather.normalizeText(cityName) || "Ciudad";
    this.temperatureC = Weather.normalizeNumber(temperatureC, 0);
    this.condition = Weather.normalizeText(condition) || "variable";
    this.humidity = Weather.normalizeNumber(humidity, 0);
    this.windKmh = Weather.normalizeNumber(windKmh, 0);
    this.iconKey = Weather.normalizeText(iconKey) || "weather.sunny";
    this.updatedAt = Weather.normalizeTimestamp(updatedAt);
    this.mainCondition = Weather.normalizeText(mainCondition);
    this.iconCode = Weather.normalizeText(iconCode);
  }

  static normalizeText(value) {
    if (value === null || value === undefined) return "";
    return String(value).trim();
  }

  static normalizeNumber(value, fallback = 0) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return parsed;
  }

  static normalizeTimestamp(value) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
    return Date.now();
  }

  static mapCondition(mainValue) {
    const value = String(mainValue || "").toLowerCase();
    if (value.includes("clear")) return "soleado";
    if (value.includes("rain") || value.includes("drizzle")) return "lluvioso";
    if (value.includes("thunder")) return "tormenta";
    if (value.includes("cloud")) return "nublado";
    if (value.includes("snow")) return "nevado";
    return "variable";
  }

  static mapIconKey(mainValue, iconCode) {
    const value = String(mainValue || "").toLowerCase();
    const code = String(iconCode || "").toLowerCase();
    const isNight = code.endsWith("n");

    if (value.includes("thunder")) return "weather.thunderstorm";
    if (value.includes("drizzle")) return "weather.drizzle";

    if (value.includes("rain")) {
      return isNight ? "weather.rain-showers-night" : "weather.rain-showers-day";
    }

    if (value.includes("snow")) {
      return isNight ? "weather.snow-showers-night" : "weather.snow-showers-day";
    }

    if (value.includes("cloud")) {
      return isNight ? "weather.partly-cloudy-night" : "weather.partly-cloudy-day";
    }

    if (value.includes("clear")) {
      return isNight ? "weather.sunny-low" : "weather.sunny";
    }

    return isNight ? "weather.partly-cloudy-night" : "weather.partly-cloudy-day";
  }

  static fromApi(data = {}, locationName = "") {
    const mainCondition = data?.weather?.[0]?.main || "";
    const iconCode = data?.weather?.[0]?.icon || "";
    const windMetersPerSec = Number(data?.wind?.speed || 0);

    return new Weather({
      cityName: data?.name || locationName || "Ciudad",
      temperatureC: Number(data?.main?.temp || 0),
      condition: Weather.mapCondition(mainCondition),
      humidity: Number(data?.main?.humidity || 0),
      windKmh: Number((windMetersPerSec * 3.6).toFixed(1)),
      iconKey: Weather.mapIconKey(mainCondition, iconCode),
      updatedAt: Date.now(),
      mainCondition,
      iconCode,
    });
  }

  static fromStored(data = {}, locationName = "") {
    const mainCondition = data?.mainCondition || data?.condition || "";
    const iconCode = data?.iconCode || "";

    return new Weather({
      cityName: data?.cityName || locationName || "Ciudad",
      temperatureC: data?.temperatureC,
      condition: data?.condition || Weather.mapCondition(mainCondition),
      humidity: data?.humidity,
      windKmh: data?.windKmh,
      iconKey: data?.iconKey || Weather.mapIconKey(mainCondition, iconCode),
      updatedAt: data?.updatedAt,
      mainCondition,
      iconCode,
    });
  }

  isValid() {
    return Boolean(this.cityName);
  }

  toJSON() {
    return {
      cityName: this.cityName,
      temperatureC: this.temperatureC,
      condition: this.condition,
      humidity: this.humidity,
      windKmh: this.windKmh,
      iconKey: this.iconKey,
      updatedAt: this.updatedAt,
      mainCondition: this.mainCondition,
      iconCode: this.iconCode,
    };
  }
}