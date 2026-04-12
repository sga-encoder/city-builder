import { LocalStorage } from "../../../database/localStorage.js";
import { LeaderboardService } from "../../services/leaderBoard/LeaderboardService.js";
import { LeaderboardRenderer } from "../../components/leaderBoard/Renderer.js";

export class LeaderboardController {
  constructor() {
    this.renderer = null;
  }

  show(onBackCallback = null) {
    const entries = this.getEntries();
    this.renderer = new LeaderboardRenderer();
    this.renderer.render(entries, onBackCallback);
  }

  getEntries() {
    const rawCities = LocalStorage.loadData("savedCities");
    if (!rawCities) return [];

    try {
      const cities = JSON.parse(rawCities);
      return LeaderboardService.buildEntries(cities);
    } catch {
      return [];
    }
  }

  destroy() {
    this.renderer?.destroy?.();
    this.renderer = null;
  }
}