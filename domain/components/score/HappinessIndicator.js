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
		let root = container.querySelector("#happiness-indicator");
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
		container.appendChild(root);

		return root;
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

		// Normalizar a porcentaje (suponiendo que happiness está entre -100 y 100)
		const normalizedHappiness = Math.max(0, Math.min(100, (averageHappiness + 100) / 2));
		const percentageHappiness = Math.round(normalizedHappiness);

		valueNode.textContent = `${percentageHappiness}%`;
	}
}
