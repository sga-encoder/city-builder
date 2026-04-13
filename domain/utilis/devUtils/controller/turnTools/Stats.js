export class TurnToolsStatsController {
    static update(state, city, diff = {}) {
        const residentialCount = city?.getTypeBuildings
            ? city.getTypeBuildings("R").length
            : 0;

        const turnNumber = Number.isFinite(Number(state?.currentTurn))
            ? Number(state.currentTurn)
            : Number(city?.turn || 0);

        const score = Number.isFinite(Number(state?.score))
            ? Number(state.score)
            : Number(city?.score || 0);

        this.setStat("turn-number", turnNumber);
        this.setStat("turn-speed", state?.speedKey ?? "X1");
        this.setStat("turn-score", score);
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