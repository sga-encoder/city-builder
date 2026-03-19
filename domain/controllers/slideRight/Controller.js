import { Logger } from "../../utilis/Logger.js";

export class SlideRightController {
    static handleClickStatsButton(btn, MainContainer, statsPanel) {
        if (btn && MainContainer) {
            btn.addEventListener("click", () => {
                const statsContainer = MainContainer.querySelector("#stats-container");
                if (statsContainer) {
                    statsPanel.destroy(MainContainer);
                } else {
                    statsPanel.render(MainContainer);
                }
            });
        }
    }

    static initialize(MainContainer, statsManager) {
        Logger.log("🎛️ [SlideRight] Initializing controller...");
        const statsButton = document.querySelector("#stats");
        this.handleClickStatsButton(statsButton, MainContainer, statsManager);
        Logger.log("✅ [SlideRight] Controller initialized");
    }
}