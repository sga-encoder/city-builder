/**
 * @typedef {Object} MapCameraEventBinderParams
 * @property {HTMLElement} viewport
 * @property {() => {zoomScale:number,panning:boolean,panOriginX:number,panOriginY:number}} getState
 * @property {(clientX:number,clientY:number) => void} beginPan
 * @property {(resetHasPanned?:boolean) => void} endPan
 * @property {(nextX:number,nextY:number) => void} applyPanMovement
 * @property {(touches:TouchList) => void} applyPinchGesture
 * @property {(clientX:number,clientY:number,nextScale:number) => void} zoomAtClientPoint
 * @property {() => void} refreshTransform
 * @property {() => void} onTouchEnd
 */

/**
 * Encapsula el binding de eventos de mouse/touch/resize para la camara.
 */
class MapCameraEventBinder {
  /**
   * Registra listeners de interaccion sobre el viewport y ventana.
   * @param {MapCameraEventBinderParams} params
   * @returns {void}
   */
  static bind(params) {
    const {
      viewport,
      getState,
      beginPan,
      endPan,
      applyPanMovement,
      applyPinchGesture,
      zoomAtClientPoint,
      refreshTransform,
      onTouchEnd,
    } = params;

    window.addEventListener("resize", () => {
      refreshTransform();
    });

    viewport.addEventListener(
      "wheel",
      (event) => {
        event.preventDefault();
        const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9;
        zoomAtClientPoint(
          event.clientX,
          event.clientY,
          getState().zoomScale * zoomFactor,
        );
      },
      { passive: false },
    );

    viewport.addEventListener("mousedown", (event) => {
      if (event.button !== 0) return;
      event.preventDefault();

      beginPan(event.clientX, event.clientY);
      viewport.classList.add("dragging");
    });

    window.addEventListener("mousemove", (event) => {
      const state = getState();
      if (!state.panning) return;

      const nextX = event.clientX - state.panOriginX;
      const nextY = event.clientY - state.panOriginY;
      applyPanMovement(nextX, nextY);
    });

    window.addEventListener("mouseup", () => {
      if (!getState().panning) return;

      endPan();
      viewport.classList.remove("dragging");
    });

    viewport.addEventListener("mouseleave", () => {
      if (!getState().panning) return;

      endPan(false);
      viewport.classList.remove("dragging");
    });

    viewport.addEventListener(
      "touchstart",
      (event) => {
        if (event.touches.length === 1) {
          const touch = event.touches[0];
          beginPan(touch.clientX, touch.clientY);
        }

        if (event.touches.length === 2) {
          endPan(false);
          applyPinchGesture(event.touches);
        }
      },
      { passive: true },
    );

    viewport.addEventListener(
      "touchmove",
      (event) => {
        const state = getState();

        if (event.touches.length === 1 && state.panning) {
          event.preventDefault();
          const touch = event.touches[0];
          const nextX = touch.clientX - state.panOriginX;
          const nextY = touch.clientY - state.panOriginY;
          applyPanMovement(nextX, nextY);
        }

        if (event.touches.length === 2) {
          event.preventDefault();
          applyPinchGesture(event.touches);
        }
      },
      { passive: false },
    );

    viewport.addEventListener("touchend", (event) => {
      if (event.touches.length === 0) {
        onTouchEnd();
      }
    });
  }
}
