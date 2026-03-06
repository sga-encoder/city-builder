const buttonSlideRight = (id, url) => {
    const div = document.createElement("div");
    div.classList.add("button");
    div.id = id;
    const img = document.createElement("img");
    img.src = "../../public/icons/house.svg";
    img.alt = "house";
    div.appendChild(img);
    return div;
}

const createSlideRightMenu = () => { 
    const containerButton = document.createElement("div");
    containerButton.classList.add("container");
    const menuItems = [
      ["statistics", "../../public/icons/statistics.svg"],
      ["weather", "../../public/icons/weather/weather-partly-cloudy-night.svg"],
      ["news", "../../public/icons/news.svg"],
    ];

    menuItems.forEach(([id, src], index) => {
        containerButton.appendChild(button(id, src, index + 1));
    });

    return containerButton;

}

const renderSlideRightMenu = (containerSelector = "#slide-right") => {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  container.prepend(createSlideRightMenu());
};

window.renderSlideRightMenu = renderSlideRightMenu;
window.createSlideRightMenu = createSlideRightMenu;