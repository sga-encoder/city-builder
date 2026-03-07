let selectedCell = null;
let currentMode = "view"; // "view", "build", "move", "destroy"
let cameraDidDrag = false;
let transformRuleIndex = null;

const setupMapCamera = () => {
  const sheet = document.styleSheets[1];
  const viewport = document.querySelector("#map");
  const map = viewport?.querySelector(".map");

  if (!viewport || !map || viewport.dataset.cameraReady === "true") return;

  viewport.dataset.cameraReady = "true";

  const camera = {
    scale: 1,
    minScale: 0.7,
    maxScale: 4,
    x: 0,
    y: 0,
    dragging: false,
    moved: false,
    startX: 0,
    startY: 0,
    pinchDistance: null,
    pinchCenter: null,
  };
  const cameraBoundsPadding = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  };

  const applyTransform = () => {
    // Eliminar la regla anterior si existe
    if (transformRuleIndex !== null) {
      sheet.deleteRule(transformRuleIndex);
    }

    const rule = `.map{ transform: translate(${camera.x}px, ${camera.y}px) scale(${camera.scale}); }`;
    transformRuleIndex = sheet.insertRule(rule, sheet.cssRules.length);
  };

  const clampTranslation = (nextX, nextY, scale = camera.scale) => {
    const mapWidth = map.offsetWidth;
    const mapHeight = map.offsetHeight;
    const scaledWidth = mapWidth * scale;
    const scaledHeight = mapHeight * scale;

    if (!mapWidth || !mapHeight) {
      return { x: nextX, y: nextY };
    }

    let clampedX = nextX;
    let clampedY = nextY;

    if (scaledWidth <= viewport.clientWidth) {
      clampedX = (viewport.clientWidth - scaledWidth) / 2;
    } else {
      const minX =
        viewport.clientWidth - scaledWidth - cameraBoundsPadding.right;
      const maxX = cameraBoundsPadding.left;
      clampedX = Math.min(maxX, Math.max(minX, nextX));
    }

    if (scaledHeight <= viewport.clientHeight) {
      clampedY = (viewport.clientHeight - scaledHeight) / 2;
    } else {
      const minY =
        viewport.clientHeight - scaledHeight - cameraBoundsPadding.bottom;
      const maxY = cameraBoundsPadding.top;
      clampedY = Math.min(maxY, Math.max(minY, nextY));
    }

    return { x: clampedX, y: clampedY };
  };

  const fitMapInViewport = () => {
    const mapWidth = map.offsetWidth;
    const mapHeight = map.offsetHeight;

    if (!mapWidth || !mapHeight) return;

    const scaleX = viewport.clientWidth / mapWidth;
    const scaleY = viewport.clientHeight / mapHeight;
    const nextScale = clampScale(Math.min(scaleX, scaleY, 1));

    camera.scale = nextScale;
    const centeredPosition = clampTranslation(
      (viewport.clientWidth - mapWidth * camera.scale) / 2,
      (viewport.clientHeight - mapHeight * camera.scale) / 2,
      camera.scale,
    );

    camera.x = centeredPosition.x;
    camera.y = centeredPosition.y;
    applyTransform();
  };

  const clampScale = (value) =>
    Math.min(camera.maxScale, Math.max(camera.minScale, value));

  const zoomAtPoint = (clientX, clientY, nextScale) => {
    const rect = viewport.getBoundingClientRect();
    const localX = clientX - rect.left;
    const localY = clientY - rect.top;
    const worldX = (localX - camera.x) / camera.scale;
    const worldY = (localY - camera.y) / camera.scale;

    camera.scale = clampScale(nextScale);
    const clampedPosition = clampTranslation(
      localX - worldX * camera.scale,
      localY - worldY * camera.scale,
      camera.scale,
    );

    camera.x = clampedPosition.x;
    camera.y = clampedPosition.y;
    applyTransform();
  };

  const getTouchDistance = (touchA, touchB) => {
    const dx = touchA.clientX - touchB.clientX;
    const dy = touchA.clientY - touchB.clientY;
    return Math.hypot(dx, dy);
  };

  const getTouchCenter = (touchA, touchB) => ({
    x: (touchA.clientX + touchB.clientX) / 2,
    y: (touchA.clientY + touchB.clientY) / 2,
  });

  fitMapInViewport();

  window.addEventListener("resize", () => {
    const clampedPosition = clampTranslation(camera.x, camera.y);
    camera.x = clampedPosition.x;
    camera.y = clampedPosition.y;
    applyTransform();
  });

  viewport.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9;
      zoomAtPoint(event.clientX, event.clientY, camera.scale * zoomFactor);
    },
    { passive: false },
  );

  viewport.addEventListener("mousedown", (event) => {
    if (event.button !== 0) return;
    event.preventDefault();

    camera.dragging = true;
    camera.moved = false;
    cameraDidDrag = false;
    camera.startX = event.clientX - camera.x;
    camera.startY = event.clientY - camera.y;
    viewport.classList.add("dragging");
  });

  window.addEventListener("mousemove", (event) => {
    if (!camera.dragging) return;

    const nextX = event.clientX - camera.startX;
    const nextY = event.clientY - camera.startY;
    const distance = Math.hypot(nextX - camera.x, nextY - camera.y);

    if (distance > 2) {
      camera.moved = true;
      cameraDidDrag = true;
    }

    const clampedPosition = clampTranslation(nextX, nextY);
    camera.x = clampedPosition.x;
    camera.y = clampedPosition.y;
    applyTransform();
  });

  window.addEventListener("mouseup", () => {
    if (!camera.dragging) return;

    camera.dragging = false;
    viewport.classList.remove("dragging");

    setTimeout(() => {
      cameraDidDrag = false;
      camera.moved = false;
    }, 0);
  });

  viewport.addEventListener("mouseleave", () => {
    if (!camera.dragging) return;

    camera.dragging = false;
    viewport.classList.remove("dragging");
  });

  viewport.addEventListener(
    "touchstart",
    (event) => {
      if (event.touches.length === 1) {
        const touch = event.touches[0];
        camera.dragging = true;
        camera.moved = false;
        cameraDidDrag = false;
        camera.startX = touch.clientX - camera.x;
        camera.startY = touch.clientY - camera.y;
      }

      if (event.touches.length === 2) {
        const [touchA, touchB] = event.touches;
        camera.dragging = false;
        camera.pinchDistance = getTouchDistance(touchA, touchB);
        camera.pinchCenter = getTouchCenter(touchA, touchB);
      }
    },
    { passive: true },
  );

  viewport.addEventListener(
    "touchmove",
    (event) => {
      if (event.touches.length === 1 && camera.dragging) {
        event.preventDefault();
        const touch = event.touches[0];
        const nextX = touch.clientX - camera.startX;
        const nextY = touch.clientY - camera.startY;
        const distance = Math.hypot(nextX - camera.x, nextY - camera.y);

        if (distance > 2) {
          camera.moved = true;
          cameraDidDrag = true;
        }

        const clampedPosition = clampTranslation(nextX, nextY);
        camera.x = clampedPosition.x;
        camera.y = clampedPosition.y;
        applyTransform();
      }

      if (event.touches.length === 2) {
        event.preventDefault();
        const [touchA, touchB] = event.touches;
        const nextDistance = getTouchDistance(touchA, touchB);
        const center = getTouchCenter(touchA, touchB);

        if (camera.pinchDistance && camera.pinchCenter) {
          const pinchRatio = nextDistance / camera.pinchDistance;
          zoomAtPoint(center.x, center.y, camera.scale * pinchRatio);
        }

        camera.pinchDistance = nextDistance;
        camera.pinchCenter = center;
      }
    },
    { passive: false },
  );

  viewport.addEventListener("touchend", (event) => {
    if (event.touches.length === 0) {
      camera.dragging = false;
      camera.pinchDistance = null;
      camera.pinchCenter = null;

      setTimeout(() => {
        cameraDidDrag = false;
        camera.moved = false;
      }, 0);
    }
  });
};

