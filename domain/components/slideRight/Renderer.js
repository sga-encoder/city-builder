import { Logger } from "../../utilis/Logger.js";
import { SlideRightBuilder } from "./Builder.js";

export class SlideRight {
  static render(icons, containerSelector = "#slide-right") {
    Logger.log("🔲 [SlideRight] Renderizando menú...");
    const container = document.querySelector(containerSelector);
    if (!container) {
      Logger.error("❌ [SlideRight] Container no encontrado:", containerSelector);
      return;
    }
    container.prepend(SlideRightBuilder.build(icons));
    Logger.log("✅ [SlideRight] Menú renderizado");
  }
}
