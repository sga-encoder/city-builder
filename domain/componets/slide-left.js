const createSlideLeftMenu = (resource, icons, build) => {
  const fragment = document.createElement("div");
  const sheets = document.styleSheets[1];

  fragment.classList.add("container");
  fragment.appendChild(createMenu01(icons, sheets));
  fragment.appendChild(createMenu02(icons, sheets));
  fragment.appendChild(createMenu03(build, sheets));
  fragment.appendChild(resourceMenu(resource, icons, sheets));
  return fragment;
};

const renderSlideLeftMenu = (
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

  container.querySelector(".menu-01")?.remove();
  container.querySelector(".menu-02")?.remove();
  container.querySelector(".menu-03")?.remove();
  container.prepend(createSlideLeftMenu(resource, icons, builds));

  // Start reactive updates for resource values
  SlideLeftController.startResourceWatcher(container, resource);
  Logger.log("✅ [SlideLeft] Menú renderizado");
};

window.renderSlideLeftMenu = renderSlideLeftMenu;