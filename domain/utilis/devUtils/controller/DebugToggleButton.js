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