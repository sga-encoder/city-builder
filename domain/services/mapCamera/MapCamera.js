import { Logger } from "../../utilis/Logger.js";
import { MapCameraEventBinder } from "./EventBinder.js";
import { MapCameraCalculations } from "./Calculations.js";
/**
 * @typedef {Object} MapCameraOptions
 * @property {number} [scale=1]
 * @property {number} [minScale=0.7]
 * @property {number} [maxScale=4]
 * @property {number} [x=0]
 * @property {number} [y=0]
 * @property {{top?:number,right?:number,bottom?:number,left?:number}} [bounds]
 */

/**
 * Camara 2D para el mapa: controla zoom, paneo y gestos tactiles.
 */
export class MapCamera {
  #viewport;
  #mapElement;
  #styleSheet;
  #cssTransformRuleIndex = null;

  #state;
  #didDeselectDuringPan = false;
  #onPanStartCallback = null;
  #panBounds;

  /**
   * @param {string} viewportSelector Selector del contenedor del mapa.
   * @param {CSSStyleSheet} styleSheet Hoja donde se inyecta la regla transform.
   * @param {MapCameraOptions} [options={}]
   */
  constructor(viewportSelector, styleSheet, options = {}) {
    Logger.log("🎥 [MapCamera] Constructor llamado:", viewportSelector);
    this.#viewport = document.querySelector(viewportSelector);
    this.#mapElement = this.#viewport?.querySelector(".map");
    this.#styleSheet = styleSheet;

    if (!this.#viewport || !this.#mapElement) {
      Logger.error("❌ [MapCamera] No se encontró viewport o mapa");
      throw new Error(
        `MapCamera: no se encontró viewport o mapa para "${viewportSelector}"`,
      );
    }

    const config = MapCameraCalculations.createConfig(options);
    this.#state = config.state;
    this.#panBounds = config.bounds;

    Logger.log(
      "✅ [MapCamera] Configuración completa, zoomScale:",
      this.#state.zoomScale,
    );
    this.#initialize();
  }

  /**
   * Indica si existe un paneo activo.
   * @returns {boolean}
   */
  get isPanning() {
    return this.#state.panning;
  }

  /**
   * Indica si hubo desplazamiento significativo durante el gesto actual.
   * @returns {boolean}
   */
  get hasPanned() {
    return this.#state.hasPanned;
  }

  /**
   * Posicion actual de paneo.
   * @returns {{x:number,y:number}}
   */
  get panPosition() {
    return { x: this.#state.panX, y: this.#state.panY };
  }

  /**
   * Escala de zoom actual.
   * @returns {number}
   */
  get zoomScale() {
    return this.#state.zoomScale;
  }

  /**
   * Registra callback que se dispara al iniciar un paneo real.
   * @param {() => void} callback
   * @returns {void}
   */
  onPanStart(callback) {
    this.#onPanStartCallback = callback;
  }

  /**
   * Aplica zoom hacia una escala objetivo, centrado en un punto de pantalla.
   * @param {number} scale
   * @param {number|null} [clientX=null]
   * @param {number|null} [clientY=null]
   * @returns {void}
   */
  zoomToScale(scale, clientX = null, clientY = null) {
    if (clientX !== null && clientY !== null) {
      this.#zoomAtClientPoint(clientX, clientY, scale);
      return;
    }

    const centerX = this.#viewport.clientWidth / 2;
    const centerY = this.#viewport.clientHeight / 2;
    this.#zoomAtClientPoint(centerX, centerY, scale);
  }

  /**
   * Centra la vista sobre una coordenada del mundo.
   * @param {number} worldX
   * @param {number} worldY
   * @param {number} [scale=this.#state.zoomScale]
   * @returns {void}
   */
  centerOnWorldPoint(worldX, worldY, scale = this.#state.zoomScale) {
    const centerX = this.#viewport.clientWidth / 2;
    const centerY = this.#viewport.clientHeight / 2;

    this.#state.zoomScale = this.#clampZoom(scale);
    const clampedPosition = this.#clampPanPosition(
      centerX - worldX * this.#state.zoomScale,
      centerY - worldY * this.#state.zoomScale,
      this.#state.zoomScale,
    );

    this.#state.panX = clampedPosition.x;
    this.#state.panY = clampedPosition.y;
    this.#commitTransform();
  }

