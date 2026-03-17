import { DevMode } from "../config/devMode.js";
export const createDebugToggleButton = () => {
  const btn = document.createElement("button");
  btn.id = "debug-toggle-btn";
  btn.textContent = DevMode.isEnabled() ? "🟢 Debug ON" : "⚪ Debug OFF";

  // Drag logic
  let isDragging = false,
    offsetX = 0,
    offsetY = 0,
    moved=false;
  btn.onmousedown = function (e) {
    isDragging = true;
    moved=false;
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
      moved=true;
    }
  };
  document.onmouseup = function () {
    isDragging = false;
    document.body.style.userSelect = "";
  };

  // Toggle debug mode
  btn.onclick = function (e) {

    if (moved) return; // Evita toggle al soltar el drag
    if (DevMode.isEnabled()) {
      DevMode.disable();
      btn.textContent = "⚪ Debug OFF";
      location.reload(); // Recarga para ocultar paneles debug
    } else {
      DevMode.enable(["TurnSystem"]);
      btn.textContent = "🟢 Debug ON";
      location.reload(); // Recarga para mostrar paneles debug
    }
  };

  document.body.appendChild(btn);
}
