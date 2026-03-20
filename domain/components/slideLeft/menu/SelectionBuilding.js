import { Map } from "../../../../models/Map.js";
import { Button } from "../../Button.js";

export class SlideLeftSelectionBuildingMenuBuilder {
  static utilityCatalog = {
    U1: {
      name: "Planta Electrica",
      resourceLabel: "energia",
    },
    U2: {
      name: "Planta de Agua",
      resourceLabel: "agua",
    },
  };

  static industryCatalog = {
    I1: {
      name: "Fabrica",
      product: "dinero",
    },
    I2: {
      name: "Granja",
      product: "alimentos",
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

  static residentialCatalog = {
    R1: {
      name: "Casa",
      jobs: 0,
    },
    R2: {
      name: "Apartamento",
      jobs: 0,
    },
  };

  static #buildMetaText(id, instance) {
    if (instance.type === "U") {
      const utilityInfo = this.utilityCatalog[id];
      if (!utilityInfo) return "";
      return `${utilityInfo.name} | +${Number(instance.production || 0)} ${utilityInfo.resourceLabel}/turno`;
    }

    if (instance.type === "I") {
      const industryInfo = this.industryCatalog[id];
      if (!industryInfo) return "";

      const output = Number(instance.benefit || 0);
      const outputLabel = industryInfo.product === "dinero"
        ? `+$${output}`
        : `+${output}`;

      return `${industryInfo.name} | Empleos: ${Number(instance.capacity || 0)} | ${outputLabel} ${industryInfo.product}/turno`;
    }

    if (instance.type === "C") {
      const commercialInfo = this.commercialCatalog[id];
      if (!commercialInfo) return "";
      return `${commercialInfo.name} | Empleos: ${commercialInfo.jobs} | +$${commercialInfo.income}/turno`;
    }

    if (instance.type === "R") {
      const residentialInfo = this.residentialCatalog[id];
      if (!residentialInfo) return "";
      return `${residentialInfo.name} | Capacidad: ${Number(instance.capacity || 0)}`;
    }

    return "";
  }

  static #buttonBuy(id, index, icons, sheets, instance) {
    const btn = Button.build(id, index, icons, sheets, !id[1] ? id : `${id[0]}.${id[1]}`);

    const price = document.createElement("span");
    price.classList.add("price");
    price.textContent = `$${instance.cost}`;
    btn.appendChild(price);

    const metaText = this.#buildMetaText(id, instance);
    if (metaText) {
      const meta = document.createElement("span");
      meta.classList.add("utility-meta");
      meta.textContent = metaText;
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
