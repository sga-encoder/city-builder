import { Button } from "../../Button.js";

export class SlideLeftManageMenuBuilder {
  static build(icons, sheets) {
    const containerButton = document.createElement("div");
    containerButton.classList.add("container-buttons", "menu-02");

    const moveButton = Button.build("move", 0, icons, sheets);
    const destroyButton = Button.build("destroy", 1, icons, sheets);

    containerButton.appendChild(moveButton);
    containerButton.appendChild(destroyButton);
    return containerButton;
  }
}