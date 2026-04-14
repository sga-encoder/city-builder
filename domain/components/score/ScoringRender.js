import { ScoreBreakdown } from "./ScoreBreakdown.js";
import { ScoringSystem } from "./ScoringSystem.js";

export class ScoringRender {
	static render(city, turnSystem, containerSelector = "#slide-right") {
		const container = document.querySelector(containerSelector);
		if (!container) return;

		const scoreRoot = this.#ensureRoot(container);
		this.#updateScore(scoreRoot, city?.score ?? 0);

		// Hacer clickeable el indicador
		const scorer = new ScoringSystem();
		scoreRoot.addEventListener("click", () => {
			ScoreBreakdown.show(scorer, city);
		});

		if (turnSystem && !turnSystem.__scoreObserverBound) {
			turnSystem.addObserver((event) => {
				if (event?.type !== "turnComplete") return;
				const liveContainer = document.querySelector(containerSelector);
				if (!liveContainer) return;

				const liveRoot = this.#ensureRoot(liveContainer);
				const nextScore = event?.data?.score?.score ?? event?.data?.score ?? city?.score ?? 0;
				this.#updateScore(liveRoot, nextScore);
			});
			turnSystem.__scoreObserverBound = true;
		}
	}

	static #ensureRoot(container) {
		const hudContainer = this.#ensureHudContainer(container);

		let root = hudContainer.querySelector("#score-text");
		if (root) return root;

		root = document.createElement("div");
		root.id = "score-text";

		const label = document.createElement("div");
		label.className = "score-label";
		label.textContent = "puntaje";

		const value = document.createElement("div");
		value.className = "score-value";
		value.textContent = "0";

		root.appendChild(label);
		root.appendChild(value);
		hudContainer.appendChild(root);

		return root;
	}

	static #ensureHudContainer(container) {
		let hudContainer = container.querySelector("#score-happiness-container");
		if (hudContainer) return hudContainer;

		hudContainer = document.createElement("div");
		hudContainer.id = "score-happiness-container";
		container.appendChild(hudContainer);

		return hudContainer;
	}

	static #updateScore(root, value) {
		const valueNode = root?.querySelector(".score-value");
		if (!valueNode) return;

		const numericScore = Number(value);
		valueNode.textContent = Number.isFinite(numericScore)
			? String(Math.round(numericScore))
			: "0";
	}
}
