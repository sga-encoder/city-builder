import { Button } from "../Button.js";
export const createMenu01 = (icons, sheets) => {
  const containerButton = document.createElement("div");
  containerButton.classList.add("container-buttons", "menu-01");

  const buildButton = Button.render("build", 0, icons, sheets);

  containerButton.appendChild(buildButton);
  return containerButton;
};
