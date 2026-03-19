export class MapRouteController {
	static routeMode = false;
	static routeStart = null;
	static routeEnd = null;
	static routeCalculating = false;
	static routeTestControlsBound = false;

	static deps = {
		showToast: () => {},
		selectMapCell: () => {},
		clearCellSelection: () => {},
		setInteractionMode: () => {},
		calculateMapRoute: async () => ({ ok: false, error: "No configurado" }),
	};

	static configure(deps) {
		this.deps = { ...this.deps, ...deps };
	}

	static activateRouteMode() {
		if (this.routeCalculating) return;

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
		this.routeMode = false;

		if (!result?.ok) {
			this.deps.showToast(
				result?.error || "No se pudo calcular la ruta.",
				"error",
				3500,
			);
			return;
		}

		// La visualización de la ruta se implementará más adelante.
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
