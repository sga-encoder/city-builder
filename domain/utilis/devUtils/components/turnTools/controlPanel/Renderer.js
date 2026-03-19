import { TurnToolsControlPanelBuilder } from "./Builder.js";
import { TurnToolsControlPanelController } from "../../../controller/turnTools/ControlPanel.js";

export class TurnToolsControlPanel {
  static render(turnSystem) {
    const devToolsContainer = document.getElementById("dev-tools");
    devToolsContainer.querySelector("#turn-control-panel")?.remove();
    const refs = TurnToolsControlPanelBuilder.build(turnSystem);
    TurnToolsControlPanelController.attach(refs, turnSystem);
    devToolsContainer.appendChild(refs.panel);
  }

  static destroy() {
    const panel = document.getElementById("turn-control-panel");
    if (panel) panel.remove();
  }
}
