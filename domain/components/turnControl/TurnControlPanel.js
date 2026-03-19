export class TurnControlPanel {
  static #createButton(label, onClick) {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.onclick = onClick;
    return btn;
  }

  static #createSpeedSelect(turnSystem) {
    const speedSelect = document.createElement("select");
    ["X1", "X2", "X3"].forEach((speed) => {
      const opt = document.createElement("option");
      opt.value = speed;
      opt.textContent = speed;
      speedSelect.appendChild(opt);
    });
    speedSelect.value = turnSystem.speedKey;
    speedSelect.onchange = () => turnSystem.setSpeed(speedSelect.value);
    return speedSelect;
  }

  static #createStateLabel(turnSystem) {
    const stateLabel = document.createElement("span");
    stateLabel.textContent = `Estado: ${turnSystem.state}`;
    turnSystem.addObserver((event) => {
      if (event.type === "stateChanged") {
        stateLabel.textContent = `Estado: ${event.state}`;
      }
    });
    return stateLabel;
  }

  static #createControlPanel(turnSystem) {
    const panel = document.createElement("div");
    panel.id = "turn-control-panel";

    const playBtn = this.#createButton("▶️ Play", () => turnSystem.play());
    const pauseBtn = this.#createButton("⏸️ Pause", () => turnSystem.pause());
    const nextBtn = this.#createButton("⏭️ Next Turn", () => turnSystem.executeNextTurn());
    const speedSelect = this.#createSpeedSelect(turnSystem);
    const stateLabel = this.#createStateLabel(turnSystem);

    panel.appendChild(playBtn);
    panel.appendChild(pauseBtn);
    panel.appendChild(nextBtn);
    panel.appendChild(speedSelect);
    panel.appendChild(stateLabel);

    return panel;
  }

  static render(turnSystem) {
    const devToolsContainer = document.getElementById("dev-tools");
    devToolsContainer.appendChild(this.#createControlPanel(turnSystem));
  }

  static destroy() {
    const panel = document.getElementById("turn-control-panel");
    if (panel) {
      panel.remove();
    }
  }
}
