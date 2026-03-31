import { Logger } from "../../../utilis/Logger.js";
import { MapCamera } from "../../../services/mapCamera/MapCamera.js";
import { CameraInstanceManager } from "../../../services/mapCamera/CameraInstance.js";

export class MapCameraController {
  /**
   * Instancia activa de la cámara del mapa.
   * @type {MapCamera|null}
   */
  static mapCamera = null;

  /** @type {number|null} */
  static resizeDebounceTimer = null;4

  /** @type {number} */
  static cameraRetryCount = 0;

  /** @type {number|null} */
  static cameraRetryTimer = null;

  /**
   * Inicializa la cámara del mapa y configura comportamiento responsivo.
   * @param {() => void} onPanStart - Callback ejecutado cuando inicia un paneo.
   * @returns {void}
   */
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
        99999: .6,
      };

      Logger.log("📱 [MapController] Escalas:", {
        fitMinScale,
        maxScale,
        responsiveInitialScale,
      });

      this.mapCamera = new MapCamera("#map", document.styleSheets[0], {
        minScale: fitMinScale,
        maxScale,
        scale: 1,
      });
      CameraInstanceManager.setInstance(this.mapCamera);

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

  /**
   * Indica si la cámara ha realizado paneo recientemente.
   * @returns {boolean}
   */
  static get hasPanned() {
    return this.mapCamera?.hasPanned ?? false;
  }

  /**
   * Reintenta la inicialización de cámara durante el arranque asíncrono.
   * @param {() => void} onSetup - Callback que intenta preparar interacciones/cámara.
   * @returns {void}
   */
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

  /**
   * Llama a reattach en la instancia de MapCamera con el nuevo stylesheet tras hot reload de CSS.
   * @param {CSSStyleSheet} [styleSheet=document.styleSheets[0]]
   */
  static onStyleSheetReplaced(styleSheet = document.styleSheets[0]) {
    if (this.mapCamera) {
      this.mapCamera.reattach(styleSheet);
      Logger.log("♻️ [MapController] reattach() ejecutado tras reemplazo de CSS");
    }
  }
}
