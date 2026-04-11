import { TurnToolsStats } from "../../components/turnTools/Stats/Renderer.js";

export class TurnToolsControlPanelController {
    static attach(refs, turnSystem) {
        refs.playBtn.onclick = () => turnSystem.play();
        refs.pauseBtn.onclick = () => turnSystem.pause();
        refs.nextBtn.onclick = () => {
            const turnData = turnSystem.executeNextTurn();
            if (!turnData) return;

            TurnToolsStats.update(
                turnSystem.getState(),
                turnSystem.city,
                turnData?.changes?.total || { money: 0, energy: 0, water: 0, food: 0 },
            );
        };
        refs.speedSelect.onchange = () => turnSystem.setSpeed(refs.speedSelect.value);

        turnSystem.addObserver(event => {
            if (event.type === "stateChanged") {
                refs.stateLabel.textContent = `Estado: ${event.state}`;
            }
        });
    }
}