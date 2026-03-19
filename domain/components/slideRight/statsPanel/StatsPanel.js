import { StatsManager } from "../../../services/StatsManager.js";

export class StatsPanel {
    static render(container) {
        // Suscribirse solo una vez
        if (!container._statsPanelSubscribed) {
            StatsManager.addObserver(() => {
                StatsPanel.render(container);
            });
            container._statsPanelSubscribed = true;
        }

        // Elimina el panel anterior si existe
        const oldPanel = container.querySelector('#stats-container');
        if (oldPanel) oldPanel.remove();

        const stats = StatsManager.getAllStats();
        const StatsContainer = document.createElement("div");
        StatsContainer.id = "stats-container";
        StatsContainer.innerHTML = ""; // Limpia el panel

        const title = document.createElement("h2");
        title.textContent = "Estadísticas de Edificios";
        StatsContainer.appendChild(title);

        for (const subtype in stats) {
            const section = document.createElement("div");
            section.classList.add("stats-section");
            section.innerHTML = `<h3>${subtype}</h3>`;
            const data = stats[subtype];
            for (const tipo in data) {
                const tipoDiv = document.createElement("div");
                tipoDiv.innerHTML = `<strong>${tipo}:</strong> `;
                for (const recurso in data[tipo]) {
                    tipoDiv.innerHTML += `${recurso}: ${data[tipo][recurso]} `;
                }
                section.appendChild(tipoDiv);
            }
            StatsContainer.appendChild(section);
        }
        container.appendChild(StatsContainer);
        console.log("StatsPanel renderizado con datos:", stats);
    }

    static destroy(container) {
        const oldPanel = container.querySelector('#stats-container');
        if (oldPanel) oldPanel.remove();
        console.log("StatsPanel destruido");
    }
}