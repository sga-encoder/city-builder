class MapBuildController {
  static buyBuildingCell(btnid, builds, cell, mapModel, city) {
    const [selectedEntry] = Map.buildingInstanceMap(btnid);
    const buildingToBuy = selectedEntry?.[1] || null;

    if (!buildingToBuy) {
      Logger.warn("⚠️ [MapController] No se encontró building para", btnid);
      return false;
    }

    if (!city.buyBuilding(buildingToBuy)) {
      Logger.warn(
        "⚠️ [MapController] No se pudo completar la compra para",
        btnid,
      );
      return false;
    }

    const result = this.replaceCellBuilding(btnid, builds, cell, mapModel);
    if (!result?.instance) {
      // Revertir descuento si no se pudo colocar en el mapa.
      city.resources.money.add(buildingToBuy.cost);
      Logger.warn(
        "⚠️ [MapController] No se pudo colocar el edificio en el mapa",
      );
      return false;
    }

    Logger.log("✅ [MapController] Edificio comprado y colocado en el mapa");
    return result;
  }

  static replaceCellBuilding(btnId, builds, cell, mapModel) {
    Logger.log("🏭 [MapController] changeBuild:", btnId, "en celda", cell.id);

      if (!mapModel) {
      Logger.error("❌ [MapController] No hay mapModel");
      return;
    }

    const [type, subtype] = [btnId[0], btnId[1]];
    const modelKey = subtype ? `${type}.${subtype}` : type;

    const building = Building.create({
      id: cell.id,
      type,
      subtype,
      model: builds.getModel(modelKey),
    });

    // Asignar la instancia directamente (no copia plana)
    mapModel.setBuildingAt(cell.i, cell.j, building);

    Logger.log("✅ [MapController] Edificio cambiado exitosamente");
    return { instance: building };
  }

  static moveBuildingCell(sourceCell, targetCell, builds, mapModel) {
    if (!mapModel || !sourceCell || !targetCell || !builds) return false;
    if (targetCell.cellData?.type !== "g") return false;

    const moved = mapModel.moveBuilding(
      sourceCell.i,
      sourceCell.j,
      targetCell.i,
      targetCell.j,
      (sourceId) =>
        Building.create({
          id: sourceId,
          type: "g",
          subtype: "",
          model: builds.getModel("g"),
        }),
    );

    if (!moved) return false;

    return true;
  }
}
