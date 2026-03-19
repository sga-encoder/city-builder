import { Logger } from "../../utilis/Logger.js";

export class SlideRightController {
    static handleClickStatsButton(container, btn) {
        if (btn && container) {
            btn.addEventListener("click", () => {
                container.classList.toggle("active");
            });
        }
    }

    static initialize() {
        Logger.log("🎛️ [SlideRight] Initializing controller...");
        const statsContainer = document.querySelector("#slide-right #stats-container");
        const statsButton = document.querySelector("#stats");
        this.handleClickStatsButton(statsContainer, statsButton);
        Logger.log("✅ [SlideRight] Controller initialized");
        // Aquí puedes agregar cualquier lógica de inicialización adicional si es necesario
    }
}