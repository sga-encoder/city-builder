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
        col.classList.add("map-item");
        col.style.setProperty("--i", i);
        col.style.setProperty("--j", j);
        
        let id = `${i}-${j}`;
        let type = layout[i][j][0];
        let subtype = layout[i][j][1] === undefined ? "" : layout[i][j][1];
 
        const modelKey = `${type}${subtype}`;
        const model = this.SVGInjector.getModel(modelKey);
        console.log(`🏗️ Building ${modelKey}:`, model ? "✅ SVG cargado" : "❌ NULL - no encontrado");
        
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
    console.log(instance);
    return instance;
  }
}
