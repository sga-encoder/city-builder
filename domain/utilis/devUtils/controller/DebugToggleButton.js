import { DevUtils } from "../DevUtils.js";
export class DebugToggleButtonController {
    static attach(btn, { showPanels, hidePanels, logger }) {
        // Drag
        let isDragging = false, offsetX = 0, offsetY = 0, moved = false;
        btn.onmousedown = function (e) {
            isDragging = true;
            moved = false;
            offsetX = e.clientX - btn.getBoundingClientRect().left;
            offsetY = e.clientY - btn.getBoundingClientRect().top;
            document.body.classList.add("debug-dragging");
        };
        document.onmousemove = function (e) {
            if (isDragging) {
                btn.style.setProperty("--debug-left", e.clientX - offsetX + "px");
                btn.style.setProperty("--debug-top", e.clientY - offsetY + "px");
                btn.style.setProperty("--debug-right", "auto");
                btn.style.setProperty("--debug-bottom", "auto");
                btn.style.setProperty("--debug-position", "fixed");
                moved = true;
            }
        };
        document.onmouseup = function () {
            isDragging = false;
            document.body.classList.remove("debug-dragging");
        };
        btn._dragMoved = () => moved;

        // Toggle
        btn.onclick = function () {
            if (btn._dragMoved && btn._dragMoved()) return;
            if (DevUtils.isEnabledDebug()) {
                DevUtils.disable();
                btn.textContent = "⚪ Debug OFF";
                logger?.log("[DebugToggleButton] Debug desactivado.");
                DevUtils.destroy();
                if (typeof hidePanels === "function") hidePanels();
            } else {
                DevUtils.enable(["TurnSystem"]);
                btn.textContent = "🟢 Debug ON";
                logger?.log("[DebugToggleButton] Debug activado.");
                DevUtils.render();
                if (typeof showPanels === "function") showPanels();
            }
        };
    }
}