class Map {
  constructor(dict) {
    Logger.log("🗺️ [Map] Constructor llamado");
    const { layout, nameCointainer, svgModels } = dict;
    Logger.log("🔍 [Map] Buscando container:", nameCointainer);
    this.container = document.querySelector(nameCointainer);

    if (!this.container) {
      Logger.error(`❌ [Map] Container NO encontrado: ${nameCointainer}`);
      return;
    }

    this.observers = [];
    this.persistDebounce = null;

    Logger.log("✅ [Map] Container encontrado:", this.container);
    this.svgModels = svgModels;
    Logger.log("🏗️ [Map] Llamando createMap con layout:", layout.length);
    this.grid = this.createMap(layout);
    Logger.log("✅ [Map] Grid creado con", this.grid?.length, "filas");


  }

  addObserver(callback) {
    if (typeof callback === "function") this.observers.push(callback);
  }

  removeObserver(callback) {
    this.observers = this.observers.filter((obs) => obs !== callback);
  }

  notifyObservers(payload) {
    this.observers.forEach((callback) => callback(payload));
  }

  schedulePersist() {
    clearTimeout(this.persistDebounce);
    this.persistDebounce = setTimeout(() => {
      LocalStorage.saveData("map", JSON.stringify(this.toSerializableGrid()));
    }, 120);
  }

  createMap(layout) {
    Logger.log("🎨 [Map.createMap] Iniciando creación del mapa");
    if (!this.container) {
      Logger.error("❌ [Map.createMap] container es null");
      return [];
    }

    const sheet = document.styleSheets[0];

    if (!sheet) {
      Logger.error("❌ [Map.createMap] No hay stylesheets disponibles");
      return [];
    }

    Logger.log("✅ [Map.createMap] Stylesheet encontrado");
    const map = document.createElement("div");
    map.classList.add("map");

    let rawWidth = this.container.offsetWidth / layout.length;
    let width = Math.max(20, Math.round(rawWidth / 20) * 20);
    let height = width * 0.6;

    const widthMap = width * layout.length;
    const heightMap = height * layout.length;

    const ruleMapRende = `.map{ --width-map:${widthMap}px; --height-map:${heightMap}px; --size:${layout.length}; }`;
    sheet.insertRule(ruleMapRende, sheet.cssRules.length);

    this.container.appendChild(map);

    const mapContainer = document.createElement("div");
    mapContainer.classList.add("map-container");
    map.appendChild(mapContainer);

    let instances = [];

    for (let i = 0; i < layout.length; i++) {
      let aux = [];
      for (let j = 0; j < layout.length; j++) {
        const col = document.createElement("div");
        let id = `${String(i).padStart(2, "0")}${String(j).padStart(2, "0")}`;

        col.classList.add(`map-item`);
        col.id = `map-item-${id}`;

        let left = (i + j) * (width / 2);
        let top = (i - j) * (width / 4);
        let indexZ = layout.length * 100 - j * 100;

        const rule = `#map-item-${id}{ --i:${i}; --j:${j}; --top:${top}px; --left:${left}px; --height:${height}px; --width: ${width}px;--z-index:${indexZ}; }`;
        sheet.insertRule(rule, sheet.cssRules.length);

        let type = layout[i][j][0];
        let subtype = layout[i][j][1] === undefined ? "" : layout[i][j][1];

        const modelKey = subtype === "" ? `${type}` : `${type}.${subtype}`;
        const model = this.svgModels.getModel(modelKey);

        const ground = Building.create({
          id,
          type,
          subtype,
          model: model,
        });

        aux.push(ground);
        col.appendChild(ground.build());
        mapContainer.appendChild(col);
      }
      instances.push(aux);
    }

    // Serializar solo para localStorage (datos simples, no instancias)
    this.grid = instances;
    this.schedulePersist();
    this.notifyObservers({ type: "map-initialized", size: layout.length });
    return instances;
  }

  toSerializableGrid() {
    return this.grid.map((row) => row.map((building) => ({ ...building })));
  }

  setBuildingAt(i, j, building) {
    if (!this.grid?.[i]?.[j]) return false;

    const previous = this.grid[i][j];
    this.grid[i][j] = building;

    this.schedulePersist();
    this.notifyObservers({
      type: "cell-updated",
      i,
      j,
      id: building.id,
      previous,
      current: building,
    });

    return true;
  }

  moveBuilding(fromI, fromJ, toI, toJ, groundBuildingFactory) {
    const source = this.grid?.[fromI]?.[fromJ];
    const target = this.grid?.[toI]?.[toJ];
    if (!source || !target) return false;
    if (target.type !== "g") return false;

    const ground = groundBuildingFactory(source.id, fromI, fromJ);
    this.grid[fromI][fromJ] = ground;
    this.grid[toI][toJ] = source;

    this.schedulePersist();
    this.notifyObservers({
      type: "cell-updated",
      i: fromI,
      j: fromJ,
      id: ground.id,
      current: ground,
    });
    this.notifyObservers({
      type: "cell-updated",
      i: toI,
      j: toJ,
      id: source.id,
      current: source,
    });

    return true;
  }
}
