let selectedCell = null;
let currentMode = "view";
let mapCamera = null;

const getInitialScaleByScreen = (width) => {
  const maxScale = 5;
  const minScale = 0.5;
  const scale = 1;
  const movileScaleFactor = 8; 
  const tabletScaleFactor = 4; 
  if (width <= 756)
    return {
      maxScale: maxScale * movileScaleFactor,
      scale: scale * movileScaleFactor,
      minScale: minScale * movileScaleFactor,
    }; 
  if (width <= 1024)
    return {
      maxScale: maxScale * tabletScaleFactor,
      scale: scale * tabletScaleFactor,
      minScale: minScale * tabletScaleFactor,
    }; 
  return { maxScale, scale, minScale }; 
};

const setupMapCamera = () => {
  const viewport = document.querySelector("#map");
  const map = viewport?.querySelector(".map");

  if (!viewport || !map) return;
  if (viewport.dataset.cameraReady === "true") return;

  try {
    const { maxScale, scale, minScale } = getInitialScaleByScreen(
      window.innerWidth,
    );
    mapCamera = new MapCamera("#map", document.styleSheets[1], {
      minScale,
      maxScale,
      scale,
    });

    mapCamera.onDragStart(() => {
      deselectCell();
    });

    const applyResponsiveZoom = () => {
      const targetScale = getInitialScaleByScreen(window.innerWidth).scale;
      const worldCenterX = map.offsetWidth / 2;
      const worldCenterY = map.offsetHeight / 2;
      mapCamera.centerOn(worldCenterX, worldCenterY, targetScale);
    };

    // Aplicar zoom inicial
    requestAnimationFrame(() => {
      applyResponsiveZoom();
    });

    // Reajustar al cambiar tamaño de pantalla
    let resizeTimeout;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        // Actualizar límites de escala según nuevo tamaño
        const { maxScale, minScale } = getInitialScaleByScreen(
          window.innerWidth,
        );
        mapCamera.setScaleLimints( minScale, maxScale);
        applyResponsiveZoom();
      }, 150); // debounce para evitar demasiadas ejecuciones
    });

    window.mapCamera = mapCamera;
  } catch (error) {
    console.error("Error inicializando MapCamera:", error);
  }
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
        if (mapCamera?.didDrag) return;
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

  document.addEventListener("click", (e) => {
    const inSlideLeft = !!e.target.closest("#slide-left");
    const inMap = !!e.target.closest("#map");
    const inMapItem = !!e.target.closest(".map-item");

    if (inMapItem) return;

    if (inMap) {
      if (!mapCamera?.didDrag) deselectCell();
      return;
    }

    if (!inSlideLeft) {
      deselectCell();
    }
  });
}
