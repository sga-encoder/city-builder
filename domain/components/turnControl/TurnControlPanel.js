export class TurnControlPanel {
  static createControlPanel(turnSystem) {
    // Crear contenedor
    const panel = document.createElement("div");
    panel.id = "turn-control-panel";

    // Botones
    const playBtn = document.createElement("button");
    playBtn.textContent = "▶️ Play";
    playBtn.onclick = () => turnSystem.play();

    const pauseBtn = document.createElement("button");
    pauseBtn.textContent = "⏸️ Pause";
    pauseBtn.onclick = () => turnSystem.pause();

    const nextBtn = document.createElement("button");
    nextBtn.textContent = "⏭️ Next Turn";
    nextBtn.onclick = () => turnSystem.executeNextTurn();

    // Velocidad
    const speedSelect = document.createElement("select");
    ["X1", "X2", "X3"].forEach((speed) => {
      const opt = document.createElement("option");
      opt.value = speed;
      opt.textContent = speed;
      speedSelect.appendChild(opt);
    });
    speedSelect.value = turnSystem.speedKey;
    speedSelect.onchange = () => turnSystem.setSpeed(speedSelect.value);

    // Estado actual
    const stateLabel = document.createElement("span");
    stateLabel.textContent = `Estado: ${turnSystem.state}`;

    // Actualizar estado en eventos
    turnSystem.addObserver((event) => {
      if (event.type === "stateChanged") {
        stateLabel.textContent = `Estado: ${event.state}`;
      }
    });

    // Agregar al panel
    panel.appendChild(playBtn);
    panel.appendChild(pauseBtn);
    panel.appendChild(nextBtn);
    panel.appendChild(speedSelect);
    panel.appendChild(stateLabel);

    return panel;
  }
  static render(turnSystem) {
    const devToolsContainer = document.getElementById("dev-tools");
    devToolsContainer.appendChild(this.createControlPanel(turnSystem));
  }

  static destroy() {
    const panel = document.getElementById("turn-control-panel");
    if (panel) {
      panel.remove();
    }
  }
}
