import { DevUtils } from "../../DevUtils.js";
import { DebugToggleButtonController } from "../../controller/DebugToggleButton.js";
import { DebugToggleButtonBuilder } from "./Builder.js";


export class DebugToggleButton {
  static render(context) {
    if (!DevUtils.isEnabledDevMode()) return;
    const devcontainer = document.getElementById("dev-tools");
    devcontainer.querySelector("#debug-toggle-btn")?.remove();
    const btn = DebugToggleButtonBuilder.build();
    DebugToggleButtonController.attach(btn, context);
    devcontainer.appendChild(btn);
    context.logger?.log("[DebugToggleButton] Botón renderizado en dev-tools.");
  }
}
