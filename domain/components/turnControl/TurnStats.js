export class TurnStats {
  static createStats(id, icon, value) {
    const stat = document.createElement("div");
    stat.textContent = `${icon} ${value}`;
    const span = document.createElement("span");
    span.id = id;
    span.textContent = " 0";
    stat.appendChild(span);
    return stat;
  }

  static createStatsContainer() {
    const stats = document.createElement("div");
    stats.id = "turn-stats-panel";
    const data = [
      { id: "turn-number", icon: "🎟️", value: "Turno actual:" },
      { id: "turn-speed", icon: "⏱️", value: "Velocidad:" },
      { id: "turn-money", icon: "💰", value: "Recursos:" },
      { id: "turn-energy", icon: "⚡", value: "Energía:" },
      { id: "turn-water", icon: "💧", value: "Agua:" },
      { id: "turn-food", icon: "🍎", value: "Comida:" },
    ];

    data.forEach(({ id, icon, value }) => {
      const stat = this.createStats(id, icon, value);
      stats.appendChild(stat);
    });
    document.body.appendChild(stats);
  }
  static updateStats(state, city, diff = {}) {
    document.getElementById("turn-number").textContent = state.currentTurn;
    document.getElementById("turn-speed").textContent = state.speedKey;
    document.getElementById("turn-money").textContent =
      `💰 ${diff.money > 0 ? "+" : ""}${diff.money ?? 0}`;
    document.getElementById("turn-energy").textContent =
      `⚡ ${diff.energy > 0 ? "+" : ""}${diff.energy ?? 0}`;
    document.getElementById("turn-water").textContent =
      `💧 ${diff.water > 0 ? "+" : ""}${diff.water ?? 0}`;
    document.getElementById("turn-food").textContent =
      `🍎 ${diff.food > 0 ? "+" : ""}${diff.food ?? 0}`;
  }
}
