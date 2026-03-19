export class TurnToolsStatsController {
    static update(state, city, diff = {}) {
        const residentialCount = city?.getResidentialBuildings
            ? city.getResidentialBuildings().length
            : 0;

        this.setStat("turn-number", state.currentTurn);
        this.setStat("turn-speed", state.speedKey);
        this.setStat("turn-residential", residentialCount);
        this.setStat("turn-money", `💰 ${diff.money > 0 ? "+" : ""}${diff.money ?? 0}`);
        this.setStat("turn-energy", `⚡ ${diff.energy > 0 ? "+" : ""}${diff.energy ?? 0}`);
        this.setStat("turn-water", `💧 ${diff.water > 0 ? "+" : ""}${diff.water ?? 0}`);
        this.setStat("turn-food", `🍎 ${diff.food > 0 ? "+" : ""}${diff.food ?? 0}`);
    }

    static setStat(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }
}