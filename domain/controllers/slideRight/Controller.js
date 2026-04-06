import { Logger } from "../../utilis/Logger.js";
import { runPressAnimation } from "../../utilis/runPressAnimation.js";

export class SlideRightController {
    static handleClickStatsButton(btn, MainContainer, statsPanel, icons, builds) {
        if (btn && MainContainer) {
            btn.addEventListener("click", async () => {
                await runPressAnimation(btn);
                const statsContainer = MainContainer.querySelector("#stats-container");
                const imgContainer = btn.querySelector(".img-container");
                if (statsContainer) {
                    statsPanel.destroy(MainContainer);
                    // Cambia el SVG al estado inactivo
                    if (imgContainer) imgContainer.innerHTML = icons.getModel("stats");
                } else {
                    statsPanel.render(MainContainer, builds, icons);
                    // Cambia el SVG al estado activo
                    if (imgContainer) imgContainer.innerHTML = icons.getModel("close");
                }
            });
        }
    }

    static handleClickNewsButton(btn) {
        if (!btn) return;
        btn.addEventListener("click", async () => {
            await runPressAnimation(btn);
        });
    }

    static initialize(MainContainer, statsManager, icons, builds) {
        Logger.log("🎛️ [SlideRight] Initializing controller...");
        const statsButton = document.querySelector("#stats");
        const newsButton = document.querySelector("#news");
        this.handleClickStatsButton(statsButton, MainContainer, statsManager, icons, builds);
        this.handleClickNewsButton(newsButton);
        Logger.log("✅ [SlideRight] Controller initialized");
    }
}