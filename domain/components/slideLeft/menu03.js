import { Map } from "../../../models/Map.js";
import { button } from "../button.js";

const buttonBuy = (id, index, icons, sheets, instance) => { 
  const btn = button(id, index, icons, sheets, !id[1] ? id : `${id[0]}.${id[1]}`);

  const price = document.createElement("span");
  price.classList.add("price");
  price.textContent = `$${instance.cost}`;
  btn.appendChild(price);
  return btn;
}


export const createMenu03 = (icons, sheets) => {
  const containerButton = document.createElement("div");
  containerButton.classList.add("container-buttons", "menu-03");

  Map.buildingInstanceMap().forEach(([id, instance], index) => {
    if (id === "g") return; // Omitir el tipo "g" (terreno) en el menú de construcción
    containerButton.appendChild(
      buttonBuy(id, index, icons, sheets, instance),
    );
  });

  return containerButton;
};
