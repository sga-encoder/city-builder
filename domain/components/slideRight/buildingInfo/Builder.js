export class BuildingInfoPanelBuilder {
  static build(payload) {
    const overlay = document.createElement("div");
    overlay.id = "building-info-overlay";

    const panel = document.createElement("div");
    panel.id = "building-info-panel";

    const title = document.createElement("h3");
    title.classList.add("building-info-title");
    title.textContent = payload.title;

    const grid = document.createElement("div");
    grid.classList.add("building-info-grid");

    payload.rows.forEach((row) => {
      const label = document.createElement("span");
      label.classList.add("label");
      label.textContent = row.label;

      const value = document.createElement("span");
      value.classList.add("value");
      value.textContent = row.value;

      grid.appendChild(label);
      grid.appendChild(value);
    });

    const actions = document.createElement("div");
    actions.classList.add("building-info-actions");

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.classList.add("close-btn");
    closeBtn.textContent = "Cerrar";

    const destroyBtn = document.createElement("button");
    destroyBtn.type = "button";
    destroyBtn.classList.add("destroy-btn");
    destroyBtn.textContent = "Demoler";

    actions.appendChild(closeBtn);
    actions.appendChild(destroyBtn);

    panel.appendChild(title);
    panel.appendChild(grid);
    panel.appendChild(actions);
    overlay.appendChild(panel);

    overlay._closeBtn = closeBtn;
    overlay._destroyBtn = destroyBtn;

    return overlay;
  }
}
