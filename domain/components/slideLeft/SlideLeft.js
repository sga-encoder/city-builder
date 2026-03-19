
import { Resource } from "./Resource.js";
import { SlideLeftController } from "../../controllers/SlideLeftController.js";
import { Logger } from "../../utilis/Logger.js";

export class SlideLeft {
  static #build(resource, icons) {
    const fragment = document.createElement("div");
    const sheets = document.styleSheets[0];

    fragment.classList.add("container");

    const menuSlot = document.createElement("div");
    menuSlot.classList.add("menu-slot");
    fragment.appendChild(menuSlot);

    fragment.appendChild(Resource.build(resource, icons, sheets));

    return fragment;
  }

  static render(resource, icons, builds, containerSelector = "#slide-left") {
    Logger.log("🏛️ [SlideLeft] Renderizando menú...");
    const container = document.querySelector(containerSelector);
    if (!container) {
      Logger.error("❌ [SlideLeft] Container no encontrado:", containerSelector);
      return;
    }

    container.querySelector(".container")?.remove();
    container.prepend(this.#build(resource, icons, builds));

    // Start reactive updates for resource values
    SlideLeftController.startResourceWatcher(container, resource);
    Logger.log("✅ [SlideLeft] Menú renderizado");
  }
}
