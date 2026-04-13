export class Button {
  static build(id, num, icons, sheets, iconName = "") {
    try {
      const btn = this.#buildButton(id);
      this.#applyDynamicRule(btn, id, num, sheets);
      const imgContainer = this.#buildImgContainer(id, icons, iconName);
      btn.appendChild(imgContainer);
      return btn;
    } catch (error) {
      console.error("[Button] Error creando botón:", id, error);
      return this.#createFallbackButton(id, num);
    }
  }

  static #buildButton(id) {
    const btn = document.createElement("div");
    btn.id = id;
    btn.classList.add("button");
    btn.classList.add(id);
    if (id.includes(".")) {
      btn.id = id.split(".")[0];
    }
    return btn;
  }

  static #buildImgContainer(id, icons, iconName) {
    const imgContainer = document.createElement("div");
    imgContainer.classList.add("img-container");

    try {
      if (!icons || typeof icons.getModel !== "function") {
        throw new Error("Icons no disponible o getModel no es función");
      }
      const model = iconName === "" ? icons.getModel(id) : icons.getModel(iconName);
      if (!model) {
        throw new Error(`getModel retornó vacío para: ${iconName || id}`);
      }
      imgContainer.innerHTML = model;
    } catch (error) {
      console.warn("[Button] Error obteniendo modelo de icono:", id, error);
      imgContainer.textContent = id.charAt(0).toUpperCase() + id.slice(1);
    }

    return imgContainer;
  }

  static #applyDynamicRule(btn, id, num, sheets) {
    const rule = `#${id.includes(".") ? id.split(".")[0] : id}{ --i:${num}; }`;
    const targetSheet = sheets || document.styleSheets[0];
    if (targetSheet) {
      try {
        targetSheet.insertRule(rule, targetSheet.cssRules.length);
      } catch {
        // Continue rendering the button even if dynamic CSS rule insertion fails.
      }
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
