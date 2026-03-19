import { Map } from "../../../../models/Map.js";
import { Button } from "../../Button.js";

export class SlideLeftSelectionBuildingMenuBuilder {
  static utilityCatalog = {
    U1: {
      name: "Planta Electrica",
      unit: "energia",
    },
    U2: {
      name: "Planta de Agua",
      unit: "agua",
    },
  };

  static commercialCatalog = {
    C1: {
      name: "Tienda",
      jobs: 6,
      income: 500,
    },
    C2: {
      name: "Centro Comercial",
      jobs: 20,
      income: 2000,
    },
  };

  static #buttonBuy(id, index, icons, sheets, instance) {
    const btn = Button.build(id, index, icons, sheets, !id[1] ? id : `${id[0]}.${id[1]}`);

    const price = document.createElement("span");
    price.classList.add("price");
    price.textContent = `$${instance.cost}`;
    btn.appendChild(price);
    const utilityInfo = this.utilityCatalog[id];
    if (utilityInfo) {
      const meta = document.createElement("span");
      meta.classList.add("utility-meta");
      meta.textContent = `${utilityInfo.name} | +${Number(instance.production || 0)} ${utilityInfo.unit}/turno`;
      btn.appendChild(meta);
    }

    const commercialInfo = this.commercialCatalog[id];
    if (commercialInfo) {
      const meta = document.createElement("span");
      meta.classList.add("utility-meta");
      meta.textContent =
        `${commercialInfo.name} | Empleos: ${commercialInfo.jobs} | +$${commercialInfo.income}/turno`;
      btn.appendChild(meta);
    }

    return btn;
  }

  static build(icons, sheets) {
    const containerButton = document.createElement("div");
    containerButton.classList.add("container-buttons", "menu-03");

    Map.buildingInstanceMap().forEach(([id, instance], index) => {
      if (id === "g") return; // Omitir el tipo "g" (terreno) en el menú de construcción
      containerButton.appendChild(
        this.#buttonBuy(id, index, icons, sheets, instance)
      );
    });

    return containerButton;
  }
}
