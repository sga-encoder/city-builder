const createMenu02 = (icons, sheets) => {
  const containerButton = document.createElement("div");
  containerButton.classList.add("container-buttons", "menu-02");

  const moveButton = button("move", 0, icons, sheets);
  const destroyButton = button("destroy", 1, icons, sheets);

  containerButton.appendChild(moveButton);
  containerButton.appendChild(destroyButton);
  return containerButton;
};