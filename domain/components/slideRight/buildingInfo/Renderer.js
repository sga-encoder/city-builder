import { BuildingInfoPanelBuilder } from "./Builder.js";

export class BuildingInfoPanel {
  static render(container, payload) {
    if (!container) return;

    this.destroy(container);

    try {
      const overlay = BuildingInfoPanelBuilder.build(payload);

      overlay.addEventListener("click", (event) => {
        if (event.target === overlay) {
          this.destroy(container);
        }
      });

      overlay._closeBtn?.addEventListener("click", () => {
        this.destroy(container);
        payload.onClose?.();
      });

      overlay._destroyBtn?.addEventListener("click", () => {
        payload.onDemolish?.();
      });

      container.appendChild(overlay);
    } catch (error) {
      console.error("[BuildingInfoPanel] Error renderizando panel:", error);
    }
  }

  static destroy(container) {
    const panel = container?.querySelector("#building-info-overlay");
    if (panel) panel.remove();
  }
}
