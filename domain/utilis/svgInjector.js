class SVGInjector {
  constructor(config) {
    let type = Object.keys(config);
    let data = {};
    for (let i = 0; i < type.length; i++) {
      let subtype = Object.keys(config[type[i]]);

      for (let j = 0; j < subtype.length; j++) {
        data[`${type[i]}${subtype[j]}`] = config[type[i]][subtype[j]].model;
      }
    }
    console.log("🔑 Claves SVG disponibles:", Object.keys(data));
    this.data = data;
    this.models = {};
  }

  static async create(config) {
    const instance = new SVGInjector(config);
    await instance.svgLoader();
    return instance;
  }

  async svgLoader() {
    try {
      const loadPromises = [];

      for (const key in this.data) {
        const promise = fetch(this.data[key])
          .then((response) => {
            if (!response.ok) {
              throw new Error(
                `error al cargar el modelo svg ${key}: ${response.status}`,
              );
            }
            return response.text();
          })
          .then((svgContent) => {
            // Limpiar código de live-server inyectado
            const cleanedContent = svgContent.replace(
              /<!--\s*Code injected by live-server[\s\S]*?<\/script>\s*<\/svg>/,
              "</svg>",
            );
            this.models[key] = cleanedContent;
            console.log(`modelo ${key} cargado exitosamente`);
          });

        loadPromises.push(promise);
      }

      await Promise.all(loadPromises);
      console.log("todos los modelos svg se han cargado exitosamente");
    } catch (error) {
      console.error(`error al encontrar el svg: ${error}`);
      throw error;
    }
  }

  getModel(key) {
    return this.models[key] || null;
  }
}