  /**
   * Ajusta el mapa para encajar en el viewport.
   * @returns {void}
   */
  fitToViewport() {
    this.#fitContentToViewport();
  }

  /**
   * Actualiza limites de paneo.
   * @param {{top?:number,right?:number,bottom?:number,left?:number}} bounds
   * @returns {void}
   */
  setPanBounds(bounds) {
    this.#panBounds = { ...this.#panBounds, ...bounds };
  }

  /**
   * Configura limites de zoom minimo y maximo.
   * @param {number} minScale
   * @param {number} maxScale
   * @returns {void}
   */
  setZoomLimits(minScale, maxScale) {
    if (minScale !== undefined) this.#state.minZoomScale = minScale;
    if (maxScale !== undefined) this.#state.maxZoomScale = maxScale;
  }

  /**
   * Aplica una escala segun ancho de pantalla usando breakpoints.
   * @param {Record<string|number, number>} [scaleByWidth={}]
   * @returns {number|null} Escala aplicada o null si no hubo reglas validas.
   */
  applyResponsiveZoom(scaleByWidth = {}) {
    const targetScale = MapCameraCalculations.resolveResponsiveScale(
      window.innerWidth,
      scaleByWidth,
    );

    if (targetScale === null) return null;

    const worldCenterX = this.#mapElement.offsetWidth / 2;
    const worldCenterY = this.#mapElement.offsetHeight / 2;

    if (targetScale === 1) {
      this.fitToViewport();
    } else {
      this.centerOnWorldPoint(worldCenterX, worldCenterY, targetScale);
    }

    return targetScale;
  }

