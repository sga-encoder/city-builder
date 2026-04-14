import { DevUtils } from "../../DevUtils.js";

export class DebugToggleButtonBuilder {
    static build() {
        const btn = document.createElement("button");
        btn.id = "debug-toggle-btn";
        btn.className = "debug-toggle-btn";
        btn.textContent = DevUtils.isEnabledDebug() ? "🟢 Debug ON" : "⚪ Debug OFF";
        return btn;
    }
}