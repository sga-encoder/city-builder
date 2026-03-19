import { Button } from "./Button.js";
import { Logger } from "../utilis/Logger.js";

export class SlideRight {
  static #build(icons) {
    const containerButton = document.createElement("div");
    const sheets = document.styleSheets[2];
    containerButton.classList.add("container");
    const menuItems = ["statistics", "weather.sunny", "news"];

    menuItems.forEach((id, index) => {
      containerButton.appendChild(Button.render(id, index + 1, icons, sheets));
    });

    return containerButton;
  }

  static render(icons, containerSelector = "#slide-right") {
    Logger.log("🔲 [SlideRight] Renderizando menú...");
    const container = document.querySelector(containerSelector);
    if (!container) {
      Logger.error("❌ [SlideRight] Container no encontrado:", containerSelector);
      return;
    }
    container.prepend(this.#build(icons));
    Logger.log("✅ [SlideRight] Menú renderizado");
  }
}
