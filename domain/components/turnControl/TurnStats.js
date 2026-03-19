export class TurnStats {
  static #createStatElement(id, icon, value) {
    const stat = document.createElement("div");
    stat.textContent = `${icon} ${value}`;
    const span = this.#createValueSpan(id);
    stat.appendChild(span);
    return stat;
  }

  static #createValueSpan(id) {
    const span = document.createElement("span");
    span.id = id;
    span.textContent = " 0";
    return span;
  }

  static #getStatsData() {
    return [
      { id: "turn-number", icon: "🎟️", value: "Turno actual:" },
      { id: "turn-speed", icon: "⏱️", value: "Velocidad:" },
      { id: "turn-residential", icon: "🏠", value: "Residenciales:" },
      { id: "turn-money", icon: "💰", value: "Recursos:" },
      { id: "turn-energy", icon: "⚡", value: "Energía:" },
      { id: "turn-water", icon: "💧", value: "Agua:" },
      { id: "turn-food", icon: "🍎", value: "Comida:" },
    ];
  }

  static #createStatsContainer() {
    const stats = document.createElement("div");
    stats.id = "turn-stats-panel";
    this.#getStatsData().forEach(({ id, icon, value }) => {
      const stat = this.#createStatElement(id, icon, value);
      stats.appendChild(stat);
    });
    return stats;
  }

  static updateStats(state, city, diff = {}) {
    const residentialCount = city?.getResidentialBuildings
      ? city.getResidentialBuildings().length
      : 0;

    this.#setStatValue("turn-number", state.currentTurn);
    this.#setStatValue("turn-speed", state.speedKey);
    this.#setStatValue("turn-residential", residentialCount);
    this.#setStatValue("turn-money", `💰 ${diff.money > 0 ? "+" : ""}${diff.money ?? 0}`);
    this.#setStatValue("turn-energy", `⚡ ${diff.energy > 0 ? "+" : ""}${diff.energy ?? 0}`);
    this.#setStatValue("turn-water", `💧 ${diff.water > 0 ? "+" : ""}${diff.water ?? 0}`);
    this.#setStatValue("turn-food", `🍎 ${diff.food > 0 ? "+" : ""}${diff.food ?? 0}`);
  }

  static #setStatValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  static render() {
    const devToolsContainer = document.getElementById("dev-tools");
    devToolsContainer.appendChild(this.#createStatsContainer());
  }

  static destroy() {
    const panel = document.getElementById("turn-stats-panel");
    if (panel) {
      panel.remove();
    }
  }
}
