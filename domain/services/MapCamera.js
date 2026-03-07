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
    this.#viewport = document.querySelector(viewportSelector);
    this.#map = this.#viewport?.querySelector(".map");
    this.#sheet = styleSheet;

    if (!this.#viewport || !this.#map) {
      throw new Error(
        `MapCamera: no se encontró viewport o mapa para "${viewportSelector}"`,
      );
    }

    if (this.#viewport.dataset.cameraReady === "true") {
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
    this.#fitMapInViewport();
    this.#setupEventListeners();
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

  #clampTranslation(nextX, nextY, scale = this.#state.scale) {
    const mapWidth = this.#map.offsetWidth;
    const mapHeight = this.#map.offsetHeight;
    const scaledWidth = mapWidth * scale;
    const scaledHeight = mapHeight * scale;

    if (!mapWidth || !mapHeight) {
      return { x: nextX, y: nextY };
    }

    let clampedX = nextX;
    let clampedY = nextY;

    if (scaledWidth <= this.#viewport.clientWidth) {
      clampedX = (this.#viewport.clientWidth - scaledWidth) / 2;
    } else {
      const minX =
        this.#viewport.clientWidth - scaledWidth - this.#bounds.right;
      const maxX = this.#bounds.left;
      clampedX = Math.min(maxX, Math.max(minX, nextX));
    }

    if (scaledHeight <= this.#viewport.clientHeight) {
      clampedY = (this.#viewport.clientHeight - scaledHeight) / 2;
    } else {
      const minY =
        this.#viewport.clientHeight - scaledHeight - this.#bounds.bottom;
      const maxY = this.#bounds.top;
      clampedY = Math.min(maxY, Math.max(minY, nextY));
    }

    return { x: clampedX, y: clampedY };
  }

  #fitMapInViewport() {
    const mapWidth = this.#map.offsetWidth;
    const mapHeight = this.#map.offsetHeight;

    if (!mapWidth || !mapHeight) return;

    const scaleX = this.#viewport.clientWidth / mapWidth;
    const scaleY = this.#viewport.clientHeight / mapHeight;
    const nextScale = this.#clampScale(Math.min(scaleX, scaleY, 1));

    this.#state.scale = nextScale;
    const centeredPosition = this.#clampTranslation(
      (this.#viewport.clientWidth - mapWidth * this.#state.scale) / 2,
      (this.#viewport.clientHeight - mapHeight * this.#state.scale) / 2,
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
