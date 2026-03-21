import { StatsManager } from "../../../services/StatsManager.js";
import { StatsPanelBuilder } from "./Builder.js";

export class StatsPanel {
    static render(container, builds, icons) {
        if (!container._statsPanelSubscribed) {
            StatsManager.addObserver(() => {
                const statsPanel = container.querySelector("#stats-container");
                if (statsPanel) {
                    // Actualiza el contenido interno, por ejemplo:
                    const stats = StatsManager.getAllStats();
                    const newPanel = StatsPanelBuilder.build(stats, builds, icons);
                    statsPanel.replaceWith(newPanel);
                }
            });
            container._statsPanelSubscribed = true;
        }

        const oldPanel = container.querySelector('#stats-container');
        if (oldPanel) oldPanel.remove();

        const stats = StatsManager.getAllStats();
        const StatsContainer = StatsPanelBuilder.build(stats, builds, icons);
        container.appendChild(StatsContainer);
        console.log("StatsPanel renderizado con datos:", stats);
    }

    static destroy(container) {
        const oldPanel = container.querySelector('#stats-container');
        if (oldPanel) oldPanel.remove();
        console.log("StatsPanel destruido");
    }
}