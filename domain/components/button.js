export class Button {
  static render(id, num, icons, sheets, iconName = "") {
    const btn = this.#buildButton(id);
    this.#applyDynamicRule(btn, id, num, sheets);
    const imgContainer = this.#buildImgContainer(id, icons, iconName);
    btn.appendChild(imgContainer);
    return btn;
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
    imgContainer.innerHTML =
      iconName === "" ? icons.getModel(id) : icons.getModel(iconName);
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


}
