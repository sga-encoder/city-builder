import { Map } from "../../../../models/Map.js";
import { Button } from "../../Button.js";

export class SlideLeftSelectionBuildingMenuBuilder {
  static #buttonBuy(id, index, icons, sheets, instance) {
    const btn = Button.build(id, index, icons, sheets, !id[1] ? id : `${id[0]}.${id[1]}`);

    const price = document.createElement("span");
    price.classList.add("price");
    price.textContent = `$${instance.cost}`;
    btn.appendChild(price);

    const meta = document.createElement("span");
    meta.classList.add("utility-meta");
    if (instance.type === "U") {
      meta.textContent = `${instance.name} | +${Number(instance.production || 0)} ${instance.unit}/turno`;
      btn.appendChild(meta);
    }
  if (instance.type === "C") {
      meta.textContent =
        `${instance.name} | Empleos: ${instance.capacity} | +$${instance.income}/turno`;
      }
      
    btn.appendChild(meta);
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
