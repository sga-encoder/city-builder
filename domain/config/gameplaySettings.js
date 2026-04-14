import { LocalStorage } from "../../database/LocalStorage.js";

const GAMEPLAY_SETTINGS_KEY = "gameplaySettings";

const DEFAULT_GAMEPLAY_SETTINGS = {
  serviceHappinessPerTurn: 10,
  citizenNeedsPerTurn: {
    water: 1,
    electricity: 1,
    food: 1,
  },
  maxCitizensGeneratedPerTurn: 3,
  turnDurationMs: 5000,
};

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeNeed(value, fallback) {
  const normalized = toNumber(value, fallback);
  return Math.max(0, normalized);
}

function normalizeMaxCitizens(value, fallback) {
  const normalized = Math.floor(toNumber(value, fallback));
  return Math.max(1, normalized);
}

function normalizeTurnDuration(value, fallback) {
  const normalized = Math.floor(toNumber(value, fallback));
  return Math.max(100, normalized); // Mínimo 100ms para evitar turnos demasiado rápidos
}

export function normalizeGameplaySettings(rawSettings = {}) {
  const safe = rawSettings && typeof rawSettings === "object" ? rawSettings : {};
  const rawNeeds =
    safe.citizenNeedsPerTurn && typeof safe.citizenNeedsPerTurn === "object"
      ? safe.citizenNeedsPerTurn
      : {};

  return {
    serviceHappinessPerTurn: normalizeNeed(
      safe.serviceHappinessPerTurn,
      DEFAULT_GAMEPLAY_SETTINGS.serviceHappinessPerTurn,
    ),
    citizenNeedsPerTurn: {
      water: normalizeNeed(rawNeeds.water, DEFAULT_GAMEPLAY_SETTINGS.citizenNeedsPerTurn.water),
      electricity: normalizeNeed(
        rawNeeds.electricity,
        DEFAULT_GAMEPLAY_SETTINGS.citizenNeedsPerTurn.electricity,
      ),
      food: normalizeNeed(rawNeeds.food, DEFAULT_GAMEPLAY_SETTINGS.citizenNeedsPerTurn.food),
    },
    maxCitizensGeneratedPerTurn: normalizeMaxCitizens(
      safe.maxCitizensGeneratedPerTurn,
      DEFAULT_GAMEPLAY_SETTINGS.maxCitizensGeneratedPerTurn,
    ),
    turnDurationMs: normalizeTurnDuration(
      safe.turnDurationMs,
      DEFAULT_GAMEPLAY_SETTINGS.turnDurationMs,
    ),
  };
}

export function getDefaultGameplaySettings() {
  return normalizeGameplaySettings(DEFAULT_GAMEPLAY_SETTINGS);
}

export function loadGameplaySettings() {
  try {
    const raw = LocalStorage.loadData(GAMEPLAY_SETTINGS_KEY);
    if (!raw) return getDefaultGameplaySettings();
    const parsed = JSON.parse(raw);
    return normalizeGameplaySettings(parsed);
  } catch {
    return getDefaultGameplaySettings();
  }
}

export function saveGameplaySettings(settings) {
  const normalized = normalizeGameplaySettings(settings);
  LocalStorage.saveData(GAMEPLAY_SETTINGS_KEY, JSON.stringify(normalized));
  return normalized;
}
