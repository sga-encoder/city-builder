import { Logger } from "../../utilis/Logger.js";
import { SlideRightBuilder } from "./Builder.js";
import { SlideRightController } from "../../controllers/slideRight/Controller.js";
import { StatsPanel } from "./statsPanel/Renderer.js";
import { WeatherPanel } from "./weather/Renderer.js";
import { NewsPanel } from "./news/Renderer.js";
import { WeatherService } from "../../services/externalAPIs/WeatherService.js";
import { NewsService } from "../../services/externalAPIs/NewsService.js";

export class SlideRight {
  static render(icons, builds, containerSelector = "#slide-right") {
    Logger.log("🔲 [SlideRight] Renderizando menú...");
    const container = document.querySelector(containerSelector);
    if (!container) {
      Logger.error("❌ [SlideRight] Container no encontrado:", containerSelector);
      return;
    }
    container.prepend(SlideRightBuilder.build(icons));
    WeatherService.init();
    NewsService.init();
    Logger.log("✅ [SlideRight] Menú renderizado");
    SlideRightController.initialize(
      container,
      StatsPanel,
      icons,
      builds,
      WeatherPanel,
      WeatherService,
      NewsPanel,
      NewsService,
    );
  }
}
