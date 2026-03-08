const createMenu03 = (icons, sheets) => {
  const containerButton = document.createElement("div");
  containerButton.classList.add("container-buttons", "menu-03");

  const menuItems = [
    "R1",
    "R2",
    "C1",
    "C2",
    "I1",
    "I2",
    "P1",
    "S1",
    "S2",
    "S3",
    "U1",
    "U2",
    "r",
  ];

  menuItems.forEach((id, index) => {
    containerButton.appendChild(
      button(id, index + 1, icons, sheets, !id[1] ? id : `${id[0]}.${id[1]}`),
    );
  });

  return containerButton;
};
