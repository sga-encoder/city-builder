import { Button } from "../../Button.js";

function createInfoButton(sheets) {
  const btn = document.createElement("div");
  btn.id = "info";
  btn.classList.add("button", "info");

  const dynamicRule = `#info{ --i:2; }`;
  const targetSheet = sheets || document.styleSheets[0];
  if (targetSheet) {
    try {
      targetSheet.insertRule(dynamicRule, targetSheet.cssRules.length);
    } catch {
      // Ignore CSS insertion failures and keep the button usable.
    }
  }

  const imgContainer = document.createElement("div");
  imgContainer.classList.add("img-container");
  imgContainer.textContent = "Info";

  btn.appendChild(imgContainer);
  return btn;
}

export class SlideLeftManageMenuBuilder {
  static build(icons, sheets) {
    const containerButton = document.createElement("div");
    containerButton.classList.add("container-buttons", "menu-02");

    const moveButton = Button.build("move", 0, icons, sheets);
    const infoButton = createInfoButton(sheets);
    const destroyButton = Button.build("destroy", 3, icons, sheets);

    containerButton.appendChild(moveButton);
    containerButton.appendChild(infoButton);
    containerButton.appendChild(destroyButton);
    return containerButton;
  }
}