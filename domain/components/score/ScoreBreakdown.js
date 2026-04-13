export class ScoreBreakdown {
  static overlay = null;

  static show(scorer, city) {
    if (!scorer || !city) return;

    this.destroy();

    const scoreResult = scorer.calculateScore(city);

    const overlay = document.createElement("div");
    overlay.className = "score-breakdown-overlay";
    this.overlay = overlay;

    const container = document.createElement("div");
    container.className = "score-breakdown-container";

    const title = document.createElement("h2");
    title.className = "score-breakdown-title";
    title.textContent = "Desglose de Puntuación";

    const closeBtn = document.createElement("button");
    closeBtn.className = "score-breakdown-close";
    closeBtn.textContent = "✕";
    closeBtn.addEventListener("click", () => this.destroy());

    const content = document.createElement("div");
    content.className = "score-breakdown-content";

    // Puntos por población
    const populationSection = this.#createSection(
      "Puntos por Población",
      `${scoreResult.metrics.population} ciudadanos × 10 = ${scoreResult.metrics.population * 10}`,
    );
    content.appendChild(populationSection);

    // Puntos por felicidad
    const happinessSection = this.#createSection(
      "Puntos por Felicidad",
      `${Math.round(scoreResult.metrics.averageHappiness)}% promedio × 5 = ${Math.round(scoreResult.metrics.averageHappiness * 5)}`,
    );
    content.appendChild(happinessSection);

    // Puntos por recursos
    const resourcesSection = document.createElement("div");
    resourcesSection.className = "score-breakdown-section";
    const resourcesTitle = document.createElement("h4");
    resourcesTitle.textContent = "Puntos por Recursos";
    resourcesSection.appendChild(resourcesTitle);

    const resourcesList = document.createElement("ul");
    resourcesList.innerHTML = `
      <li>Dinero: $${scoreResult.metrics.money} ÷ 100 = ${Math.round(scoreResult.metrics.money / 100)}</li>
      <li>Electricidad: ${scoreResult.metrics.electricity} × 2 = ${scoreResult.metrics.electricity * 2}</li>
      <li>Agua: ${scoreResult.metrics.water} × 2 = ${scoreResult.metrics.water * 2}</li>
      <li>Comida: ${scoreResult.metrics.food} (incluida en base)</li>
    `;
    resourcesSection.appendChild(resourcesList);
    content.appendChild(resourcesSection);

    // Puntos por edificios
    const buildingsSection = this.#createSection(
      "Puntos por Edificios",
      `${scoreResult.metrics.buildingCount} edificios × 50 = ${scoreResult.metrics.buildingCount * 50}`,
    );
    content.appendChild(buildingsSection);

    // Bonus
    const bonusSection = this.#createSection(
      "Bonificaciones",
      this.#formatBonuses(scoreResult.metrics, scoreResult.bonuses),
      scoreResult.bonuses > 0 ? "positive" : "neutral",
    );
    content.appendChild(bonusSection);

    // Penalizaciones
    const penaltySection = this.#createSection(
      "Penalizaciones",
      this.#formatPenalties(scoreResult.metrics, scoreResult.penalties),
      scoreResult.penalties > 0 ? "negative" : "neutral",
    );
    content.appendChild(penaltySection);

    // Total
    const totalSection = document.createElement("div");
    totalSection.className = "score-breakdown-section score-breakdown-total";
    const baseLine = document.createElement("p");
    baseLine.innerHTML = `<strong>Puntos Base:</strong> ${scoreResult.baseScore}`;
    const bonusLine = document.createElement("p");
    bonusLine.innerHTML = `<strong>+ Bonificaciones:</strong> +${scoreResult.bonuses}`;
    const penaltyLine = document.createElement("p");
    penaltyLine.innerHTML = `<strong>- Penalizaciones:</strong> -${scoreResult.penalties}`;
    const totalLine = document.createElement("p");
    totalLine.className = "score-breakdown-total-score";
    totalLine.innerHTML = `<strong>TOTAL:</strong> ${scoreResult.score}`;

    totalSection.appendChild(baseLine);
    totalSection.appendChild(bonusLine);
    totalSection.appendChild(penaltyLine);
    totalSection.appendChild(totalLine);
    content.appendChild(totalSection);

    container.appendChild(title);
    container.appendChild(closeBtn);
    container.appendChild(content);
    overlay.appendChild(container);

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) this.destroy();
    });

    document.body.appendChild(overlay);
  }

  static #createSection(title, content, type = "neutral") {
    const section = document.createElement("div");
    section.className = `score-breakdown-section score-breakdown-${type}`;

    const heading = document.createElement("h4");
    heading.textContent = title;
    section.appendChild(heading);

    const text = document.createElement("p");
    text.innerHTML = content;
    section.appendChild(text);

    return section;
  }

  static #formatBonuses(metrics, bonusTotal) {
    const bonuses = [];

    if (metrics.population > 0 && metrics.employed === metrics.population) {
      bonuses.push("✓ Población 100% empleada: +500");
    }

    if (metrics.averageHappiness > 80) {
      bonuses.push("✓ Felicidad > 80%: +300");
    }

    if (
      metrics.money > 0 &&
      metrics.electricity > 0 &&
      metrics.water > 0 &&
      metrics.food > 0
    ) {
      bonuses.push("✓ Todos los recursos disponibles: +200");
    }

    if (metrics.population > 1000) {
      bonuses.push("✓ Población > 1000: +1000");
    }

    if (bonuses.length === 0) {
      return "Sin bonificaciones activas";
    }

    return bonuses.join("<br>");
  }

  static #formatPenalties(metrics, penaltyTotal) {
    const penalties = [];

    if (metrics.money < 0) {
      penalties.push("✗ Dinero negativo: -500");
    }

    if (metrics.electricity < 0) {
      penalties.push("✗ Electricidad negativa: -300");
    }

    if (metrics.water < 0) {
      penalties.push("✗ Agua negativa: -300");
    }

    if (metrics.averageHappiness < 40) {
      penalties.push("✗ Felicidad < 40%: -400");
    }

    if (metrics.unemployed > 0) {
      penalties.push(`✗ ${metrics.unemployed} desempleados × 10: -${metrics.unemployed * 10}`);
    }

    if (penalties.length === 0) {
      return "Sin penalizaciones";
    }

    return penalties.join("<br>");
  }

  static destroy() {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
  }
}
