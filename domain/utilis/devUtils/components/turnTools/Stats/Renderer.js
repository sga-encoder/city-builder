import { TurnToolsStatsBuilder } from "./Builder.js";
import { TurnToolsStatsController } from "../../../controller/turnTools/Stats.js";

export class TurnToolsStats {
  static lastPayload = null;

  static reset() {
    this.lastPayload = null;
  }

  static render() {
    const devToolsContainer = document.getElementById("dev-tools");
    if (!devToolsContainer) return;

    devToolsContainer.querySelector("#turn-stats-panel")?.remove();
    const statsPanel = TurnToolsStatsBuilder.build();
    devToolsContainer.appendChild(statsPanel);

    if (this.lastPayload) {
      TurnToolsStatsController.update(
        this.lastPayload.state,
        this.lastPayload.city,
        this.lastPayload.diff,
      );
    }
  }

  static destroy() {
    const panel = document.getElementById("turn-stats-panel");
    if (panel) panel.remove();
  }

  static update(state, city, diff) {
    this.lastPayload = { state, city, diff };
    TurnToolsStatsController.update(state, city, diff);
  }
}