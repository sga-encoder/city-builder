class SlideLeftResourceWatcher {
  static start(container, resourceObjects) {
    if (!resourceObjects || !container) return;

    const resourcesDiv = container.querySelector(".resources");
    if (!resourcesDiv || !resourcesDiv._resourceElements) return;

    const resourceElements = resourcesDiv._resourceElements;

    const createUpdateCallback = (type, unit) => {
      return (newValue) => {
        if (resourceElements[type]) {
          const li = resourceElements[type];
          const contentP = li.querySelector(".content");
          if (contentP) {
            contentP.textContent = newValue + unit;
          }
        }
      };
    };

    Object.keys(resourceObjects).forEach((resource) => {
      const { type, unit, amount } = resourceObjects[resource];
      const callback = createUpdateCallback(type, unit);

      resourceObjects[resource].addObserver(callback);

      if (!resourcesDiv._observerCallbacks) {
        resourcesDiv._observerCallbacks = {};
      }
      resourcesDiv._observerCallbacks[type] = callback;

      const contentP = resourceElements[type]?.querySelector(".content");
      if (contentP) contentP.textContent = amount + unit;
    });
  }
}
