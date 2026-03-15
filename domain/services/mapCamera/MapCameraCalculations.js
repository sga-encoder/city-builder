class MapCameraCalculations {
  static createConfig(options = {}) {
    const defaults = {
      scale: 1,
      minScale: 0.7,
      maxScale: 4,
      x: 0,
      y: 0,
      bounds: { top: 0, right: 0, bottom: 0, left: 0 },
    };

    const config = { ...defaults, ...options };

    return {
      state: {
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
      },
      bounds: { ...defaults.bounds, ...config.bounds },
    };
  }

  static clampZoom(value, minZoomScale, maxZoomScale) {
    return Math.min(maxZoomScale, Math.max(minZoomScale, value));
  }

  static clampAxis(next, scaledSize, viewportSize, [boundsStart, boundsEnd]) {
    if (scaledSize <= viewportSize) {
      return (viewportSize - scaledSize) / 2;
    }

    const min = viewportSize - scaledSize - boundsEnd;
    const max = boundsStart;
    return Math.min(max, Math.max(min, next));
  }

  static clampPanPosition(params) {
    const {
      nextX,
      nextY,
      scale,
      mapWidth,
      mapHeight,
      viewportWidth,
      viewportHeight,
      bounds,
    } = params;

    if (!mapWidth || !mapHeight) {
      return { x: nextX, y: nextY };
    }

    const scaledWidth = mapWidth * scale;
    const scaledHeight = mapHeight * scale;

    return {
      x: this.clampAxis(nextX, scaledWidth, viewportWidth, [
        bounds.left,
        bounds.right,
      ]),
      y: this.clampAxis(nextY, scaledHeight, viewportHeight, [
        bounds.top,
        bounds.bottom,
      ]),
    };
  }

  static fitContentToViewport(params) {
    const {
      mapWidth,
      mapHeight,
      viewportWidth,
      viewportHeight,
      sizeVar,
      minZoomScale,
      maxZoomScale,
      bounds,
    } = params;

    if (!mapWidth || !mapHeight) return null;

    const scaleY = viewportHeight / mapHeight;
    const scaleX = viewportWidth / mapWidth;
    const roundedCellSize = sizeVar > 0 ? mapWidth / sizeVar : 0;
    const idealCellSize = sizeVar > 0 ? viewportWidth / sizeVar : 0;
    const correctedScaleX =
      roundedCellSize > 0 ? idealCellSize / roundedCellSize : scaleX;

    const fitScale = Math.min(scaleY, correctedScaleX);
    const zoomScale = this.clampZoom(
      fitScale * 0.999,
      minZoomScale,
      maxZoomScale,
    );

    return {
      zoomScale,
      panPosition: this.clampPanPosition({
        nextX: (viewportWidth - mapWidth * zoomScale) / 2,
        nextY: (viewportHeight - mapHeight * zoomScale) / 2,
        scale: zoomScale,
        mapWidth,
        mapHeight,
        viewportWidth,
        viewportHeight,
        bounds,
      }),
    };
  }

  static resolveResponsiveScale(screenWidth, scaleByWidth) {
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

  static getPinchDistance(touchA, touchB) {
    const dx = touchA.clientX - touchB.clientX;
    const dy = touchA.clientY - touchB.clientY;
    return Math.hypot(dx, dy);
  }

  static getPinchCenter(touchA, touchB) {
    return {
      x: (touchA.clientX + touchB.clientX) / 2,
      y: (touchA.clientY + touchB.clientY) / 2,
    };
  }
}
