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
  const container = document.querySelector(containerSelector);
  if (!container) return;

  container.querySelector(".menu-01")?.remove();
  container.querySelector(".menu-02")?.remove();
  container.querySelector(".menu-03")?.remove();
  container.prepend(createSlideLeftMenu(resource, icons, builds));

  // Start reactive updates for resource values
  startResourceWatcher(container, resource);
};

const startResourceWatcher = (container, resourceObjects) => {
  if (!resourceObjects || !container) return;

  const resourcesDiv = container.querySelector(".resources");
  if (!resourcesDiv || !resourcesDiv._resourceElements) return;

  const resourceElements = resourcesDiv._resourceElements;
  const resourceTypes = ["money", "energy", "water", "food"];

  // Create update function for each resource type
  const createUpdateCallback = (type, unit) => {
    return (newValue) => {
      if (resourceElements[type]) {
        const li = resourceElements[type].element;
        const contentP = li.querySelector(".content");
        if (contentP) {
          contentP.textContent = newValue + unit;
        }
      }
    };
  };

  // Add observer to each resource object
  resourceTypes.forEach((type) => {
    if (resourceObjects[type]) {
      const unit = resourceElements[type]?.unit || "";
      const callback = createUpdateCallback(type, unit);
      resourceObjects[type].addObserver(callback);

      // Store callback reference for cleanup if needed
      if (!resourcesDiv._observerCallbacks) {
        resourcesDiv._observerCallbacks = {};
      }
      resourcesDiv._observerCallbacks[type] = callback;
    }
  });

  // Initial display with current values
  resourceTypes.forEach((type) => {
    if (resourceObjects[type] && resourceElements[type]) {
      const newValue = resourceObjects[type].amount || 0;
      const unit = resourceElements[type].unit;
      const li = resourceElements[type].element;
      const contentP = li.querySelector(".content");
      if (contentP) {
        contentP.textContent = newValue + unit;
      }
    }
  });
};

window.createSlideLeftMenu = createSlideLeftMenu;
window.renderSlideLeftMenu = renderSlideLeftMenu;
