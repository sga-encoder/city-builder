export class HappinessIndicator {
	static render(city, turnSystem, containerSelector = "#slide-right") {
		const container = document.querySelector(containerSelector);
		if (!container) return;

		const happinessRoot = this.#ensureRoot(container);
		this.#updateHappiness(happinessRoot, city?.citizens ?? []);

		if (turnSystem && !turnSystem.__happinessObserverBound) {
			turnSystem.addObserver((event) => {
				if (event?.type !== "turnComplete") return;
				const liveContainer = document.querySelector(containerSelector);
				if (!liveContainer) return;

				const liveRoot = this.#ensureRoot(liveContainer);
				// Usar city.citizens directamente ya que city es una referencia actualizada
				this.#updateHappiness(liveRoot, city?.citizens ?? []);
			});
			turnSystem.__happinessObserverBound = true;
		}
	}

	static #ensureRoot(container) {
		const hudContainer = this.#ensureHudContainer(container);

		let root = hudContainer.querySelector("#happiness-indicator");
		if (root) return root;

		root = document.createElement("div");
		root.id = "happiness-indicator";

		const label = document.createElement("div");
		label.className = "happiness-label";
		label.textContent = "felicidad";

		const value = document.createElement("div");
		value.className = "happiness-value";
		value.textContent = "0%";

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

	static #updateHappiness(root, citizens) {
		const valueNode = root?.querySelector(".happiness-value");
		if (!valueNode) return;

		if (!Array.isArray(citizens) || citizens.length === 0) {
			valueNode.textContent = "0%";
			return;
		}

		const totalHappiness = citizens.reduce((sum, citizen) => sum + (citizen?.happiness ?? 0), 0);
		const averageHappiness = totalHappiness / citizens.length;

		// Mostrar el valor directo de felicidad promedio (sin normalización)
		const displayValue = Math.round(averageHappiness);
		valueNode.textContent = `${displayValue}%`;
	}
}
