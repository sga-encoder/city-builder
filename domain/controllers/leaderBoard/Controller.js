import { LocalStorage } from "../../../database/localStorage.js";
import { LeaderboardService } from "../../services/leaderBoard/LeaderboardService.js";
import { LeaderboardRenderer } from "../../components/leaderBoard/Renderer.js";

export class LeaderboardController {
  constructor() {
    this.renderer = null;
  }

  show(onBackCallback = null, currentCityId = null) {
    const entries = this.getEntries(currentCityId);
    this.renderer = new LeaderboardRenderer();
    this.renderer.render(entries, onBackCallback);
  }

  getEntries(currentCityId = null) {
    const rawCities = LocalStorage.loadData("savedCities");
    if (!rawCities) return { top10: [], currentCity: null, totalCities: 0 };

    try {
      const cities = JSON.parse(rawCities);
      return LeaderboardService.buildEntries(cities, currentCityId);
    } catch {
      return { top10: [], currentCity: null, totalCities: 0 };
    }
  }

  destroy() {
    this.renderer?.destroy?.();
    this.renderer = null;
  }
}