import { DevMode } from "../config/DevMode.js";
export const createDebugToggleButton = (showPanels, hidePanels) => {
  if (!DevMode.isEnabledDevMode()) return; // Solo crea el botón si el modo dev está habilitado
  const existingBtn = document.getElementById("debug-toggle-btn");
  if (existingBtn) {
    existingBtn.remove();
  }
  const btn = document.createElement("button");
  btn.id = "debug-toggle-btn";
  btn.textContent = DevMode.isEnabledDebug() ? "🟢 Debug ON" : "⚪ Debug OFF";

  // Drag logic
  let isDragging = false,
    offsetX = 0,
    offsetY = 0,
    moved = false;
  btn.onmousedown = function (e) {
    isDragging = true;
    moved = false;
    offsetX = e.clientX - btn.getBoundingClientRect().left;
    offsetY = e.clientY - btn.getBoundingClientRect().top;
    document.body.style.userSelect = "none";
  };
  document.onmousemove = function (e) {
    if (isDragging) {
      btn.style.left = e.clientX - offsetX + "px";
      btn.style.top = e.clientY - offsetY + "px";
      btn.style.right = "auto";
      btn.style.bottom = "auto";
      btn.style.position = "fixed";
      moved = true;
    }
  };
  document.onmouseup = function () {
    isDragging = false;
    document.body.style.userSelect = "";
  };

  // Toggle debug mode
  btn.onclick = function (e) {
    if (moved) return; // Evita toggle al soltar el drag
    if (DevMode.isEnabledDebug()) {
      DevMode.disable();
      btn.textContent = "⚪ Debug OFF";
      if (typeof hidePanels === "function") hidePanels();
    } else {
      DevMode.enable(["TurnSystem"]);
      btn.textContent = "🟢 Debug ON";
      if (typeof showPanels === "function") showPanels();
    }
  };
  const devcontainer = document.getElementById("dev-tools");
  devcontainer.appendChild(btn);
};
