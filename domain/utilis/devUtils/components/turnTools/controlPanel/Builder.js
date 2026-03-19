export class TurnToolsControlPanelBuilder {
    static build(turnSystem) {
        const panel = document.createElement("div");
        panel.id = "turn-control-panel";

        const playBtn = document.createElement("button");
        playBtn.textContent = "▶️ Play";
        panel.appendChild(playBtn);

        const pauseBtn = document.createElement("button");
        pauseBtn.textContent = "⏸️ Pause";
        panel.appendChild(pauseBtn);

        const nextBtn = document.createElement("button");
        nextBtn.textContent = "⏭️ Next Turn";
        panel.appendChild(nextBtn);

        const speedSelect = document.createElement("select");
        ["X1", "X2", "X3"].forEach(speed => {
            const opt = document.createElement("option");
            opt.value = speed;
            opt.textContent = speed;
            speedSelect.appendChild(opt);
        });
        speedSelect.value = turnSystem.speedKey;
        panel.appendChild(speedSelect);

        const stateLabel = document.createElement("span");
        stateLabel.textContent = `Estado: ${turnSystem.state}`;
        panel.appendChild(stateLabel);

        // Referencias para el controller
        return { panel, playBtn, pauseBtn, nextBtn, speedSelect, stateLabel };
    }
}