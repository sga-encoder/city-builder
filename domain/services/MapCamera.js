// domain/services/MapCamera.js
class MapCamera {
  #viewport;
  #map;
  #sheet;
  #transformRuleIndex = null;

  #state;
  #deselectedByDrag = false;
  #onDragCallback = null;
  #bounds;

  constructor(viewportSelector, styleSheet, options = {}) {
    Logger.log("🎥 [MapCamera] Constructor llamado:", viewportSelector);
    this.#viewport = document.querySelector(viewportSelector);
    this.#map = this.#viewport?.querySelector(".map");
    this.#sheet = styleSheet;

    if (!this.#viewport || !this.#map) {
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
      scale: config.scale,
      minScale: config.minScale,
      maxScale: config.maxScale,
      x: config.x,
      y: config.y,
      dragging: false,
      moved: false,
      startX: 0,
      startY: 0,
      pinchDistance: null,
      pinchCenter: null,
    };

    this.#bounds = { ...defaults.bounds, ...config.bounds };

    this.#viewport.dataset.cameraReady = "true";
    Logger.log(
      "✅ [MapCamera] Configuración completa, scale:",
      this.#state.scale,
    );
    this.#init();
  }

  get isDragging() {
    return this.#state.dragging;
  }

  get didDrag() {
    return this.#state.moved;
  }

  get position() {
    return { x: this.#state.x, y: this.#state.y };
  }

  get scale() {
    return this.#state.scale;
  }

  onDragStart(callback) {
    this.#onDragCallback = callback;
  }

  zoomTo(scale, clientX = null, clientY = null) {
    if (clientX !== null && clientY !== null) {
      this.#zoomAtPoint(clientX, clientY, scale);
    } else {
      // Zoom al centro del viewport
      const centerX = this.#viewport.clientWidth / 2;
      const centerY = this.#viewport.clientHeight / 2;
      this.#zoomAtPoint(centerX, centerY, scale);
    }
  }

  centerOn(worldX, worldY, scale = this.#state.scale) {
    const centerX = this.#viewport.clientWidth / 2;
    const centerY = this.#viewport.clientHeight / 2;

    this.#state.scale = this.#clampScale(scale);
    const clampedPosition = this.#clampTranslation(
      centerX - worldX * this.#state.scale,
      centerY - worldY * this.#state.scale,
      this.#state.scale,
    );

    this.#state.x = clampedPosition.x;
    this.#state.y = clampedPosition.y;
    this.#applyTransform();
  }

  reset() {
    this.#fitMapInViewport();
  }

  setBounds(bounds) {
    this.#bounds = { ...this.#bounds, ...bounds };
  }

  setScaleLimits(minScale, maxScale) {
    if (minScale !== undefined) this.#state.minScale = minScale;
    if (maxScale !== undefined) this.#state.maxScale = maxScale;
  }

  // =====================
  // MÉTODOS PRIVADOS
  // =====================

