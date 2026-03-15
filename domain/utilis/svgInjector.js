class SVGInjector {
  /**
   * Constructor del inyector de SVG
   * @param {Object} config - Configuración con la estructura de modelos SVG
   * @param {boolean} debug - Mostrar logs de depuración
   */
  constructor(config, debug = false) {
    this.debug = debug;
    this.config = config;
    this.data = {};
    this.models = {};
    this._parseConfig(config);
  }

  /**
   * Parsea la configuración y extrae las rutas de los SVG
   * Maneja estructuras anidadas complejas
   * @private
   */
  _parseConfig(config, prefix = "") {
    for (const [key, value] of Object.entries(config)) {
      // Crear identificador según la clave
      let id;
      if (key === "") {
        // Si la clave es vacía, usar solo el prefijo
        // Ejemplo: "g": { "": {...} } → id = "g"
        id = prefix;
      } else if (prefix) {
        // Si hay prefijo, concatenar con punto
        // Ejemplo: "R": { "1": {...} } → id = "R.1"
        id = `${prefix}.${key}`;
      } else {
        // Sin prefijo, usar solo la clave
        // Ejemplo: "build": {...} → id = "build"
        id = key;
      }

      if (value && typeof value === "object" && value.model) {
        // Es un objeto con propiedad 'model'
        this.data[id] = value.model;
        if (this.debug) console.log(`[SVGInjector] Modelo encontrado: ${id}`);
      } else if (value && typeof value === "object" && !value.model) {
        // Es un objeto anidado, recurrir
        this._parseConfig(value, id);
      }
    }
  }

  /**
   * Factory estática para crear e inicializar la instancia
   * @static
   * @param {Object} config - Configuración de SVG
   * @param {boolean} debug - Habilitar logs de depuración
   * @returns {Promise<SVGInjector>} Instancia inicializada
   */
  static async create(config, debug = false) {
    const instance = new SVGInjector(config, debug);
    await instance.svgLoader();
    return instance;
  }

  /**
   * Carga todos los SVG en paralelo
   * @async
   * @throws {Error} Si algún SVG no se puede cargar
   */
  async svgLoader() {
    try {
      const loadPromises = [];

      for (const [key, url] of Object.entries(this.data)) {
        const promise = this._loadSingleSvg(key, url);
        loadPromises.push(promise);
      }

      await Promise.all(loadPromises);
      if (this.debug)
        console.log(
          `[SVGInjector] ${loadPromises.length} SVGs cargados exitosamente`,
        );
    } catch (error) {
      console.error(`[SVGInjector] Error al cargar los SVG: ${error}`);
      throw error;
    }
  }

  /**
   * Carga un único SVG
   * @private
   * @param {string} key - Identificador del SVG
   * @param {string} url - URL del SVG
   * @returns {Promise<void>}
   */
  async _loadSingleSvg(key, url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      let svgContent = await response.text();

      // Limpiar código de live-server inyectado
      svgContent = svgContent.replace(
        /<!--\s*Code injected by live-server[\s\S]*?<\/script>\s*<\/svg>/,
        "</svg>",
      );

      this.models[key] = svgContent;
    } catch (error) {
      throw new Error(
        `Error al cargar el modelo SVG '${key}' desde ${url}: ${error.message}`,
      );
    }
  }

  /**
   * Obtiene un modelo SVG por su identificador
   * @param {string} key - Identificador del modelo
   * @returns {string|null} Contenido del SVG o null si no existe
   */
  getModel(key) {
    return this.models[key] || null;
  }

  /**
   * Obtiene todos los identificadores de modelos disponibles
   * @returns {string[]} Array de identificadores
   */
  getModelKeys() {
    return Object.keys(this.models);
  }

  /**
   * Verifica si un modelo existe
   * @param {string} key - Identificador del modelo
   * @returns {boolean} True si el modelo existe
   */
  hasModel(key) {
    return key in this.models;
  }

  /**
   * Obtiene información sobre los modelos cargados
   * @returns {Object} Estadísticas de carga
   */
  getStats() {
    return {
      total: Object.keys(this.models).length,
      modelos: Object.keys(this.models),
    };
  }
}

globalThis.SVGInjector = SVGInjector;
