class MapCameraEventBinder {
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
