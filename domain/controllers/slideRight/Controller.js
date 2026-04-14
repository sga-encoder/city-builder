import { Logger } from "../../utilis/Logger.js";
import { runPressAnimation } from "../../utilis/runPressAnimation.js";

export class SlideRightController {
    static #resolveWeatherIconKey(weatherService, icons) {
        const snapshot = typeof weatherService?.getSnapshot === "function"
            ? weatherService.getSnapshot()
            : null;
        const iconKey = snapshot?.data?.iconKey || "weather.sunny";

        if (icons?.hasModel && icons.hasModel(iconKey)) {
            return iconKey;
        }

        return "weather.sunny";
    }

    static #setWeatherButtonIcon(btn, weatherService, icons) {
        if (!btn) return;
        const imgContainer = btn.querySelector(".img-container");
        if (!imgContainer) return;

        const weatherContainer = document.querySelector("#weather-container");
        if (weatherContainer) {
            imgContainer.innerHTML = icons.getModel("close");
            return;
        }

        const iconKey = this.#resolveWeatherIconKey(weatherService, icons);
        imgContainer.innerHTML = icons.getModel(iconKey);
    }

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

    static handleClickNewsButton(btn, MainContainer, newsPanel, newsService, icons) {
        if (!btn || !MainContainer) return;
        btn.addEventListener("click", async () => {
            await runPressAnimation(btn);
            const newsContainer = MainContainer.querySelector("#news-container");
            const imgContainer = btn.querySelector(".img-container");

            if (newsContainer) {
                newsPanel.destroy(MainContainer);
                if (imgContainer) imgContainer.innerHTML = icons.getModel("news");
            } else {
                newsPanel.render(MainContainer, newsService);
                if (imgContainer) imgContainer.innerHTML = icons.getModel("close");
            }
        });
    }

    static handleClickWeatherButton(btn, MainContainer, weatherPanel, weatherService, icons) {
        if (!btn || !MainContainer) return;

        if (!btn._weatherIconSubscribed) {
            weatherService.addObserver(() => {
                this.#setWeatherButtonIcon(btn, weatherService, icons);
            });
            btn._weatherIconSubscribed = true;
        }

        this.#setWeatherButtonIcon(btn, weatherService, icons);

        btn.addEventListener("click", async () => {
            await runPressAnimation(btn);

            const weatherContainer = MainContainer.querySelector("#weather-container");

            if (weatherContainer) {
                weatherPanel.destroy(MainContainer);
                this.#setWeatherButtonIcon(btn, weatherService, icons);
            } else {
                weatherPanel.render(MainContainer, weatherService);
                this.#setWeatherButtonIcon(btn, weatherService, icons);
            }
        });
    }

    static initialize(MainContainer, statsManager, icons, builds, weatherPanel, weatherService, newsPanel, newsService) {
        Logger.log("🎛️ [SlideRight] Initializing controller...");
        const statsButton = document.querySelector("#stats");
        const newsButton = document.querySelector("#news");
        const weatherButton = document.querySelector("#weather");
        this.handleClickStatsButton(statsButton, MainContainer, statsManager, icons, builds);
        this.handleClickWeatherButton(weatherButton, MainContainer, weatherPanel, weatherService, icons);
        this.handleClickNewsButton(newsButton, MainContainer, newsPanel, newsService, icons);
        Logger.log("✅ [SlideRight] Controller initialized");
    }
}