// =====================
// CITY SELECTION RENDERER
// =====================

export class CitySelectionRenderer {
  constructor(containerId = "city-selection-overlay") {
    this.containerId = containerId;
    this.onCitySelected = null;
    this.onNewGame = null;
  }

  // =====================
  // RENDERIZAR PANTALLA DE SELECCIÓN
  // =====================
  render(savedCities, onCitySelectedCallback, onNewGameCallback) {
    this.onCitySelected = onCitySelectedCallback;
    this.onNewGame = onNewGameCallback;

    // Crear overlay
    const overlay = document.createElement("div");
    overlay.id = this.containerId;
    overlay.className = "city-selection-overlay";

    // Crear contenedor principal
    const container = document.createElement("div");
    container.className = "city-selection-container";

    // Título
    const title = document.createElement("h1");
    title.className = "city-selection-title";
    title.textContent = "Seleccionar Ciudad";

    // Subtítulo
    const subtitle = document.createElement("p");
    subtitle.className = "city-selection-subtitle";
    subtitle.textContent = "Elige una ciudad para continuar o crea una nueva";

    container.appendChild(title);
    container.appendChild(subtitle);

    // Contenedor de ciudades
    const citiesContainer = document.createElement("div");
    citiesContainer.className = "cities-grid";

    // Mostrar ciudades guardadas
    if (savedCities && savedCities.length > 0) {
      savedCities.forEach((city) => {
        const cityCard = this.createCityCard(city);
        citiesContainer.appendChild(cityCard);
      });
    } else {
      const noCitiesMsg = document.createElement("p");
      noCitiesMsg.className = "no-cities-message";
      noCitiesMsg.textContent = "No hay ciudades guardadas";
      citiesContainer.appendChild(noCitiesMsg);
    }

    container.appendChild(citiesContainer);

    // Botón para crear nueva ciudad
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "city-selection-buttons";

    const newCityButton = document.createElement("button");
    newCityButton.type = "button";
    newCityButton.className = "city-selection-new-btn";
    newCityButton.textContent = "+ Crear Nueva Ciudad";
    newCityButton.addEventListener("click", () => {
      this.destroy();
      if (this.onNewGame) {
        this.onNewGame();
      }
    });

    buttonContainer.appendChild(newCityButton);
    container.appendChild(buttonContainer);

    // Agregar elementos al overlay
    overlay.appendChild(container);
    document.body.appendChild(overlay);

    return overlay;
  }

  // =====================
  // CREAR TARJETA DE CIUDAD
  // =====================
  createCityCard(city) {
    const card = document.createElement("div");
    card.className = "city-card";

    // Información de la ciudad
    const headerContainer = document.createElement("div");
    headerContainer.className = "city-card-header";

    const cityName = document.createElement("h3");
    cityName.className = "city-card-name";
    cityName.textContent = city.name;

    const mayorName = document.createElement("p");
    mayorName.className = "city-card-mayor";
    mayorName.textContent = `Alcalde: ${city.mayor?.name || "Desconocido"}`;

    headerContainer.appendChild(cityName);
    headerContainer.appendChild(mayorName);

    // Detalles de la ciudad
    const detailsContainer = document.createElement("div");
    detailsContainer.className = "city-card-details";

    const location = document.createElement("p");
    location.innerHTML = `📍 <strong>${city.location?.name || "Ubicación desconocida"}</strong>`;

    const mapSize = document.createElement("p");
    mapSize.innerHTML = `🗺️ <strong>${city.mapSize}x${city.mapSize}</strong>`;

    const turn = document.createElement("p");
    turn.innerHTML = `⏱️ <strong>Turno ${city.turn || 0}</strong>`;

    detailsContainer.appendChild(location);
    detailsContainer.appendChild(mapSize);
    detailsContainer.appendChild(turn);

    // Fecha de creación
    const dateContainer = document.createElement("div");
    dateContainer.className = "city-card-date";

    const createdDate = new Date(city.createdAt);
    const dateString = createdDate.toLocaleDateString("es-CO");
    
    const dateText = document.createElement("p");
    dateText.textContent = `Creada: ${dateString}`;

    dateContainer.appendChild(dateText);

    // Botones de acción
    const actionsContainer = document.createElement("div");
    actionsContainer.className = "city-card-actions";

    const loadButton = document.createElement("button");
    loadButton.type = "button";
    loadButton.className = "city-card-load-btn";
    loadButton.textContent = "Cargar";
    loadButton.addEventListener("click", () => {
      this.destroy();
      if (this.onCitySelected) {
        this.onCitySelected(city);
      }
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "city-card-delete-btn";
    deleteButton.textContent = "Eliminar";
    deleteButton.addEventListener("click", (e) => {
      e.stopPropagation();
      if (confirm(`¿Está seguro que desea eliminar "${city.name}"?`)) {
        this.onCitySelected({ action: "delete", cityId: city.id });
      }
    });

    actionsContainer.appendChild(loadButton);
    actionsContainer.appendChild(deleteButton);

    // Agregar todos los elementos a la tarjeta
    card.appendChild(headerContainer);
    card.appendChild(detailsContainer);
    card.appendChild(dateContainer);
    card.appendChild(actionsContainer);

    return card;
  }

  // =====================
  // DESTRUIR PANTALLA
  // =====================
  destroy() {
    const overlay = document.getElementById(this.containerId);
    if (overlay) {
      overlay.remove();
    }
  }
}
