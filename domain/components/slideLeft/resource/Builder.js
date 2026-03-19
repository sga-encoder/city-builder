export class SlideLeftResourceBuilder {
  static #buildResourcesContent(id, text, num, icons, sheets) {
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

  static #buildToggleButton(icons) {
    const btn = document.createElement("div");
    btn.classList.add("resource");
    btn.id = "resource";

    const imgContainer = document.createElement("div");
    imgContainer.classList.add("img-container");

    imgContainer.innerHTML = icons.getModel("resource");

    btn.appendChild(imgContainer);
    return btn;
  }

  static build(resource, icons, sheets) {
    const divResources = document.createElement("div");
    divResources.classList.add("resources");
    const ul = document.createElement("ul");

    const resourceElements = {};

    Object.keys(resource).forEach((id, index) => {
      const li = this.#buildResourcesContent(id, "...", index, icons, sheets);
      resourceElements[id] = li;
      ul.appendChild(li);
    });

    divResources.appendChild(ul);
    divResources.appendChild(this.#buildToggleButton(icons));

    divResources._resourceObjects = resource;
    divResources._resourceElements = resourceElements;

    return divResources;
  }
}
