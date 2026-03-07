const sheets = document.styleSheets[1];
const button = (id, num, icons, iconName = "") => {
  const btn = document.createElement("div");
  btn.id = id;
  btn.classList.add("button");
  btn.classList.add(id)
  if (id.includes(".")) {
    btn.id = id.split(".")[0];
  }
  const rule = `#${id.includes(".")? id.split(".")[0] : id}{ --i:${num}; }`;
  sheets.insertRule(rule, sheets.cssRules.length);

  const imgContainer = document.createElement("div");
  imgContainer.classList.add("img-container");
  imgContainer.innerHTML = iconName === "" ? icons.getModel(id): icons.getModel(iconName);
  btn.appendChild(imgContainer);
  return btn;
};

const createMenu01 = (icons) => {
  const containerButton = document.createElement("div");
  containerButton.classList.add("container-buttons", "menu-01");

  const buildButton = button("build", 1, icons);

  containerButton.appendChild(buildButton);
  return containerButton;
};

const createMenu02 = (icons) => {
  const containerButton = document.createElement("div");
  containerButton.classList.add("container-buttons", "menu-02");

  const moveButton = button("move",  1, icons);
  const destroyButton = button("destroy", 2, icons);

  containerButton.appendChild(moveButton);
  containerButton.appendChild(destroyButton);
  return containerButton;
};

const createMenu03 = (icons) => {
  const containerButton = document.createElement("div");
  containerButton.classList.add("container-buttons", "menu-03");

  const menuItems = ["R1","R2", "C1", "C2", "I1", "I2", "P1", "S1", "S2", "S3", "U1", "U2", "r"];

  menuItems.forEach((id, index) => {
    containerButton.appendChild(
      button(id, index + 1, icons, !id[1] ? id : `${id[0]}.${id[1]}`),
    );

  });

  return containerButton;
};

const resourcesContent = (id, text, num, icons) => {
  const li = document.createElement("li");
  li.classList.add("resource");
  li.id = id;

  const rule = `#${id}{ --i:${num}; }`;
  sheets.insertRule(rule, sheets.cssRules.length);

  const imgContainer = document.createElement("div");
  imgContainer.classList.add("img-container");

  const img = document.createElement("div");
  img.innerHTML = icons.getModel(id);
  imgContainer.appendChild(img);

  const p = document.createElement("p");
  p.textContent = text;
  p.classList.add("content");

  li.appendChild(imgContainer);
  li.appendChild(p);
  return li;
}

const resourcesBotton = (icons) => {
  const btn = document.createElement("div");
  btn.classList.add("resource");
  btn.id = "resource";

  const imgContainer = document.createElement("div");
  imgContainer.classList.add("img-container");

  imgContainer.innerHTML = icons.getModel("resource");

  btn.appendChild(imgContainer);
  return btn;
}

const resourceMenu = (icons) => {
  const divResources = document.createElement("div");
  divResources.classList.add("resources");
  const ul = document.createElement("ul");
  const resources = [
    ["money", "$100.000"],
    ["energy", "120/200 kWh"],
    ["water", "80/150 m³"],
    ["food", "50 kg"],
  ];
  resources.forEach(([id, text], index) => {
    ul.appendChild(resourcesContent(id, text, index + 1, icons));
  })
  divResources.appendChild(ul);
  divResources.appendChild(resourcesBotton(icons));
  return divResources;
};

const createSlideLeftMenu = (icons, build) => {
  const fragment = document.createElement("div");
  
  fragment.classList.add("container")
  fragment.appendChild(createMenu01(icons));
  fragment.appendChild(createMenu02(icons));
  fragment.appendChild(createMenu03(build));
  fragment.appendChild(resourceMenu(icons));
  return fragment;
};

const renderSlideLeftMenu = (icons, builds, containerSelector = "#slide-left") => {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  container.querySelector(".menu-01")?.remove();
  container.querySelector(".menu-02")?.remove();
  container.querySelector(".menu-03")?.remove();
  container.prepend(createSlideLeftMenu(icons, builds));
};

window.createSlideLeftMenu = createSlideLeftMenu;
window.renderSlideLeftMenu = renderSlideLeftMenu;
