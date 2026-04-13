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
    try {
      const containerButton = document.createElement("div");
      containerButton.classList.add("container-buttons", "menu-02");

      let moveButton, infoButton, destroyButton;
      try {
        moveButton = Button.build("move", 0, icons, sheets);
      } catch (err) {
        console.error("[SlideLeftManageMenuBuilder] Error creando botón move:", err);
        moveButton = this.#createFallbackButton("move", 0);
      }

      try {
        infoButton = createInfoButton(sheets);
      } catch (err) {
        console.error("[SlideLeftManageMenuBuilder] Error creando botón info:", err);
        infoButton = this.#createFallbackButton("info", 1);
      }

      try {
        destroyButton = Button.build("destroy", 3, icons, sheets);
      } catch (err) {
        console.error("[SlideLeftManageMenuBuilder] Error creando botón destroy:", err);
        destroyButton = this.#createFallbackButton("destroy", 2);
      }

      if (moveButton) containerButton.appendChild(moveButton);
      if (infoButton) containerButton.appendChild(infoButton);
      if (destroyButton) containerButton.appendChild(destroyButton);

      return containerButton;
    } catch (error) {
      console.error("[SlideLeftManageMenuBuilder] Error total en build:", error);
      const fallback = document.createElement("div");
      fallback.classList.add("container-buttons", "menu-02");
      fallback.textContent = "Error al cargar menú de gestión";
      return fallback;
    }
  }

  static #createFallbackButton(id, num) {
    const btn = document.createElement("div");
    btn.id = id;
    btn.classList.add("button", id);
    const imgContainer = document.createElement("div");
    imgContainer.classList.add("img-container");
    imgContainer.textContent = id.charAt(0).toUpperCase() + id.slice(1);
    btn.appendChild(imgContainer);
    return btn;
  }
}