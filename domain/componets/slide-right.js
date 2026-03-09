const createSlideRightMenu = (icons) => { 
    const containerButton = document.createElement("div");
    const sheets = document.styleSheets[2];
    containerButton.classList.add("container");
    const menuItems = ["statistics","weather.sunny","news",];

    menuItems.forEach((id, index) => {
        containerButton.appendChild(button(id, index + 1, icons, sheets));
    });

    return containerButton;

}

const renderSlideRightMenu = (icons, containerSelector = "#slide-right") => {
  Logger.log("🔲 [SlideRight] Renderizando menú...");
  const container = document.querySelector(containerSelector);
  if (!container) {
    Logger.error("❌ [SlideRight] Container no encontrado:", containerSelector);
    return;
  }
  container.prepend(createSlideRightMenu(icons));
  Logger.log("✅ [SlideRight] Menú renderizado");
};

window.renderSlideRightMenu = renderSlideRightMenu;