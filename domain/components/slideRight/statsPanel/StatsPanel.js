import { StatsManager } from "../../services/StatsManager.js";

export class StatsPanel {
    static render(containerId = "slide-right-panel") {
        const stats = StatsManager.getAllStats();
        const container = document.getElementById(containerId);
        container.innerHTML = ""; // Limpia el panel

        const title = document.createElement("h2");
        title.textContent = "Estadísticas de Edificios";
        container.appendChild(title);

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
            container.appendChild(section);
        }
    }
}