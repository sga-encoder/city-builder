export class TurnToolsControlPanelController {
    static attach(refs, turnSystem) {
        refs.playBtn.onclick = () => turnSystem.play();
        refs.pauseBtn.onclick = () => turnSystem.pause();
        refs.nextBtn.onclick = () => turnSystem.executeNextTurn();
        refs.speedSelect.onchange = () => turnSystem.setSpeed(refs.speedSelect.value);

        turnSystem.addObserver(event => {
            if (event.type === "stateChanged") {
                refs.stateLabel.textContent = `Estado: ${event.state}`;
            }
        });
    }
}