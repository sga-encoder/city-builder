export class BuildingInfoPanelBuilder {
  static build(payload) {
    try {
      const overlay = document.createElement("div");
      overlay.id = "building-info-overlay";

      const panel = document.createElement("div");
      panel.id = "building-info-panel";

      const title = document.createElement("h3");
      title.classList.add("building-info-title");
      title.textContent = payload.title;

      const grid = document.createElement("div");
      grid.classList.add("building-info-grid");

      if (Array.isArray(payload.rows)) {
        payload.rows.forEach((row) => {
          try {
            const label = document.createElement("span");
            label.classList.add("label");
            label.textContent = String(row.label || "");

            const value = document.createElement("span");
            value.classList.add("value");
            value.textContent = String(row.value || "");

            grid.appendChild(label);
            grid.appendChild(value);
          } catch (rowError) {
            console.warn("[BuildingInfoPanelBuilder] Error en fila:", rowError);
          }
        });
      }

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
    } catch (error) {
      console.error("[BuildingInfoPanelBuilder] Error construyendo panel:", error);
      const fallback = document.createElement("div");
      fallback.id = "building-info-overlay";
      fallback.textContent = "Error al cargar información del edificio";
      return fallback;
    }
  }
}
