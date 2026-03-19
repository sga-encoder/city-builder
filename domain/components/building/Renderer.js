export class BuildingRenderer {
  static render(buildingInstance) {
    const building = document.createElement("div");
    building.id = `building-${buildingInstance.id}`;
    building.classList.add(
      "building",
      `${buildingInstance.type}${buildingInstance.subtype}`,
    );
    building.innerHTML = buildingInstance.model;
    return building;
  }
}
