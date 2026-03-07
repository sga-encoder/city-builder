class Map {
  constructor(dict) {
    const { layout,  nameCointainer, SVGInjector } = dict;
    this.container = document.querySelector(nameCointainer);
    this.SVGInjector = SVGInjector;
    this.grid = this.createMap(layout);
  }

  createMap(layout) {
    const sheet = document.styleSheets[0];

    const map = document.createElement("div");
    map.classList.add("map");

    let width = Math.round(this.container.offsetWidth/ layout.length);
    let height =  width;

    const ruleMapRende = `.map{ --width-ground:${width}px; --height-ground:${height}px; --size:${layout.length}; }`;
    sheet.insertRule(ruleMapRende, sheet.cssRules.length);
    
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
        col.id = `map-item-${id}`;

        const rule = `#map-item-${id}{ --i:${i}; --j:${j}; }`;
        sheet.insertRule(rule, sheet.cssRules.length);



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
