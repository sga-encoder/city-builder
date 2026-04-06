import { Map } from "../../../../models/Map.js";
import { Button } from "../../Button.js";

export class SlideLeftSelectionBuildingMenuBuilder {

  static #buildMetaText(instance) {
    if (instance.type === "U") {
      return `${instance.name} | +${instance.production || 0} ${instance.unit}/turno`;
    }

    if (instance.type === "I") {
      return `${instance.name} | Empleos: ${instance.capacity || 0} | ${instance.production || 0} ${instance.unit}/turno`;
    }

    if (instance.type === "C") {
      return `${instance.name} | Empleos: ${instance.capacity || 0} | +${instance.unit} ${instance.production || 0}/turno`;
    }

    if (instance.type === "R") {
      return `${instance.name} | Capacidad: ${instance.capacity || 0}`;
    }

    if (instance.type === "S") {
      const radius = Number(instance.radius || 0);
      const happiness = Number(instance.benefit || 10);
      return `${instance.name} | Radio: ${radius}x${radius} | +${happiness} felicidad`;
    }

    if (instance.type === "P") {
      const happiness = Number(instance.benefit || 5);
      return `${instance.name} | +${happiness} felicidad | Sin consumo`;
    }

    return "";
  }


  static #buttonBuy(id, index, icons, sheets, instance) {
    const btn = Button.build(id, index, icons, sheets, !id[1] ? id : `${id[0]}.${id[1]}`);

    const price = document.createElement("span");
    price.classList.add("price");
    price.textContent = `$${instance.cost}`;
    btn.appendChild(price);

    const metaText = this.#buildMetaText(instance);
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
