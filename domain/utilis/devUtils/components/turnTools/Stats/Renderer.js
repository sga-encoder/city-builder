import { TurnToolsStatsBuilder } from "./Builder.js";
import { TurnToolsStatsController } from "../../../controller/turnTools/Stats.js";

export class TurnToolsStats {
  static render() {
    const devToolsContainer = document.getElementById("dev-tools");
    devToolsContainer.querySelector("#turn-stats-panel")?.remove();
    const statsPanel = TurnToolsStatsBuilder.build();
    devToolsContainer.appendChild(statsPanel);
  }

  static destroy() {
    const panel = document.getElementById("turn-stats-panel");
    if (panel) panel.remove();
  }

  static update(state, city, diff) {
    TurnToolsStatsController.update(state, city, diff);
  }
}