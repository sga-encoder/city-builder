export class RoutingModeController {
	static ROAD_ACTIONS_SELECTOR = ".road-build-actions";

	static removeRoadActions() {
		document
			.querySelector(this.ROAD_ACTIONS_SELECTOR)
			?.remove();
	}

	static isRoadBuildButton(buttonId) {
		return String(buttonId || "").toLowerCase() === "r";
	}

	static renderRoadActions(context) {
		const { mapController } = context;
		this.removeRoadActions();

		if (!mapController?.isRoadBuildModeActive?.()) return;

		const actions = document.createElement("div");
		actions.classList.add("road-build-actions");

		const helper = document.createElement("span");
		helper.classList.add("road-build-helper");
		helper.textContent = "Selecciona celdas vacías y confirma.";

		const confirm = document.createElement("button");
		confirm.type = "button";
		confirm.id = "road-build-confirm";
		confirm.classList.add("road-build-action", "confirm");
		confirm.textContent = "Confirmar vías";

		const cancel = document.createElement("button");
		cancel.type = "button";
		cancel.id = "road-build-cancel";
		cancel.classList.add("road-build-action", "cancel");
		cancel.textContent = "Cancelar";

		actions.appendChild(helper);
		actions.appendChild(confirm);
		actions.appendChild(cancel);

		confirm.addEventListener("click", (e) => {
			e.stopPropagation();
			this.confirmRoadBuild(context);
		});

		cancel.addEventListener("click", (e) => {
			e.stopPropagation();
			this.cancelRoadBuild(context);
		});

		document.body.appendChild(actions);
	}

	static activateFromSelectBuilding(buttonId, context) {
		if (!this.isRoadBuildButton(buttonId)) return false;

		context.mapController.startRoadBuildMode(buttonId);
		this.renderRoadActions(context);
		return true;
	}

	static guardBuildWhileRoadMode(context) {
		const { mapController, logger } = context;
		if (!mapController?.isRoadBuildModeActive?.()) return false;

		logger?.warn(
			"[RoutingMode] Finaliza o cancela la construcción de vías antes de construir otro edificio.",
		);
		return true;
	}

	static confirmRoadBuild(context) {
		const { mapController, state, constants, setMenuState } = context;
		const result = mapController.confirmRoadBuild(state.builds);

		if (!result?.ok) {
			context.logger?.error(
				"[RoutingMode]",
				result?.message || "No se pudo completar la construcción de vías.",
			);
			return false;
		}

		context.logger?.log(
			`[RoutingMode] Construiste ${result.builtCount} vía(s) por $${result.cost}.`,
		);
		this.removeRoadActions();
		setMenuState(constants.MENU_STATE.NONE);
		return true;
	}

	static cancelRoadBuild(context) {
		const { mapController, constants, setMenuState } = context;
		mapController.cancelRoadBuildMode();
		this.removeRoadActions();
		setMenuState(constants.MENU_STATE.NONE);
	}
}
