export class MapRouteController {
	static routeMode = false;
	static routeStart = null;
	static routeEnd = null;
	static routeCalculating = false;
	static routeTestControlsBound = false;
	static routeHighlightTimeoutMs = 3500;
	static routeHighlightTimer = null;

	static deps = {
		setInteractionLock: () => {},
		showToast: () => {},
		selectMapCell: () => {},
		clearCellSelection: () => {},
		setInteractionMode: () => {},
		calculateMapRoute: async () => ({ ok: false, error: "No configurado" }),
	};

	static configure(deps) {
		this.deps = { ...this.deps, ...deps };
	}

	static clearRouteHighlight() {
		if (this.routeHighlightTimer) {
			clearTimeout(this.routeHighlightTimer);
			this.routeHighlightTimer = null;
		}

		document
			.querySelectorAll(".map-item.route-highlight, .map-item.route-highlight-endpoint")
			.forEach((el) => {
				el.classList.remove("route-highlight");
				el.classList.remove("route-highlight-endpoint");
			});
	}

	static highlightRoute(route = []) {
		if (!Array.isArray(route) || !route.length) return;

		this.clearRouteHighlight();

		route.forEach((point) => {
			if (!Array.isArray(point) || point.length < 2) return;

			const i = Number.parseInt(point[0], 10);
			const j = Number.parseInt(point[1], 10);
			if (Number.isNaN(i) || Number.isNaN(j)) return;

			const id = `${String(i).padStart(2, "0")}${String(j).padStart(2, "0")}`;
			document
				.querySelector(`#map-item-${id}`)
				?.classList.add("route-highlight");
		});

		const endpoints = [route[0], route[route.length - 1]];
		endpoints.forEach((point) => {
			if (!Array.isArray(point) || point.length < 2) return;

			const i = Number.parseInt(point[0], 10);
			const j = Number.parseInt(point[1], 10);
			if (Number.isNaN(i) || Number.isNaN(j)) return;

			const id = `${String(i).padStart(2, "0")}${String(j).padStart(2, "0")}`;
			document
				.querySelector(`#map-item-${id}`)
				?.classList.add("route-highlight-endpoint");
		});

		this.routeHighlightTimer = setTimeout(() => {
			document
				.querySelectorAll(".map-item.route-highlight, .map-item.route-highlight-endpoint")
				.forEach((el) => {
					el.classList.remove("route-highlight");
					el.classList.remove("route-highlight-endpoint");
				});
			this.routeHighlightTimer = null;
		}, this.routeHighlightTimeoutMs);
	}

	static activateRouteMode() {
		if (this.routeCalculating) return;

		this.clearRouteHighlight();
		this.routeMode = true;
		this.routeStart = null;
		this.routeEnd = null;
		this.deps.clearCellSelection();
		this.deps.setInteractionMode("route");
		this.deps.showToast(
			"Modo ruta activo: selecciona el punto de inicio.",
			"info",
			2600,
		);
	}

	static bindRouteModeTestControls() {
		if (this.routeTestControlsBound) return;
		this.routeTestControlsBound = true;

		document.addEventListener("keydown", (e) => {
			const activeTag = document.activeElement?.tagName;
			if (activeTag === "INPUT" || activeTag === "TEXTAREA") return;
			if (!e.shiftKey || e.key.toLowerCase() !== "r") return;

			e.preventDefault();
			this.activateRouteMode();
		});

		window.activateRouteMode = () => this.activateRouteMode();
	}

	static async runRouteCalculation() {
		if (!this.routeStart || !this.routeEnd || this.routeCalculating) return;

		this.routeCalculating = true;
		this.deps.setInteractionLock(true);
		this.deps.showToast(
			"Calculando ruta, espera un momento...",
			"info",
			4000,
		);

		const result = await this.deps.calculateMapRoute(
			this.routeStart,
			this.routeEnd,
		);

		this.routeCalculating = false;
		this.deps.setInteractionLock(false);
		this.routeMode = false;

		if (!result?.ok) {
			this.deps.showToast(
				result?.error || "No se pudo calcular la ruta.",
				"error",
				3500,
			);
			return;
		}

		this.highlightRoute(result?.route || []);
		this.deps.showToast("Ruta encontrada.", "success", 1800);
	}

	static handleRouteCellClick(id, cellData, i, j) {
		if (this.routeCalculating) {
			return true;
		}

		if (!this.routeMode) {
			return false;
		}

		if (!this.routeStart) {
			this.routeStart = [i, j];
			this.deps.selectMapCell(id, cellData, i, j);
			this.deps.showToast(
				"Punto de inicio seleccionado. Ahora selecciona el destino.",
				"info",
				2200,
			);
			return true;
		}

		this.routeEnd = [i, j];
		this.deps.selectMapCell(id, cellData, i, j);
		this.runRouteCalculation();
		return true;
	}
}
