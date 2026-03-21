import { MapBuildController } from "./BuildController.js";
import { MapSelectionController } from "./SelectionController.js";
import { LocalStorage } from "../../../database/localStorage.js";
import { ToastService } from "../../services/toast.js";

export class RouteModeController {
	static state = {
		active: false,
		btnId: "r",
		selectedCells: new Map(),
	};

	static isRoadBuildModeActive() {
		return this.state.active === true;
	}

	static getRoadBuildSummary() {
		const selectedCount = this.state.selectedCells.size;
		const building = MapBuildController.getBuildingToBuy(this.state.btnId);
		const unitCost = Number(building?.cost || 0);

		return {
			active: this.isRoadBuildModeActive(),
			btnId: this.state.btnId,
			selectedCount,
			unitCost,
			totalCost: selectedCount * unitCost,
		};
	}

	static setRoadBuildSidebarVisibility(hidden) {
		const slideLeft = document.querySelector("#slide-left");
		if (!slideLeft) return;
		slideLeft.classList.toggle("road-build-hidden", !!hidden);
	}

	static startRoadBuildMode(mapController, btnId = "r") {
		this.cancelRoadBuildMode(mapController, { silent: true });

		if (mapController?.activeCell?.id) {
			document
				.querySelector(`#map-item-${mapController.activeCell.id}`)
				?.classList.remove("selected");
		}

		MapSelectionController.activeCell = null;
		LocalStorage.saveData("selectedCell", null);

		this.state.active = true;
		this.state.btnId = btnId;
		this.state.selectedCells = new Map();

		mapController?.mapContainerElement?.classList.add("road-build-mode");
		this.setRoadBuildSidebarVisibility(true);

		if (mapController) {
			mapController.interactionMode = "build";
		}

		ToastService.mostrarToast(
			"Modo vías activo: selecciona celdas vacías y confirma para construir.",
			"success",
			2600,
		);
	}

	static toggleRoadBuildCell(id, cellData, i, j) {
		if (!this.isRoadBuildModeActive()) return false;

		if (cellData?.type !== "g") {
			ToastService.mostrarToast(
				"No puedes construir vías sobre otro edificio.",
				"error",
				1800,
			);
			return true;
		}

		const key = `${i}-${j}`;
		const item = document.querySelector(`#map-item-${id}`);
		if (!item) return true;

		if (this.state.selectedCells.has(key)) {
			this.state.selectedCells.delete(key);
			item.classList.remove("road-build-selected");
			return true;
		}

		this.state.selectedCells.set(key, { id, cellData, i, j });
		item.classList.add("road-build-selected");
		return true;
	}

	static clearRoadBuildSelectionVisuals() {
		for (const cell of this.state.selectedCells.values()) {
			document
				.querySelector(`#map-item-${cell.id}`)
				?.classList.remove("road-build-selected");
		}
	}

	static cancelRoadBuildMode(mapController, { silent = false } = {}) {
		if (!this.isRoadBuildModeActive()) {
			this.setRoadBuildSidebarVisibility(false);
			document.querySelector(".road-build-actions")?.remove();
			return;
		}

		this.clearRoadBuildSelectionVisuals();
		this.state.selectedCells.clear();
		this.state.active = false;
		mapController?.mapContainerElement?.classList.remove("road-build-mode");
		this.setRoadBuildSidebarVisibility(false);
		document.querySelector(".road-build-actions")?.remove();

		if (!silent) {
			ToastService.mostrarToast("Construcción de vías cancelada.", "warning", 1800);
		}
	}

	static confirmRoadBuild(mapController, builds) {
		if (!this.isRoadBuildModeActive()) {
			return { ok: false, message: "El modo vías no está activo." };
		}

		const cells = Array.from(this.state.selectedCells.values());
		const result = MapBuildController.buyBuildingCellsBatch(
			this.state.btnId,
			builds,
			cells,
			mapController?.mapModel,
			mapController?.city,
		);

		if (!result.ok) {
			return result;
		}

		this.cancelRoadBuildMode(mapController, { silent: true });
		return result;
	}
}