  #initialize() {
    Logger.log("🔧 [MapCamera] Inicializando...");
    this.#fitContentToViewport();
    this.#bindEventListeners();
    Logger.log("✅ [MapCamera] Inicializado correctamente");
  }

  #commitTransform() {
    if (this.#cssTransformRuleIndex !== null) {
      this.#styleSheet.deleteRule(this.#cssTransformRuleIndex);
    }

    const rule = `.map{ transform: translate(${this.#state.panX}px, ${this.#state.panY}px) scale(${this.#state.zoomScale}); }`;
    this.#cssTransformRuleIndex = this.#styleSheet.insertRule(
      rule,
      this.#styleSheet.cssRules.length,
    );
  }

  #clampPanPosition(nextX, nextY, scale = this.#state.zoomScale) {
    return MapCameraCalculations.clampPanPosition({
      nextX,
      nextY,
      scale,
      mapWidth: this.#mapElement.offsetWidth,
      mapHeight: this.#mapElement.offsetHeight,
      viewportWidth: this.#viewport.clientWidth,
      viewportHeight: this.#viewport.clientHeight,
      bounds: this.#panBounds,
    });
  }

  #fitContentToViewport() {
    const sizeVar = Number.parseFloat(
      getComputedStyle(this.#mapElement).getPropertyValue("--size"),
    );

    const fitResult = MapCameraCalculations.fitContentToViewport({
      mapWidth: this.#mapElement.offsetWidth,
      mapHeight: this.#mapElement.offsetHeight,
      viewportWidth: this.#viewport.clientWidth,
      viewportHeight: this.#viewport.clientHeight,
      sizeVar,
      minZoomScale: this.#state.minZoomScale,
      maxZoomScale: this.#state.maxZoomScale,
      bounds: this.#panBounds,
    });

    if (!fitResult) return;

    this.#state.zoomScale = fitResult.zoomScale;
    this.#state.panX = fitResult.panPosition.x;
    this.#state.panY = fitResult.panPosition.y;
    this.#commitTransform();
  }

  #refreshTransform() {
    const clampedPosition = this.#clampPanPosition(
      this.#state.panX,
      this.#state.panY,
      this.#state.zoomScale,
    );

    this.#state.panX = clampedPosition.x;
    this.#state.panY = clampedPosition.y;
    this.#commitTransform();
  }

  #applyPanMovement(nextX, nextY) {
    const distance = Math.hypot(
      nextX - this.#state.panX,
      nextY - this.#state.panY,
    );

    if (distance > 2) {
      this.#state.hasPanned = true;

      if (!this.#didDeselectDuringPan && this.#onPanStartCallback) {
        this.#onPanStartCallback();
        this.#didDeselectDuringPan = true;
      }
    }

    const clampedPosition = this.#clampPanPosition(nextX, nextY);
    this.#state.panX = clampedPosition.x;
    this.#state.panY = clampedPosition.y;
    this.#commitTransform();
  }

  #beginPan(clientX, clientY) {
    this.#state.panning = true;
    this.#state.hasPanned = false;
    this.#didDeselectDuringPan = false;
    this.#state.panOriginX = clientX - this.#state.panX;
    this.#state.panOriginY = clientY - this.#state.panY;
  }

  #endPan(resetHasPanned = true) {
    this.#state.panning = false;

    if (resetHasPanned) {
      setTimeout(() => {
        this.#state.hasPanned = false;
      }, 0);
    }
  }

  #clampZoom(value) {
    return MapCameraCalculations.clampZoom(
      value,
      this.#state.minZoomScale,
      this.#state.maxZoomScale,
    );
  }

  #zoomAtClientPoint(clientX, clientY, nextScale) {
    const rect = this.#viewport.getBoundingClientRect();
    const localX = clientX - rect.left;
    const localY = clientY - rect.top;
    const worldX = (localX - this.#state.panX) / this.#state.zoomScale;
    const worldY = (localY - this.#state.panY) / this.#state.zoomScale;

    this.#state.zoomScale = this.#clampZoom(nextScale);
    const clampedPosition = this.#clampPanPosition(
      localX - worldX * this.#state.zoomScale,
      localY - worldY * this.#state.zoomScale,
      this.#state.zoomScale,
    );

    this.#state.panX = clampedPosition.x;
    this.#state.panY = clampedPosition.y;
    this.#commitTransform();
  }

  #applyPinchGesture(touches) {
    const [touchA, touchB] = touches;
    const distance = MapCameraCalculations.getPinchDistance(touchA, touchB);
    const center = MapCameraCalculations.getPinchCenter(touchA, touchB);

    if (this.#state.lastPinchDistance) {
      const pinchRatio = distance / this.#state.lastPinchDistance;
      this.#zoomAtClientPoint(
        center.x,
        center.y,
        this.#state.zoomScale * pinchRatio,
      );
    }

    this.#state.lastPinchDistance = distance;
    this.#state.lastPinchCenter = center;
  }

  #handleTouchEnd() {
    this.#endPan();
    this.#state.lastPinchDistance = null;
    this.#state.lastPinchCenter = null;
  }

  #bindEventListeners() {
    MapCameraEventBinder.bind({
      viewport: this.#viewport,
      getState: () => this.#state,
      beginPan: (x, y) => this.#beginPan(x, y),
      endPan: (resetHasPanned = true) => this.#endPan(resetHasPanned),
      applyPanMovement: (x, y) => this.#applyPanMovement(x, y),
      applyPinchGesture: (touches) => this.#applyPinchGesture(touches),
      zoomAtClientPoint: (x, y, scale) => this.#zoomAtClientPoint(x, y, scale),
      refreshTransform: () => this.#refreshTransform(),
      onTouchEnd: () => this.#handleTouchEnd(),
    });
  }
}
