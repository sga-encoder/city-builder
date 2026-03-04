class Map {
  constructor(dict) {
    const { layout, widthChunck, heightChunk, nameCointainer, SVGInjector } = dict;
    this.widthChunk = widthChunck;
    this.heightChunk = heightChunk;
    this.container = document.querySelector(nameCointainer);
    this.SVGInjector = SVGInjector;
    this.grid = this.createMap(layout);
  }

  createMap(layout) {
    const map = document.createElement("div");
    map.classList.add("map");
    map.style.setProperty("--width-ground", `${this.widthChunk}vw`);
    map.style.setProperty("--height-ground", `${this.heightChunk}vw`);
    map.style.setProperty("--size", `${layout.length}vw`);

    this.container.appendChild(map);

    const mapContainer = document.createElement("div");
    mapContainer.classList.add("map-container");
    map.appendChild(mapContainer);

    let instance = [];

    for (let i = 0; i < layout.length; i++) {
      let aux = [];
      for (let j = 0; j < layout.length; j++) {
        const col = document.createElement("div");
        let id = `${String(i).padStart(2, "0")}${String(j).padStart(2, "0")}`;

        col.classList.add(`map-item`);
        col.classList.add(`map-item-${id}`);
        col.style.setProperty("--i", i);
        col.style.setProperty("--j", j);

        let type = layout[i][j][0];
        let subtype = layout[i][j][1] === undefined ? "" : layout[i][j][1];

        const modelKey = `${type}${subtype}`;
        const model = this.SVGInjector.getModel(modelKey);
        
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
      instance.push(aux);
      }
    LocalStorage.saveData("map", JSON.stringify(instance));
    return instance;
  }
}
