export class LeaderboardRenderer {
  constructor(containerId = "leaderboard-overlay") {
    this.containerId = containerId;
    this.onBack = null;
    this.data = null;
  }

  render(data = null, onBackCallback = null) {
    this.onBack = onBackCallback;
    this.data = data;

    // Si data es el antiguo formato (array), convertir a nuevo formato
    if (Array.isArray(data)) {
      this.data = {
        top10: data,
        currentCity: null,
        totalCities: data.length,
      };
    }

    const overlay = document.createElement("div");
    overlay.id = this.containerId;
    overlay.className = "leaderboard-overlay";

    const container = document.createElement("div");
    container.className = "leaderboard-container";

    const title = document.createElement("h1");
    title.className = "leaderboard-title";
    title.textContent = "Top 10 - Leaderboard";

    const subtitle = document.createElement("p");
    subtitle.className = "leaderboard-subtitle";
    subtitle.textContent = "Ranking global por ciudad";

    const board = document.createElement("div");
    board.className = "leaderboard-table";

    board.appendChild(this.#buildHeaderRow());

    if (!this.data?.top10 || this.data.top10.length === 0) {
      const emptyState = document.createElement("p");
      emptyState.className = "leaderboard-empty";
      emptyState.textContent = "No hay ciudades registradas para mostrar.";
      board.appendChild(emptyState);
    } else {
      this.data.top10.forEach((entry) => {
        const isCurrentCity = this.data.currentCity && String(entry.id) === String(this.data.currentCity.id);
        board.appendChild(this.#buildDataRow(entry, isCurrentCity));
      });
    }

    container.appendChild(title);
    container.appendChild(subtitle);
    container.appendChild(board);

    // Mostrar ciudad actual si no está en top 10
    if (this.data?.currentCity && !this.data.top10?.some((e) => e.id === this.data.currentCity.id)) {
      const currentCitySection = document.createElement("div");
      currentCitySection.className = "leaderboard-current-city";

      const label = document.createElement("p");
      label.className = "leaderboard-current-label";
      label.textContent = `Tu ciudad: #${this.data.currentCity.position}`;

      const currentBoard = document.createElement("div");
      currentBoard.className = "leaderboard-table leaderboard-table-current";

      currentBoard.appendChild(this.#buildHeaderRow());
      currentBoard.appendChild(this.#buildDataRow(this.data.currentCity, true));

      currentCitySection.appendChild(label);
      currentCitySection.appendChild(currentBoard);

      container.appendChild(currentCitySection);
    }

    const actions = document.createElement("div");
    actions.className = "leaderboard-actions";

    const exportButton = document.createElement("button");
    exportButton.type = "button";
    exportButton.className = "leaderboard-btn leaderboard-btn-export";
    exportButton.textContent = "📥 Exportar JSON";
    exportButton.addEventListener("click", () => this.#exportToJSON());

    const resetButton = document.createElement("button");
    resetButton.type = "button";
    resetButton.className = "leaderboard-btn leaderboard-btn-danger";
    resetButton.textContent = "🗑️ Reiniciar Ranking";
    resetButton.addEventListener("click", () => this.#confirmReset());

    const backButton = document.createElement("button");
    backButton.type = "button";
    backButton.className = "leaderboard-btn leaderboard-btn-primary";
    backButton.textContent = "Volver al menu principal";
    backButton.addEventListener("click", () => {
      this.destroy();
      this.onBack?.();
    });

    actions.appendChild(exportButton);
    actions.appendChild(resetButton);
    actions.appendChild(backButton);
    container.appendChild(actions);

    overlay.appendChild(container);
    document.body.appendChild(overlay);
    return overlay;
  }

  #buildHeaderRow() {
    const row = document.createElement("div");
    row.className = "leaderboard-row leaderboard-row-header";

    ["#", "Alcalde", "Ciudad", "Puntaje", "Felicidad", "Turnos", "Fecha"].forEach((label) => {
      const cell = document.createElement("div");
      cell.className = "leaderboard-cell";
      cell.textContent = label;
      row.appendChild(cell);
    });

    return row;
  }

  #buildDataRow(entry, isCurrentCity = false) {
    const row = document.createElement("article");
    row.className = "leaderboard-row";
    
    if (isCurrentCity) {
      row.classList.add("leaderboard-row-current");
    }

    // Formatear fecha
    const dateStr = entry.updatedAt
      ? new Date(entry.updatedAt).toLocaleDateString("es-ES", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "-";

    const values = [
      String(entry.position || 0),
      entry.mayorName || "Desconocido",
      entry.name || "Ciudad sin nombre",
      String(Math.round(entry.score || 0)),
      `${entry.averageHappiness || 0}%`,
      String(entry.turn || 0),
      dateStr,
    ];

    values.forEach((value) => {
      const cell = document.createElement("div");
      cell.className = "leaderboard-cell";
      cell.textContent = value;
      row.appendChild(cell);
    });

    return row;
  }

  #exportToJSON() {
    if (!this.data || !this.data.top10) return;

    const exportData = {
      timestamp: new Date().toISOString(),
      ranking: this.data.top10,
      totalCities: this.data.totalCities,
      currentCity: this.data.currentCity || null,
    };

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ranking-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  #confirmReset() {
    const confirmed = confirm(
      "⚠️ ¿Estás seguro de que deseas reiniciar el ranking? Esta acción no se puede deshacer."
    );

    if (!confirmed) return;

    // Importar LocalStorage
    import("../../../database/LocalStorage.js").then(({ LocalStorage }) => {
      LocalStorage.saveData("savedCities", JSON.stringify([]));
      alert("✓ Ranking reiniciado correctamente");
      this.destroy();
      this.onBack?.();
    });
  }

  destroy() {
    const overlay = document.getElementById(this.containerId);
    if (overlay) {
      overlay.remove();
    }
  }
}