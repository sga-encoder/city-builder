class MapCameraController {
  static mapCamera = null;
  static resizeDebounceTimer = null;
  static cameraRetryCount = 0;
  static cameraRetryTimer = null;

  static initializeCamera(onPanStart) {
    Logger.log("🎥 [MapController] setupMapCamera iniciando...");
    const viewport = document.querySelector("#map");
    const map = viewport?.querySelector(".map");

    if (!viewport || !map) {
      Logger.warn("⚠️ [MapController] No hay viewport o map aún");
      return;
    }
    if (this.mapCamera !== null) {
      Logger.log("ℹ️ [MapController] Camera ya lista");
      return;
    }

    try {
      const fitMinScale = 0.1;
      const maxScale = 40;
      const responsiveInitialScale = {
        756: 8,
        1024: 4,
        99999: 1,
      };

      Logger.log("📱 [MapController] Escalas:", {
        fitMinScale,
        maxScale,
        responsiveInitialScale,
      });

      this.mapCamera = new MapCamera("#map", document.styleSheets[1], {
        minScale: fitMinScale,
        maxScale,
        scale: 1,
      });
      Logger.log("✅ [MapController] MapCamera creado exitosamente");

      this.mapCamera.onPanStart(onPanStart);

      const applyResponsiveZoom = () => {
        this.mapCamera.applyResponsiveZoom(responsiveInitialScale);
      };

      // Aplicar zoom inicial
      requestAnimationFrame(() => {
        applyResponsiveZoom();
      });

      // Reajustar al cambiar tamaño de pantalla
      window.addEventListener("resize", () => {
        clearTimeout(this.resizeDebounceTimer);
        this.resizeDebounceTimer = setTimeout(() => {
          this.mapCamera.setZoomLimits(fitMinScale, maxScale);
          applyResponsiveZoom();
        }, 150);
      });

      window.mapCamera = this.mapCamera;
      Logger.log("✅ [MapController] Camera configurada completamente");
    } catch (error) {
      Logger.error("❌ [MapController] Error en MapCamera:", error);
      console.error("Error inicializando MapCamera:", error);
    }
  }

  static get hasPanned() {
    return this.camera?.hasPanned ?? false;
  }

  static initializeCameraRetry(onSetup) {
    this.cameraRetryCount = 0;
    this.cameraRetryTimer = setInterval(() => {
      onSetup?.();
      this.cameraRetryCount += 1;

      if (this.mapCamera !== null || this.cameraRetryCount >= 40) {
        clearInterval(this.cameraRetryTimer);
      }
    }, 100);
  }
}
