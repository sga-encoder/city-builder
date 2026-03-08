const createMenu01 = (icons, sheets) => {
  const containerButton = document.createElement("div");
  containerButton.classList.add("container-buttons", "menu-01");

  const buildButton = button("build", 1, icons, sheets);

  containerButton.appendChild(buildButton);
  return containerButton;
};
