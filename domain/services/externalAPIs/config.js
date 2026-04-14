import { LocalStorage } from "../../../database/localStorage.js";

export const EXTERNAL_API_CONFIG = {
  WEATHER_REFRESH_MS: 30 * 60 * 1000,
  NEWS_REFRESH_MS: 30 * 60 * 1000,
  REQUEST_TIMEOUT_MS: 10000,
  STORAGE_KEYS: {
    WEATHER_CACHE: "weatherCache",
    NEWS_CACHE: "newsCache",
  },
  DEFAULT_NEWS_QUERY: "colombia",
};

export function readApiKeys() {
  const env = globalThis.__CITY_BUILDER_ENV__ || globalThis.CITY_BUILDER_ENV || {};

  return {
    weatherKey:
      env.OPENWEATHER_API_KEY ||
      globalThis.OPENWEATHER_API_KEY ||
      "",
    newsKey:
      env.NEWS_API_KEY ||
      globalThis.NEWS_API_KEY ||
      "",
  };
}

export function getCityLocationFromStorage() {
  const raw = LocalStorage.loadData("cityConfig");
  if (!raw) {
    return {
      name: "Ciudad",
      lat: 0,
      lon: 0,
      cityQuery: EXTERNAL_API_CONFIG.DEFAULT_NEWS_QUERY,
    };
  }

  try {
    const cityConfig = JSON.parse(raw);
    const location = cityConfig?.location || {};

    return {
      name: location.name || cityConfig?.name || "Ciudad",
      lat: Number(location.latitude ?? 0),
      lon: Number(location.longitude ?? 0),
      cityQuery: String(location.name || cityConfig?.name || EXTERNAL_API_CONFIG.DEFAULT_NEWS_QUERY).toLowerCase(),
    };
  } catch {
    return {
      name: "Ciudad",
      lat: 0,
      lon: 0,
      cityQuery: EXTERNAL_API_CONFIG.DEFAULT_NEWS_QUERY,
    };
  }
}

