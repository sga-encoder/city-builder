import { ToastService } from "../toast.js";
import { LocalStorage } from "../../../database/localStorage.js";
import { fetchTopHeadlines } from "../../../database/newsApi.js";
import { News } from "../../../models/News.js";
import {
  EXTERNAL_API_CONFIG,
  getCityLocationFromStorage,
  readApiKeys,
} from "./config.js";

export class NewsService {
  static observers = new Set();
  static intervalId = null;
  static initialized = false;
  static cityQuery = EXTERNAL_API_CONFIG.DEFAULT_NEWS_QUERY;
  static lastToastAt = 0;

  static state = {
    status: "idle",
    data: [],
    error: null,
    updatedAt: null,
    source: "live",
  };

  static init() {
    if (this.initialized) return;
    const location = getCityLocationFromStorage();
    this.cityQuery = String(location.cityQuery || EXTERNAL_API_CONFIG.DEFAULT_NEWS_QUERY).toLowerCase();
    this.initialized = true;
    this.fetchNow();
    this.startAutoRefresh();
  }

  static startAutoRefresh() {
    this.stopAutoRefresh();
    this.intervalId = setInterval(() => {
      this.fetchNow();
    }, EXTERNAL_API_CONFIG.NEWS_REFRESH_MS);
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
    return { ...this.state, data: [...this.state.data] };
  }

  static notify() {
    const snapshot = this.getSnapshot();
    this.observers.forEach((callback) => {
      try {
        callback(snapshot);
      } catch {
        // Evita que un observer rompa el ciclo.
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

  static mapArticles(articles = []) {
    return News.fromArray(articles, { source: "api", max: 5 })
      .filter((article) => article.isValid())
      .map((article) => article.toJSON());
  }

  static normalizeCachedArticles(articles = []) {
    return News.fromArray(articles, { source: "stored", max: 5 })
      .filter((article) => article.isValid())
      .map((article) => article.toJSON());
  }

  static async fetchNow() {
    const { newsKey } = readApiKeys();
    const location = getCityLocationFromStorage();
    this.cityQuery = String(location.cityQuery || EXTERNAL_API_CONFIG.DEFAULT_NEWS_QUERY).toLowerCase();

    if (!newsKey) {
      const cached = LocalStorage.loadCache(EXTERNAL_API_CONFIG.STORAGE_KEYS.NEWS_CACHE);
      const cachedArticles = this.normalizeCachedArticles(cached?.data || []);
      this.setState({
        status: cachedArticles.length ? "success" : "error",
        data: cachedArticles,
        error: "Falta NEWS_API_KEY en variables de entorno del cliente.",
        updatedAt: cached?.updatedAt || null,
        source: cachedArticles.length ? "cache" : "live",
      });
      this.showErrorToast("News: configura NEWS_API_KEY");
      return;
    }

    this.setState({ status: "loading", error: null });

    const result = await fetchTopHeadlines({
      cityQuery: this.cityQuery,
      apiKey: newsKey,
      pageSize: 5,
      timeoutMs: EXTERNAL_API_CONFIG.REQUEST_TIMEOUT_MS,
    });

    if (!result.ok) {
      const cached = LocalStorage.loadCache(EXTERNAL_API_CONFIG.STORAGE_KEYS.NEWS_CACHE);
      const cachedArticles = this.normalizeCachedArticles(cached?.data || []);
      this.setState({
        status: cachedArticles.length ? "success" : "error",
        data: cachedArticles,
        error: `News error: ${result.error}`,
        updatedAt: cached?.updatedAt || null,
        source: cachedArticles.length ? "cache" : "live",
      });
      this.showErrorToast("No se pudieron actualizar las noticias en vivo");
      return;
    }

    const mapped = this.mapArticles(result.data?.articles || []);
    const updatedAt = Date.now();

    LocalStorage.saveCache(EXTERNAL_API_CONFIG.STORAGE_KEYS.NEWS_CACHE, {
      updatedAt,
      data: mapped,
    });

    this.setState({
      status: "success",
      data: mapped,
      error: null,
      updatedAt,
      source: "live",
    });
  }
}
