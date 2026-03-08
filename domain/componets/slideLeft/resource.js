const resourcesContent = (id, text, num, icons, sheets) => {
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
};

const resourcesButton = (icons) => {
  const btn = document.createElement("div");
  btn.classList.add("resource");
  btn.id = "resource";

  const imgContainer = document.createElement("div");
  imgContainer.classList.add("img-container");

  imgContainer.innerHTML = icons.getModel("resource");

  btn.appendChild(imgContainer);
  return btn;
};

const resourceMenu = (resource, icons, sheets) => {
  const divResources = document.createElement("div");
  divResources.classList.add("resources");
  const ul = document.createElement("ul");

  // Store DOM references for reactive updates
  const resourceElements = {};

  const resources = [
    ["money", resource.money?.amount || 0, " $"],
    ["energy", resource.energy?.amount || 0, " kWh"],
    ["water", resource.water?.amount || 0, " L"],
    ["food", resource.food?.amount || 0, " kg"],
  ];

  resources.forEach(([id, value, unit], index) => {
    const li = resourcesContent(id, value + unit, index + 1, icons, sheets);
    resourceElements[id] = { element: li, unit };
    ul.appendChild(li);
  });

  divResources.appendChild(ul);
  divResources.appendChild(resourcesButton(icons));

  // Store reference to resource objects and elements for live updates
  divResources.dataset.resourceObjects = JSON.stringify([
    "money",
    "energy",
    "water",
    "food",
  ]);
  divResources._resourceObjects = resource;
  divResources._resourceElements = resourceElements;

  return divResources;
};
