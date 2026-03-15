export const button = (id, num, icons, sheets, iconName = "") => {
  const btn = document.createElement("div");
  btn.id = id;
  btn.classList.add("button");
  btn.classList.add(id);
  if (id.includes(".")) {
    btn.id = id.split(".")[0];
  }
  const rule = `#${id.includes(".") ? id.split(".")[0] : id}{ --i:${num}; }`;
  sheets.insertRule(rule, sheets.cssRules.length);

  const imgContainer = document.createElement("div");
  imgContainer.classList.add("img-container");
  imgContainer.innerHTML =
    iconName === "" ? icons.getModel(id) : icons.getModel(iconName);
  btn.appendChild(imgContainer);
  return btn;
};
