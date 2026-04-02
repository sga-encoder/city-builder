export class ScoringSystem {
	calculateScore(city) {
		const metrics = this.#getMetrics(city);
		const baseScore =
			metrics.population * 10 +
			metrics.averageHappiness * 5 +
			metrics.money / 100 +
			metrics.buildingCount * 50 +
			metrics.electricity * 2 +
			metrics.water * 2;

		const bonuses = this.calculateBonifications(metrics);
		const penalties = this.calculatePenalizations(metrics);
		const score = Math.round(baseScore + bonuses - penalties);

		if (city && typeof city === "object") {
			city.score = score;
		}

		return {
			score,
			baseScore: Math.round(baseScore),
			bonuses,
			penalties,
			metrics,
		};
	}

	calculateBonifications(cityOrMetrics) {
		const metrics = this.#normalizeMetrics(cityOrMetrics);
		let total = 0;

		if (metrics.population > 0 && metrics.employed === metrics.population) {
			total += 500;
		}

		if (metrics.averageHappiness > 80) {
			total += 300;
		}

		if (
			metrics.money > 0 &&
			metrics.electricity > 0 &&
			metrics.water > 0 &&
			metrics.food > 0
		) {
			total += 200;
		}

		if (metrics.population > 1000) {
			total += 1000;
		}

		return total;
	}

	calculatePenalizations(cityOrMetrics) {
		const metrics = this.#normalizeMetrics(cityOrMetrics);
		let total = 0;

		if (metrics.money < 0) {
			total += 500;
		}

		if (metrics.electricity < 0) {
			total += 300;
		}

		if (metrics.water < 0) {
			total += 300;
		}

		if (metrics.averageHappiness < 40) {
			total += 400;
		}

		if (metrics.unemployed > 0) {
			total += metrics.unemployed * 10;
		}

		return total;
	}

	#getMetrics(city) {
		const resources = city?.resources || {};
		const citizens = Array.isArray(city?.citizens) ? city.citizens : [];
		const grid = Array.isArray(city?.map?.grid) ? city.map.grid : [];
		const buildingCount = grid.flat().filter((building) => {
			const type = String(building?.type || "").toLowerCase();
			return type && type !== "g" && type !== "r";
		}).length;

		const population = citizens.length;
		const employed = citizens.filter((citizen) => Boolean(citizen?.hasJob)).length;
		const unemployed = Math.max(0, population - employed);
		const happinessTotal = citizens.reduce(
			(acc, citizen) => acc + Number(citizen?.happiness || 0),
			0,
		);

		return {
			population,
			employed,
			unemployed,
			averageHappiness: population > 0 ? happinessTotal / population : 0,
			money: Number(resources.money?.amount || 0),
			electricity: Number(resources.energy?.amount || 0),
			water: Number(resources.water?.amount || 0),
			food: Number(resources.food?.amount || 0),
			buildingCount,
		};
	}

	#normalizeMetrics(cityOrMetrics) {
		if (
			cityOrMetrics &&
			typeof cityOrMetrics === "object"
		) {
			const hasMetricsShape = Object.prototype.hasOwnProperty.call(
				cityOrMetrics,
				"population",
			);

			if (hasMetricsShape) {
				return {
					population: Number(cityOrMetrics.population || 0),
					employed: Number(cityOrMetrics.employed || 0),
					unemployed: Number(cityOrMetrics.unemployed || 0),
					averageHappiness: Number(cityOrMetrics.averageHappiness || 0),
					money: Number(cityOrMetrics.money || 0),
					electricity: Number(cityOrMetrics.electricity || 0),
					water: Number(cityOrMetrics.water || 0),
					food: Number(cityOrMetrics.food || 0),
					buildingCount: Number(cityOrMetrics.buildingCount || 0),
				};
			}
		}

		return this.#getMetrics(cityOrMetrics);
	}
}
