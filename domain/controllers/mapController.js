let selectedCell = null;
let currentMode = "view"; // "view", "build", "move", "destroy"


const setupMapCamara = () => {
  print("hola")
}

const addEvents = () => {
  const mapData = LocalStorage.loadData("map");
  const map = JSON.parse(mapData);

  for (let i = 0; i < map.length; i++) {
    for (let j = 0; j < map[i].length; j++) {
      let id = map[i][j].id;
      const item = document.querySelector(`.map-item-${id}`);

      if (!item) continue;

      item.addEventListener("click", (e) => {
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
      .querySelector(`.map-item-${selectedCell.id}`)
      ?.classList.remove("selected");
    window.hideAllMenu?.();
      
  }

  // Seleccionar nueva celda
  selectedCell = { id, cellData, i, j };
  document.querySelector(`.map-item-${id}`).classList.add("selected");
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
      .querySelector(`.map-item-${selectedCell.id}`)
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
  const observer = new MutationObserver(() => {
    addEvents();
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