  #init() {
    Logger.log("🔧 [MapCamera] Inicializando...");
    this.#fitMapInViewport();
    this.#setupEventListeners();
    Logger.log("✅ [MapCamera] Inicializado correctamente");
  }

  #applyTransform() {
    if (this.#transformRuleIndex !== null) {
      this.#sheet.deleteRule(this.#transformRuleIndex);
    }

    const rule = `.map{ transform: translate(${this.#state.x}px, ${this.#state.y}px) scale(${this.#state.scale}); }`;
    this.#transformRuleIndex = this.#sheet.insertRule(
      rule,
      this.#sheet.cssRules.length,
    );
  }

  #clamped(next, scaled, viewport, [boundsStart, boundsEnd]) {
    let axis = next;
    if (scaled <= viewport) {
      axis = (viewport - scaled) / 2;
    } else {
      const minX = viewport - scaled - boundsEnd;
      const maxX = boundsStart;
      axis = Math.min(maxX, Math.max(minX, next));
    }
    return axis;
  }

  #clampTranslation(nextX, nextY, scale = this.#state.scale) {
    const mapWidth = this.#map.offsetWidth;
    const mapHeight = this.#map.offsetHeight;
    const scaledWidth = mapWidth * scale;
    const scaledHeight = mapHeight * scale;

    if (!mapWidth || !mapHeight) {
      return { x: nextX, y: nextY };
    }

    return {
      x: this.#clamped(nextX, scaledWidth, this.#viewport.clientWidth, [
        this.#bounds.left,
        this.#bounds.right,
      ]),
      y: this.#clamped(nextY, scaledHeight, this.#viewport.clientHeight, [
        this.#bounds.top,
        this.#bounds.bottom,
      ]),
    };
  }

  #fitMapInViewport() {
    const mapWidth = this.#map.offsetWidth;
    const mapHeight = this.#map.offsetHeight;

    if (!mapWidth || !mapHeight) return;

    const viewportWidth = this.#viewport.clientWidth;
    const viewportHeight = this.#viewport.clientHeight;

    // Escala vertical directa por dimensiones reales renderizadas
    const scaleY = viewportHeight / mapHeight;

    // Escala horizontal compensando el redondeo de celda en Map.js
    // celda ideal = viewportWidth / size
    // celda usada  = mapWidth / size (redondeada a multiplo de 20)
    const sizeVar = Number.parseFloat(
      getComputedStyle(this.#map).getPropertyValue("--size"),
    );


    const scaleX = viewportWidth / mapWidth;
    const roundedCell = sizeVar > 0 ? mapWidth / sizeVar : 0;
    const idealCell = sizeVar > 0 ? viewportWidth / sizeVar : 0;
    const roundingScale = roundedCell > 0 ? idealCell / roundedCell : scaleX;

    // Tomar la mas restrictiva y aplicar epsilon para evitar overflow por subpixel
    const fitScale = Math.min(scaleY, roundingScale);
    const nextScale = this.#clampScale(fitScale * 0.999);

    this.#state.scale = nextScale;
    const centeredPosition = this.#clampTranslation(
      (viewportWidth - mapWidth * this.#state.scale) / 2,
      (viewportHeight - mapHeight * this.#state.scale) / 2,
      this.#state.scale,
    );

    this.#state.x = centeredPosition.x;
    this.#state.y = centeredPosition.y;
    this.#applyTransform();
  }

  #clampScale(value) {
    return Math.min(
      this.#state.maxScale,
      Math.max(this.#state.minScale, value),
    );
  }

  #zoomAtPoint(clientX, clientY, nextScale) {
    const rect = this.#viewport.getBoundingClientRect();
    const localX = clientX - rect.left;
    const localY = clientY - rect.top;
    const worldX = (localX - this.#state.x) / this.#state.scale;
    const worldY = (localY - this.#state.y) / this.#state.scale;

    this.#state.scale = this.#clampScale(nextScale);
    const clampedPosition = this.#clampTranslation(
      localX - worldX * this.#state.scale,
      localY - worldY * this.#state.scale,
      this.#state.scale,
    );

    this.#state.x = clampedPosition.x;
    this.#state.y = clampedPosition.y;
    this.#applyTransform();
  }

  #getTouchDistance(touchA, touchB) {
    const dx = touchA.clientX - touchB.clientX;
    const dy = touchA.clientY - touchB.clientY;
    return Math.hypot(dx, dy);
  }

  #getTouchCenter(touchA, touchB) {
    return {
      x: (touchA.clientX + touchB.clientX) / 2,
      y: (touchA.clientY + touchB.clientY) / 2,
    };
  }

  #setupEventListeners() {
    // Resize
    window.addEventListener("resize", () => {
      const clampedPosition = this.#clampTranslation(
        this.#state.x,
        this.#state.y,
      );
      this.#state.x = clampedPosition.x;
      this.#state.y = clampedPosition.y;
      this.#applyTransform();
    });

    // Wheel zoom
    this.#viewport.addEventListener(
      "wheel",
      (event) => {
        event.preventDefault();
        const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9;
        this.#zoomAtPoint(
          event.clientX,
          event.clientY,
          this.#state.scale * zoomFactor,
        );
      },
      { passive: false },
    );

    // Mouse drag
    this.#viewport.addEventListener("mousedown", (event) => {
      if (event.button !== 0) return;
      event.preventDefault();

      this.#state.dragging = true;
      this.#state.moved = false;
      this.#deselectedByDrag = false;
      this.#state.startX = event.clientX - this.#state.x;
      this.#state.startY = event.clientY - this.#state.y;
      this.#viewport.classList.add("dragging");
    });

    window.addEventListener("mousemove", (event) => {
      if (!this.#state.dragging) return;

      const nextX = event.clientX - this.#state.startX;
      const nextY = event.clientY - this.#state.startY;
      const distance = Math.hypot(nextX - this.#state.x, nextY - this.#state.y);

      if (distance > 2) {
        this.#state.moved = true;

        if (!this.#deselectedByDrag && this.#onDragCallback) {
          this.#onDragCallback();
          this.#deselectedByDrag = true;
        }
      }

      const clampedPosition = this.#clampTranslation(nextX, nextY);
      this.#state.x = clampedPosition.x;
      this.#state.y = clampedPosition.y;
      this.#applyTransform();
    });

    window.addEventListener("mouseup", () => {
      if (!this.#state.dragging) return;

      this.#state.dragging = false;
      this.#viewport.classList.remove("dragging");

      setTimeout(() => {
        this.#state.moved = false;
      }, 0);
    });

    this.#viewport.addEventListener("mouseleave", () => {
      if (!this.#state.dragging) return;

      this.#state.dragging = false;
      this.#viewport.classList.remove("dragging");
    });

    // Touch drag
    this.#viewport.addEventListener(
      "touchstart",
      (event) => {
        if (event.touches.length === 1) {
          const touch = event.touches[0];
          this.#state.dragging = true;
          this.#state.moved = false;
          this.#deselectedByDrag = false;
          this.#state.startX = touch.clientX - this.#state.x;
          this.#state.startY = touch.clientY - this.#state.y;
        }

        if (event.touches.length === 2) {
          const [touchA, touchB] = event.touches;
          this.#state.dragging = false;
          this.#state.pinchDistance = this.#getTouchDistance(touchA, touchB);
          this.#state.pinchCenter = this.#getTouchCenter(touchA, touchB);
        }
      },
      { passive: true },
    );

    this.#viewport.addEventListener(
      "touchmove",
      (event) => {
        if (event.touches.length === 1 && this.#state.dragging) {
          event.preventDefault();
          const touch = event.touches[0];
          const nextX = touch.clientX - this.#state.startX;
          const nextY = touch.clientY - this.#state.startY;
          const distance = Math.hypot(
            nextX - this.#state.x,
            nextY - this.#state.y,
          );

          if (distance > 2) {
            this.#state.moved = true;

            if (!this.#deselectedByDrag && this.#onDragCallback) {
              this.#onDragCallback();
              this.#deselectedByDrag = true;
            }
          }

          const clampedPosition = this.#clampTranslation(nextX, nextY);
          this.#state.x = clampedPosition.x;
          this.#state.y = clampedPosition.y;
          this.#applyTransform();
        }

        if (event.touches.length === 2) {
          event.preventDefault();
          const [touchA, touchB] = event.touches;
          const nextDistance = this.#getTouchDistance(touchA, touchB);
          const center = this.#getTouchCenter(touchA, touchB);

          if (this.#state.pinchDistance && this.#state.pinchCenter) {
            const pinchRatio = nextDistance / this.#state.pinchDistance;
            this.#zoomAtPoint(
              center.x,
              center.y,
              this.#state.scale * pinchRatio,
            );
          }

          this.#state.pinchDistance = nextDistance;
          this.#state.pinchCenter = center;
        }
      },
      { passive: false },
    );

    this.#viewport.addEventListener("touchend", (event) => {
      if (event.touches.length === 0) {
        this.#state.dragging = false;
        this.#state.pinchDistance = null;
        this.#state.pinchCenter = null;

        setTimeout(() => {
          this.#state.moved = false;
        }, 0);
      }
    });
  }
}

window.MapCamera = MapCamera;
