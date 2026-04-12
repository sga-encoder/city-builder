export class LeaderboardRenderer {
  constructor(containerId = "leaderboard-overlay") {
    this.containerId = containerId;
    this.onBack = null;
  }

  render(entries = [], onBackCallback = null) {
    this.onBack = onBackCallback;

    const overlay = document.createElement("div");
    overlay.id = this.containerId;
    overlay.className = "leaderboard-overlay";

    const container = document.createElement("div");
    container.className = "leaderboard-container";

    const title = document.createElement("h1");
    title.className = "leaderboard-title";
    title.textContent = "Leaderboard";

    const subtitle = document.createElement("p");
    subtitle.className = "leaderboard-subtitle";
    subtitle.textContent = "Ranking global por ciudad";

    const board = document.createElement("div");
    board.className = "leaderboard-table";

    board.appendChild(this.#buildHeaderRow());

    if (entries.length === 0) {
      const emptyState = document.createElement("p");
      emptyState.className = "leaderboard-empty";
      emptyState.textContent = "No hay ciudades registradas para mostrar.";
      board.appendChild(emptyState);
    } else {
      entries.forEach((entry) => {
        board.appendChild(this.#buildDataRow(entry));
      });
    }

    const actions = document.createElement("div");
    actions.className = "leaderboard-actions";

    const backButton = document.createElement("button");
    backButton.type = "button";
    backButton.className = "leaderboard-back-btn";
    backButton.textContent = "Volver al menu principal";
    backButton.addEventListener("click", () => {
      this.destroy();
      this.onBack?.();
    });

    actions.appendChild(backButton);

    container.appendChild(title);
    container.appendChild(subtitle);
    container.appendChild(board);
    container.appendChild(actions);

    overlay.appendChild(container);
    document.body.appendChild(overlay);
    return overlay;
  }

  #buildHeaderRow() {
    const row = document.createElement("div");
    row.className = "leaderboard-row leaderboard-row-header";

    ["#", "Alcalde", "Ciudad", "Puntaje", "Tamaño", "Ciudadanos"].forEach((label) => {
      const cell = document.createElement("div");
      cell.className = "leaderboard-cell";
      cell.textContent = label;
      row.appendChild(cell);
    });

    return row;
  }

  #buildDataRow(entry) {
    const row = document.createElement("article");
    row.className = "leaderboard-row";

    const values = [
      String(entry.position || 0),
      entry.mayorName || "Desconocido",
      entry.name || "Ciudad sin nombre",
      String(Math.round(entry.score || 0)),
      `${entry.mapSize || 0}x${entry.mapSize || 0}`,
      String(entry.citizensCount || 0),
    ];

    values.forEach((value) => {
      const cell = document.createElement("div");
      cell.className = "leaderboard-cell";
      cell.textContent = value;
      row.appendChild(cell);
    });

    return row;
  }

  destroy() {
    const overlay = document.getElementById(this.containerId);
    if (overlay) {
      overlay.remove();
    }
  }
}