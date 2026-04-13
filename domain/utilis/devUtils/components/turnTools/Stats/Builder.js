export class TurnToolsStatsBuilder {
    static build() {
        const stats = document.createElement("div");
        stats.id = "turn-stats-panel";
        [
            { id: "turn-number", icon: "🎟️", value: "Turno actual:" },
            { id: "turn-speed", icon: "⏱️", value: "Velocidad:" },
            { id: "turn-score", icon: "🏆", value: "Puntaje:" },
            { id: "turn-residential", icon: "🏠", value: "Residenciales:" },
            { id: "turn-money", icon: "💰", value: "Recursos:" },
            { id: "turn-energy", icon: "⚡", value: "Energía:" },
            { id: "turn-water", icon: "💧", value: "Agua:" },
            { id: "turn-food", icon: "🍎", value: "Comida:" },
        ].forEach(({ id, icon, value }) => {
            const stat = document.createElement("div");
            stat.textContent = `${icon} ${value}`;
            const span = document.createElement("span");
            span.id = id;
            span.textContent = " 0";
            stat.appendChild(span);
            stats.appendChild(stat);
        });
        return stats;
    }
}