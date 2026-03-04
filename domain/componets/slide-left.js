const button = (id, src, num) => {
  const btn = document.createElement("div");
  btn.classList.add("button");
  btn.id = id;
  btn.style.setProperty("--i", num);

  const imgContainer = document.createElement("div");
  imgContainer.classList.add("img-container");
  const img = document.createElement("img");
  img.src = src;
  img.alt = id;
  imgContainer.appendChild(img);
  btn.appendChild(imgContainer);
  return btn;
};

const createMenu01 = () => {
  const containerButton = document.createElement("div");
  containerButton.classList.add("container-buttons", "menu-01");

  const buildButton = button("build", "../../public/icons/build.svg", 1);

  containerButton.appendChild(buildButton);
  return containerButton;
};

const createMenu02 = () => {
  const containerButton = document.createElement("div");
  containerButton.classList.add("container-buttons", "menu-02");
  const moveButton = button("move", "../../public/icons/move.svg", 1);
  const destroyButton = button("destroy", "../../public/icons/destroy.svg", 2);

  containerButton.appendChild(moveButton);
  containerButton.appendChild(destroyButton);
  return containerButton;
};

const createMenu03 = () => {
  const containerButton = document.createElement("div");
  containerButton.classList.add("container-buttons", "menu-03");

  const menuItems = [
    ["R1", "../../public/models/house_land.svg"],
    ["R2", "../../public/models/apartaments_land.svg"],
    ["C1", "../../public/models/store_land.svg"],
    ["C2", "../../public/models/mall_land.svg"],
    ["I1", "../../public/models/factory_land.svg"],
    ["I2", "../../public/models/farm_land.svg"],
    ["P1", "../../public/models/park_land.svg"],
    ["S1", "../../public/models/police_station_land.svg"],
    ["S2", "../../public/models/fire_station_land.svg"],
    ["S3", "../../public/models/hospital_land.svg"],
    ["U1", "../../public/models/energy_land.svg"],
    ["U2", "../../public/models/water_land.svg"],
    ["r", "../../public/models/way_land.svg"],
  ];

  menuItems.forEach(([id, src], index) => {
    containerButton.appendChild(button(id, src, index + 1));
  });

  return containerButton;
};

const createSlideLeftMenu = () => {
  const fragment = document.createDocumentFragment();
  fragment.appendChild(createMenu01());
  fragment.appendChild(createMenu02());
  fragment.appendChild(createMenu03());
  return fragment;
};

const renderSlideLeftMenu = (containerSelector = "#slide-left .container") => {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  container.querySelector(".menu-01")?.remove();
  container.querySelector(".menu-02")?.remove();
  container.querySelector(".menu-03")?.remove();
  container.prepend(createSlideLeftMenu());
};

window.createSlideLeftMenu = createSlideLeftMenu;
window.renderSlideLeftMenu = renderSlideLeftMenu;
