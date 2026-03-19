import { Button } from "../../Button.js";

export class SlideLeftManageMenuBuilder {
  static build(icons, sheets) {
    const containerButton = document.createElement("div");
    containerButton.classList.add("container-buttons", "menu-02");

    const moveButton = Button.render("move", 0, icons, sheets);
    const destroyButton = Button.render("destroy", 1, icons, sheets);

    containerButton.appendChild(moveButton);
    containerButton.appendChild(destroyButton);
    return containerButton;
  }
}