const addEvents = () => {
  const mapData = LocalStorage.loadData("map");
  const map = JSON.parse(mapData);

  for (let i = 0; i < map.length; i++) {
    for (let j = 0; j < map[i].length; j++) {
      let id = map[i][j].id;
      const item = document.querySelector(`#map-item-${id}`);

      if (!item) continue;
      if (item.dataset.eventsBound === "true") continue;

      item.dataset.eventsBound = "true";

      item.addEventListener("click", (e) => {
        if (cameraDidDrag) return;
        e.stopPropagation();

        // Si el terreno es vacío (ground), mostrar menú de construcción
        if (map[i][j].type === "g") {
          selectCell(id, map[i][j], i, j);
          showBuildMenu();
          currentMode = "build";
        } else {
          // Para otros tipos de edificios, mostrar menú de gestión
          selectCell(id, map[i][j], i, j);
          showManageMenu();
          currentMode = "manage";
        }
      });
    }
  }
};

const selectCell = (id, cellData, i, j) => {
  // Remover selección anterior
  if (selectedCell) {
    document
      .querySelector(`#map-item-${selectedCell.id}`)
      ?.classList.remove("selected");
    window.hideAllMenu?.();
  }

  // Seleccionar nueva celda
  selectedCell = { id, cellData, i, j };
  document.querySelector(`#map-item-${id}`).classList.add("selected");
};

const showBuildMenu = () => {
  window.showMenu01?.();
};

const showManageMenu = () => {
  window.showMenu02?.();
};

const deselectCell = () => {
  if (selectedCell) {
    document
      .querySelector(`#map-item-${selectedCell.id}`)
      ?.classList.remove("selected");
    selectedCell = null;
    currentMode = "view";

    // Cerrar menús
    window.hideAllMenu?.();
  }
};

// Observer para detectar cuando se agregan elementos al mapa
const mapContainer = document.querySelector("#map");
if (mapContainer) {
  const initializeMapInteractions = () => {
    const hasMap = !!mapContainer.querySelector(".map");
    const hasData = !!LocalStorage.loadData("map");

    if (!hasMap || !hasData) return;

    addEvents();
    setupMapCamera();
  };

  initializeMapInteractions();

  // Fallback: reintenta durante el arranque asíncrono del mapa.
  let cameraInitAttempts = 0;
  const cameraInitInterval = setInterval(() => {
    initializeMapInteractions();
    cameraInitAttempts += 1;

    if (
      mapContainer.dataset.cameraReady === "true" ||
      cameraInitAttempts >= 40
    ) {
      clearInterval(cameraInitInterval);
    }
  }, 100);

  const observer = new MutationObserver(() => {
    initializeMapInteractions();
  });

  observer.observe(mapContainer, {
    childList: true,
    subtree: true,
  });

  // Click fuera del mapa para deseleccionar
  document.addEventListener("click", (e) => {
    if (
      !mapContainer.contains(e.target) &&
      !document.querySelector("#slide-left")?.contains(e.target)
    ) {
      deselectCell();
    }
  });
}
