import { Button } from "../../Button.js";

export class SlideLeftBuildMenuBuilder {
  static build(icons, sheets) {
    const containerButton = document.createElement("div");
    containerButton.classList.add("container-buttons", "menu-01");

    const buildButton = Button.build("build", 0, icons, sheets);

    containerButton.appendChild(buildButton);
    return containerButton;
  }
}
