// domain/services/MapCamera.js
class MapCamera {
  #viewport;
  #mapElement;
  #styleSheet;
  #cssTransformRuleIndex = null;

  #state;
  #didDeselectDuringPan = false;
  #onPanStartCallback = null;
  #panBounds;

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

    if (this.#viewport.dataset.cameraReady === "true") {
      Logger.warn("⚠️ [MapCamera] Ya estaba inicializada");
      console.warn("MapCamera ya inicializada para este viewport");
      return;
    }

    const defaults = {
      scale: 1,
      minScale: 0.7,
      maxScale: 4,
      x: 0,
      y: 0,
      bounds: { top: 0, right: 0, bottom: 0, left: 0 },
    };

    const config = { ...defaults, ...options };

    this.#state = {
      zoomScale: config.scale,
      minZoomScale: config.minScale,
      maxZoomScale: config.maxScale,
      panX: config.x,
      panY: config.y,
      panning: false,
      hasPanned: false,
      panOriginX: 0,
      panOriginY: 0,
      lastPinchDistance: null,
      lastPinchCenter: null,
    };

    this.#panBounds = { ...defaults.bounds, ...config.bounds };

    this.#viewport.dataset.cameraReady = "true";
    Logger.log(
      "✅ [MapCamera] Configuración completa, zoomScale:",
      this.#state.zoomScale,
    );
    this.#initialize();
  }

  // =====================
  // GETTERS
  // =====================

  get isPanning() {
    return this.#state.panning;
  }

  get hasPanned() {
    return this.#state.hasPanned;
  }

  get panPosition() {
    return { x: this.#state.panX, y: this.#state.panY };
  }

  get zoomScale() {
    return this.#state.zoomScale;
  }

  // =====================
  // PUBLIC METHODS
  // =====================

  onPanStart(callback) {
    this.#onPanStartCallback = callback;
  }

  zoomToScale(scale, clientX = null, clientY = null) {
    if (clientX !== null && clientY !== null) {
      this.#zoomAtClientPoint(clientX, clientY, scale);
    } else {
      const centerX = this.#viewport.clientWidth / 2;
      const centerY = this.#viewport.clientHeight / 2;
      this.#zoomAtClientPoint(centerX, centerY, scale);
    }
  }

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

  fitToViewport() {
    this.#fitContentToViewport();
  }

  setPanBounds(bounds) {
    this.#panBounds = { ...this.#panBounds, ...bounds };
  }

  setZoomLimits(minScale, maxScale) {
    if (minScale !== undefined) this.#state.minZoomScale = minScale;
    if (maxScale !== undefined) this.#state.maxZoomScale = maxScale;
  }

  applyResponsiveZoom(scaleByWidth = {}) {
    const targetScale = this.#resolveResponsiveScale(
      window.innerWidth,
      scaleByWidth,
    );

    if (targetScale === null) return null;

    const worldCenterX = this.#mapElement.offsetWidth / 2;
    const worldCenterY = this.#mapElement.offsetHeight / 2;
    if (targetScale === 1) {
      this.fitToViewport();
    }else this.centerOnWorldPoint(worldCenterX, worldCenterY, targetScale);
    return targetScale;
  }

  // =====================
  // PRIVATE METHODS
  // =====================

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

  #clampAxis(next, scaledSize, viewportSize, [boundsStart, boundsEnd]) {
    if (scaledSize <= viewportSize) {
      return (viewportSize - scaledSize) / 2;
    }
    const min = viewportSize - scaledSize - boundsEnd;
    const max = boundsStart;
    return Math.min(max, Math.max(min, next));
  }

  #clampPanPosition(nextX, nextY, scale = this.#state.zoomScale) {
    const mapWidth = this.#mapElement.offsetWidth;
    const mapHeight = this.#mapElement.offsetHeight;
    const scaledWidth = mapWidth * scale;
    const scaledHeight = mapHeight * scale;

    if (!mapWidth || !mapHeight) {
      return { x: nextX, y: nextY };
    }

    return {
      x: this.#clampAxis(nextX, scaledWidth, this.#viewport.clientWidth, [
        this.#panBounds.left,
        this.#panBounds.right,
      ]),
      y: this.#clampAxis(nextY, scaledHeight, this.#viewport.clientHeight, [
        this.#panBounds.top,
        this.#panBounds.bottom,
      ]),
    };
  }

  #fitContentToViewport() {
    const mapWidth = this.#mapElement.offsetWidth;
    const mapHeight = this.#mapElement.offsetHeight;

    if (!mapWidth || !mapHeight) return;

    const viewportWidth = this.#viewport.clientWidth;
    const viewportHeight = this.#viewport.clientHeight;

    const scaleY = viewportHeight / mapHeight;

    const sizeVar = Number.parseFloat(
      getComputedStyle(this.#mapElement).getPropertyValue("--size"),
    );
    const scaleX = viewportWidth / mapWidth;
    const roundedCellSize = sizeVar > 0 ? mapWidth / sizeVar : 0;
    const idealCellSize = sizeVar > 0 ? viewportWidth / sizeVar : 0;
    const correctedScaleX =
      roundedCellSize > 0 ? idealCellSize / roundedCellSize : scaleX;

    const fitScale = Math.min(scaleY, correctedScaleX);
    const nextScale = this.#clampZoom(fitScale * 0.999);
    this.#state.zoomScale = nextScale;
    const clampedPosition = this.#clampPanPosition(
      (viewportWidth - mapWidth * this.#state.zoomScale) / 2,
      (viewportHeight - mapHeight * this.#state.zoomScale) / 2,
      this.#state.zoomScale,
    );

    this.#state.panX = clampedPosition.x;
    this.#state.panY = clampedPosition.y;
    this.#commitTransform();
  }

  #resolveResponsiveScale(screenWidth, scaleByWidth) {
    const entries = Object.entries(scaleByWidth)
      .map(([width, scale]) => ({
        width: Number.parseFloat(width),
        scale: Number.parseFloat(scale),
      }))
      .filter(
        (entry) => Number.isFinite(entry.width) && Number.isFinite(entry.scale),
      )
      .sort((a, b) => a.width - b.width);

    if (entries.length === 0) return null;

    for (const entry of entries) {
      if (screenWidth <= entry.width) return entry.scale;
    }

    return entries[entries.length - 1].scale;
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
    return Math.min(
      this.#state.maxZoomScale,
      Math.max(this.#state.minZoomScale, value),
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

  #getPinchDistance(touchA, touchB) {
    const dx = touchA.clientX - touchB.clientX;
    const dy = touchA.clientY - touchB.clientY;
    return Math.hypot(dx, dy);
  }

  #getPinchCenter(touchA, touchB) {
    return {
      x: (touchA.clientX + touchB.clientX) / 2,
      y: (touchA.clientY + touchB.clientY) / 2,
    };
  }

  #applyPinchGesture(touches) {
    const [touchA, touchB] = touches;
    const distance = this.#getPinchDistance(touchA, touchB);
    const center = this.#getPinchCenter(touchA, touchB);

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

  #bindEventListeners() {
    // Viewport resize
    window.addEventListener("resize", () => {
      const clampedPosition = this.#clampPanPosition(
        this.#state.panX,
        this.#state.panY,
      );
      this.#state.panX = clampedPosition.x;
      this.#state.panY = clampedPosition.y;
      this.#commitTransform();
    });

    // Wheel zoom
    this.#viewport.addEventListener(
      "wheel",
      (event) => {
        event.preventDefault();
        const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9;
        this.#zoomAtClientPoint(
          event.clientX,
          event.clientY,
          this.#state.zoomScale * zoomFactor,
        );
      },
      { passive: false },
    );

    // Mouse pan
    this.#viewport.addEventListener("mousedown", (event) => {
      if (event.button !== 0) return;
      event.preventDefault();

      this.#beginPan(event.clientX, event.clientY);
      this.#viewport.classList.add("dragging");
    });

    window.addEventListener("mousemove", (event) => {
      if (!this.#state.panning) return;

      const nextX = event.clientX - this.#state.panOriginX;
      const nextY = event.clientY - this.#state.panOriginY;
      this.#applyPanMovement(nextX, nextY);
    });

    window.addEventListener("mouseup", () => {
      if (!this.#state.panning) return;

      this.#endPan();
      this.#viewport.classList.remove("dragging");
    });

    this.#viewport.addEventListener("mouseleave", () => {
      if (!this.#state.panning) return;

      this.#endPan(false);
      this.#viewport.classList.remove("dragging");
    });

    // Touch pan
    this.#viewport.addEventListener(
      "touchstart",
      (event) => {
        if (event.touches.length === 1) {
          const touch = event.touches[0];
          this.#beginPan(touch.clientX, touch.clientY);
        }

        if (event.touches.length === 2) {
          this.#endPan(false);
          this.#applyPinchGesture(event.touches);
        }
      },
      { passive: true },
    );

    this.#viewport.addEventListener(
      "touchmove",
      (event) => {
        if (event.touches.length === 1 && this.#state.panning) {
          event.preventDefault();
          const touch = event.touches[0];
          const nextX = touch.clientX - this.#state.panOriginX;
          const nextY = touch.clientY - this.#state.panOriginY;
          this.#applyPanMovement(nextX, nextY);
        }

        if (event.touches.length === 2) {
          event.preventDefault();
          this.#applyPinchGesture(event.touches);
        }
      },
      { passive: false },
    );

    this.#viewport.addEventListener("touchend", (event) => {
      if (event.touches.length === 0) {
        this.#endPan();
        this.#state.lastPinchDistance = null;
        this.#state.lastPinchCenter = null;
      }
    });
  }
}

window.MapCamera = MapCamera;
