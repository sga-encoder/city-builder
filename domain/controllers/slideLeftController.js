// =====================
// MENU MANAGEMENT FUNCTIONS
// =====================

const showMenu01 = () => {
  document.querySelector(".container-buttons.menu-01")?.classList.add("active");
};

const showMenu02 = () => {
  document.querySelector(".container-buttons.menu-02")?.classList.add("active");
};

const showMenu03 = () => {
  const menu = document.querySelector(".container-buttons.menu-03");
  if (menu) {
    menu.scrollLeft = 0; // Restaurar scroll al inicio
    menu.classList.add("active");
  }
};

const hideMenu01 = () => {
  document
    .querySelector(".container-buttons.menu-01")
    ?.classList.remove("active");
};

const hideMenu02 = () => {
  document
    .querySelector(".container-buttons.menu-02")
    ?.classList.remove("active");
};

const hideMenu03 = () => {
  document
    .querySelector(".container-buttons.menu-03")
    ?.classList.remove("active");
};

const switchToMenu03 = () => {
  hideMenu01();
  showMenu03();
};

const hideAllMenu = () => {
  hideMenu01();
  hideMenu02();
  hideMenu03();
};

// Expose functions globally for other controllers
window.showMenu01 = showMenu01;
window.showMenu02 = showMenu02;
window.showMenu03 = showMenu03;
window.hideMenu01 = hideMenu01;
window.hideMenu02 = hideMenu02;
window.hideMenu03 = hideMenu03;
window.switchToMenu03 = switchToMenu03;
window.hideAllMenu = hideAllMenu;

// =====================
// EVENT LISTENERS
// =====================

document.addEventListener("DOMContentLoaded", function () {
  const container = document.querySelector(".resources");
  const btn = document.querySelector("#resource");

  btn.addEventListener("click", function () {
    container.classList.toggle("active");
  });

  const buildBtn = document.querySelector("#build");
  buildBtn.addEventListener("click", function () {
    switchToMenu03();
  });
});
