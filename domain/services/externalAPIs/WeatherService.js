import { ToastService } from "../toast.js";
import { LocalStorage } from "../../../database/localStorage.js";
import { fetchCurrentWeather } from "../../../database/weatherApi.js";
import { Weather } from "../../../models/Weather.js";
import {
  EXTERNAL_API_CONFIG,
  getCityLocationFromStorage,
  readApiKeys,
} from "./config.js";

export class WeatherService {
  static observers = new Set();
  static intervalId = null;
  static initialized = false;
  static location = null;
  static lastToastAt = 0;

  static state = {
    status: "idle",
    data: null,
    error: null,
    updatedAt: null,
    source: "live",
  };

  static init() {
    if (this.initialized) return;
    this.location = getCityLocationFromStorage();
    this.initialized = true;
    this.fetchNow();
    this.startAutoRefresh();
  }

  static startAutoRefresh() {
    this.stopAutoRefresh();
    this.intervalId = setInterval(() => {
      this.fetchNow();
    }, EXTERNAL_API_CONFIG.WEATHER_REFRESH_MS);
  }

  static stopAutoRefresh() {
    if (!this.intervalId) return;
    clearInterval(this.intervalId);
    this.intervalId = null;
  }

  static addObserver(callback) {
    if (typeof callback !== "function") return;
    this.observers.add(callback);
  }

  static removeObserver(callback) {
    this.observers.delete(callback);
  }

  static getSnapshot() {
    return { ...this.state };
  }

  static notify() {
    const snapshot = this.getSnapshot();
    this.observers.forEach((callback) => {
      try {
        callback(snapshot);
      } catch {
        // Evita que un observer rompa el ciclo.
        console.error("WeatherService observer error:", callback);
      }
    });
  }

  static setState(partialState) {
    this.state = {
      ...this.state,
      ...partialState,
    };
    this.notify();
  }

  static showErrorToast(message) {
    const now = Date.now();
    if (now - this.lastToastAt < 120000) return;
    this.lastToastAt = now;
    ToastService.mostrarToast(message, "warning", 3500);
  }

  static mapPayload(data) {
    const weather = Weather.fromApi(data, this.location?.name || "Ciudad");
    return weather.toJSON();
  }

  static normalizeCachedWeather(data) {
    if (!data || typeof data !== "object") return null;
    const weather = Weather.fromStored(data, this.location?.name || "Ciudad");
    if (!weather.isValid()) return null;
    return weather.toJSON();
  }

  static async fetchNow() {
    this.location = getCityLocationFromStorage();
    const { weatherKey } = readApiKeys();

    if (!weatherKey) {
      const cached = LocalStorage.loadCache(EXTERNAL_API_CONFIG.STORAGE_KEYS.WEATHER_CACHE);
      const cachedWeather = this.normalizeCachedWeather(cached?.data || null);
      this.setState({
        status: cachedWeather ? "success" : "error",
        data: cachedWeather,
        error: "Falta OPENWEATHER_API_KEY en variables de entorno del cliente.",
        updatedAt: cached?.updatedAt || null,
        source: cachedWeather ? "cache" : "live",
      });
      this.showErrorToast("Weather: configura OPENWEATHER_API_KEY");
      return;
    }

    this.setState({ status: "loading", error: null });

    const result = await fetchCurrentWeather({
      lat: this.location.lat,
      lon: this.location.lon,
      apiKey: weatherKey,
      units: "metric",
      lang: "es",
      timeoutMs: EXTERNAL_API_CONFIG.REQUEST_TIMEOUT_MS,
    });

    if (!result.ok) {
      const cached = LocalStorage.loadCache(EXTERNAL_API_CONFIG.STORAGE_KEYS.WEATHER_CACHE);
      const cachedWeather = this.normalizeCachedWeather(cached?.data || null);
      this.setState({
        status: cachedWeather ? "success" : "error",
        data: cachedWeather,
        error: `Weather error: ${result.error}`,
        updatedAt: cached?.updatedAt || null,
        source: cachedWeather ? "cache" : "live",
      });
      this.showErrorToast("No se pudo actualizar el clima en vivo");
      return;
    }

    const mapped = this.mapPayload(result.data);
    LocalStorage.saveCache(EXTERNAL_API_CONFIG.STORAGE_KEYS.WEATHER_CACHE, {
      updatedAt: mapped.updatedAt,
      data: mapped,
    });

    this.setState({
      status: "success",
      data: mapped,
      error: null,
      updatedAt: mapped.updatedAt,
      source: "live",
    });
  }
}
