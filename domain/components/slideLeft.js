import { resourceMenu } from "./slideLeft/Resource.js";
import { SlideLeftController } from "../controllers/SlideLeftController.js";
import { Logger } from "../utilis/Logger.js";

const createSlideLeftMenu = (resource, icons) => {
  const fragment = document.createElement("div");
  const sheets = document.styleSheets[1];

  fragment.classList.add("container");

  const menuSlot = document.createElement("div");
  menuSlot.classList.add("menu-slot");
  fragment.appendChild(menuSlot);

  fragment.appendChild(resourceMenu(resource, icons, sheets));

  return fragment;
};

export const renderSlideLeftMenu = (
  resource,
  icons,
  builds,
  containerSelector = "#slide-left",
) => {
  Logger.log("🏛️ [SlideLeft] Renderizando menú...");
  const container = document.querySelector(containerSelector);
  if (!container) {
    Logger.error("❌ [SlideLeft] Container no encontrado:", containerSelector);
    return;
  }

  container.querySelector(".container")?.remove();
  container.prepend(createSlideLeftMenu(resource, icons, builds));

  // Start reactive updates for resource values
  SlideLeftController.startResourceWatcher(container, resource);
  Logger.log("✅ [SlideLeft] Menú renderizado");
};
