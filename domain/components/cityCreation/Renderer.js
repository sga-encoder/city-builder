// =====================
// CITY CREATION FORM RENDERER
// =====================

import { ColombiaApi } from "../../../database/colombiaApi.js";

const MAP_SIZES = [
  { value: 15, label: "15x15 (Pequeño - Fácil)" },
  { value: 20, label: "20x20 (Mediano)" },
  { value: 25, label: "25x25 (Grande)" },
  { value: 30, label: "30x30 (Muy Grande - Difícil)" },
];

export class CityCreationRenderer {
  constructor(containerId = "city-creation-overlay") {
    this.containerId = containerId;
    this.form = null;
    this.onSubmit = null;
    this.onBack = null;
    this.capitalCities = [];
    this.mapLayout = null; // Store loaded map layout
  }

  // =====================
  // CREAR FORMULARIO
  // =====================
  render(onSubmitCallback, onBackCallback = null) {
    this.onSubmit = onSubmitCallback;
    this.onBack = onBackCallback;

    // Crear overlay
    const overlay = document.createElement("div");
    overlay.id = this.containerId;
    overlay.className = "city-creation-overlay";

    // Crear contenedor principal
    const container = document.createElement("div");
    container.className = "city-creation-container";

    // Título
    const title = document.createElement("h1");
    title.className = "city-creation-title";
    title.textContent = "Crear Nueva Ciudad";

    // Subtítulo
    const subtitle = document.createElement("p");
    subtitle.className = "city-creation-subtitle";
    subtitle.textContent = "Ingresa los datos de tu ciudad para comenzar a jugar";

    // Formulario
    this.form = document.createElement("form");
    this.form.className = "city-creation-form";

    [
      ["cityName", "Nombre de la Ciudad", "text", "Mi Ciudad", 50],
      ["mayorName", "Nombre del Alcalde/Jugador", "text", "Alcalde", 50],
    ].forEach((field) => {
      this.form.appendChild(this.createFormGroup(...field));
    });

    // Campo: Región geográfica
    this.form.appendChild(this.createRegionGroup());

    // Campo: Tamaño del mapa
    this.form.appendChild(this.createMapSizeGroup());

    // Campo: Cargar mapa desde archivo
    this.form.appendChild(this.createMapLoaderGroup());

    // Campo: Recursos iniciales configurables
    this.form.appendChild(this.createInitialResourcesGroup());

    // Botones
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "city-creation-buttons";

    const submitButton = document.createElement("button");
    submitButton.type = "submit";
    submitButton.className = "city-creation-submit";
    submitButton.textContent = "Crear Ciudad";

    const backButton = document.createElement("button");
    backButton.type = "button";
    backButton.className = "city-creation-back";
    backButton.textContent = "Volver al menu principal";
    backButton.addEventListener("click", () => {
      if (this.onBack) {
        this.onBack();
      }
    });

    buttonContainer.appendChild(backButton);
    buttonContainer.appendChild(submitButton);
    this.form.appendChild(buttonContainer);

    // Event listeners
    this.form.addEventListener("submit", (e) => this.handleSubmit(e));

    // Agregar elementos al overlay
    container.appendChild(title);
    container.appendChild(subtitle);
    container.appendChild(this.form);
    overlay.appendChild(container);

    // Agregar overlay al documento
    document.body.appendChild(overlay);

    return overlay;
  }

  // =====================
  // CREAR GRUPO DE FORMULARIO
  // =====================
  createFormGroup(name, label, type, placeholder, maxlength = null) {
    const group = document.createElement("div");
    group.className = "form-group";

    const labelEl = document.createElement("label");
    labelEl.htmlFor = name;
    labelEl.textContent = label;

    const input = document.createElement("input");
    input.id = name;
    input.name = name;
    input.type = type;
    input.placeholder = placeholder;
    input.required = true;
    input.className = "form-input";

    if (maxlength) {
      input.maxLength = maxlength;
    }

    const charCount = document.createElement("span");
    charCount.className = "char-count";
    charCount.textContent = `0/${maxlength || 0}`;

    if (maxlength) {
      input.addEventListener("input", (e) => {
        charCount.textContent = `${e.target.value.length}/${maxlength}`;
      });
    }

    group.appendChild(labelEl);
    group.appendChild(input);
    if (maxlength) {
      group.appendChild(charCount);
    }

    return group;
  }

  // =====================
  // CREAR GRUPO DE REGIÓN
  // =====================
  createRegionGroup() {
    const group = document.createElement("div");
    group.className = "form-group";

    const label = document.createElement("label");
    label.textContent = "Región Geográfica";

    const radioContainer = document.createElement("div");
    radioContainer.className = "region-container";

    // Opción: Ciudad
    const cityOption = this.createRadioOption(
      "region",
      "city",
      "Seleccionar Ciudad",
      true,
    );
    radioContainer.appendChild(cityOption);

    // Select de ciudades
    const citySelect = document.createElement("select");
    citySelect.id = "citySelect";
    citySelect.name = "citySelect";
    citySelect.className = "form-select";

    citySelect.disabled = true;
    this.setCitySelectOptions(citySelect, []);

    citySelect.addEventListener("change", (e) => {
      const coordsContainer = document.getElementById("coords-container");
      const selected = this.parseCityOptionValue(e.target.value);
      if (!selected) {
        coordsContainer.classList.remove("is-visible");
        return;
      }

      if (selected.lat === null) {
        coordsContainer.classList.add("is-visible");
      } else {
        coordsContainer.classList.remove("is-visible");
      }
    });

    radioContainer.appendChild(citySelect);

    // Contenedor de coordenadas (inicialmente oculto)
    const coordsContainer = document.createElement("div");
    coordsContainer.id = "coords-container";
    coordsContainer.className = "coords-container";

    const latGroup = this.createCoordinateInputGroup(
      "latitude",
      "Latitud",
      "-90",
      "90",
      "ej: 40.7128",
    );
    const lonGroup = this.createCoordinateInputGroup(
      "longitude",
      "Longitud",
      "-180",
      "180",
      "ej: -74.006",
    );

    coordsContainer.appendChild(latGroup);
    coordsContainer.appendChild(lonGroup);

    group.appendChild(label);
    group.appendChild(radioContainer);
    group.appendChild(coordsContainer);

    this.loadCapitalsFromApi(citySelect);

    return group;
  }

  setCitySelectOptions(citySelect, capitals) {
    citySelect.innerHTML = "";

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = capitals.length
      ? "-- Selecciona una ciudad --"
      : "Cargando capitales desde API...";
    citySelect.appendChild(defaultOption);

    capitals.forEach((city) => {
      const option = document.createElement("option");
      option.value = JSON.stringify({
        name: city.name,
        lat: city.lat,
        lon: city.lon,
      });
      option.textContent = city.name;
      citySelect.appendChild(option);
    });

    const customOption = document.createElement("option");
    customOption.value = JSON.stringify({
      name: "Especificar Coordenadas",
      lat: null,
      lon: null,
    });
    customOption.textContent = "Especificar Coordenadas";
    citySelect.appendChild(customOption);
  }

  async loadCapitalsFromApi(citySelect) {
    try {
      this.capitalCities = await ColombiaApi.getDepartmentCapitals();
      this.setCitySelectOptions(citySelect, this.capitalCities);
      citySelect.disabled = false;
    } catch {
      this.setCitySelectOptions(citySelect, []);
      citySelect.disabled = false;
      this.showError("No se pudieron cargar capitales desde la API de Colombia");
    }
  }

  parseCityOptionValue(rawValue) {
    if (!rawValue) return null;
    try {
      return JSON.parse(rawValue);
    } catch {
      return null;
    }
  }

  createCoordinateInputGroup(id, labelText, min, max, placeholder) {
    const group = document.createElement("div");
    group.className = "coord-input-group";

    const label = document.createElement("label");
    label.htmlFor = id;
    label.textContent = labelText;

    const input = document.createElement("input");
    input.id = id;
    input.name = id;
    input.type = "number";
    input.step = "0.0001";
    input.min = min;
    input.max = max;
    input.placeholder = placeholder;
    input.className = "form-input";

    group.appendChild(label);
    group.appendChild(input);

    return group;
  }

  // =====================
  // CREAR OPCIÓN RADIO
  // =====================
  createRadioOption(name, value, label, checked = false) {
    const container = document.createElement("div");
    container.className = "radio-option";

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = name;
    radio.value = value;
    radio.id = `${name}-${value}`;
    radio.checked = checked;
    radio.required = true;

    const labelEl = document.createElement("label");
    labelEl.htmlFor = `${name}-${value}`;
    labelEl.textContent = label;

    container.appendChild(radio);
    container.appendChild(labelEl);

    return container;
  }

  // =====================
  // CREAR GRUPO DE TAMAÑO DE MAPA
  // =====================
  createMapSizeGroup() {
    const group = document.createElement("div");
    group.className = "form-group";

    const label = document.createElement("label");
    label.htmlFor = "mapSize";
    label.textContent = "Tamaño del Mapa";

    const select = document.createElement("select");
    select.id = "mapSize";
    select.name = "mapSize";
    select.className = "form-select";
    select.required = true;

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "-- Selecciona un tamaño --";
    select.appendChild(defaultOption);

    MAP_SIZES.forEach((size) => {
      const option = document.createElement("option");
      option.value = size.value;
      option.textContent = size.label;
      select.appendChild(option);
    });

    group.appendChild(label);
    group.appendChild(select);

    return group;
  }

  createMapLoaderGroup() {
    const group = document.createElement("div");
    group.className = "form-group";

    const label = document.createElement("label");
    label.textContent = "Cargar Mapa desde Archivo (Opcional)";

    const loaderContainer = document.createElement("div");
    loaderContainer.className = "map-loader-container";

    // Input file oculto
    const fileInput = document.createElement("input");
    fileInput.id = "mapFileInput";
    fileInput.type = "file";
    fileInput.accept = ".txt";
    fileInput.classList.add("hidden-input");

    // Botón visible para cargar archivo
    const loadButton = document.createElement("button");
    loadButton.type = "button";
    loadButton.className = "map-load-button";
    loadButton.textContent = "📁 Seleccionar archivo .txt";
    loadButton.addEventListener("click", () => fileInput.click());

    // Contenedor de estado del archivo
    const statusDiv = document.createElement("div");
    statusDiv.id = "mapLoadStatus";
    statusDiv.className = "map-load-status";

    // Mensaje de información
    const infoDiv = document.createElement("p");
    infoDiv.className = "map-loader-info";
    infoDiv.textContent = "Carga un archivo .txt con el mapa. Los recursos se calcularán automáticamente basándose en los edificios.";

    // Handle file selection
    fileInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        this.handleMapFileUpload(e.target.files[0], loadButton, statusDiv);
      }
    });

    loaderContainer.appendChild(loadButton);
    loaderContainer.appendChild(statusDiv);
    loaderContainer.appendChild(infoDiv);
    loaderContainer.appendChild(fileInput);

    group.appendChild(label);
    group.appendChild(loaderContainer);

    return group;
  }

  async handleMapFileUpload(file, loadButton, statusDiv) {
    try {
      const content = await this.readFileAsText(file);
      
      // Import map parser dynamically
      const { MapFileParser } = await import("../../services/mapFileParser.js");
      
      // Parse the file
      const result = MapFileParser.parseMapFile(content);
      
      if (!result.valid) {
        this.showMapLoadError(statusDiv, result.error, result.errorRow);
        loadButton.classList.remove("success");
        this.mapLayout = null;
        return;
      }
      
      // Validate that map size matches selected size (or update it)
      const selectedMapSize = parseInt(document.getElementById("mapSize").value);
      if (selectedMapSize && selectedMapSize !== result.size) {
        // Auto-update map size to match loaded map
        document.getElementById("mapSize").value = result.size;
      }
      
      // Store the layout
      this.mapLayout = result.layout;
      
      // Count buildings in the loaded map
      const buildingCount = this.getMapBuildingCount(result.stats);
      const groundCount = result.stats?.groundCells || 0;
      const roadCount = result.stats?.roadCells || 0;
      
      // Show success status with detailed information
      statusDiv.innerHTML = `
        <div class="map-load-success">
          ✅ Mapa cargado correctamente
          <br />
          <small>
            Tamaño: ${result.size}x${result.size} | 
            Terreno: ${groundCount} | 
            Caminos: ${roadCount} | 
            Edificios: ${buildingCount}
          </small>
        </div>
      `;
      statusDiv.classList.add("is-visible");
      loadButton.classList.add("success");
      
    } catch (error) {
      this.showMapLoadError(statusDiv, `Error al leer el archivo: ${error.message}`);
      loadButton.classList.remove("success");
      this.mapLayout = null;
    }
  }

  readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
      reader.readAsText(file);
    });
  }

  getMapBuildingCount(stats) {
    if (!stats || !stats.buildings) return 0;
    return Object.values(stats.buildings).reduce((sum, count) => sum + count, 0);
  }

  showMapLoadError(statusDiv, error, errorRow = null) {
    const errorMessage = errorRow 
      ? `Error en Fila ${errorRow}: ${error}` 
      : error;
    statusDiv.innerHTML = `
      <div class="map-load-error">
        ❌ ${errorMessage}
      </div>
    `;
    statusDiv.classList.add("is-visible");
  }

  createInitialResourcesGroup() {
    const group = document.createElement("div");
    group.className = "form-group";

    const label = document.createElement("label");
    label.textContent = "Recursos Iniciales";

    const resourcesGrid = document.createElement("div");
    resourcesGrid.className = "initial-resources-grid";

    const energyGroup = this.createResourceInputGroup(
      "initialEnergy",
      "Energia",
      0,
      0,
    );
    const waterGroup = this.createResourceInputGroup(
      "initialWater",
      "Agua",
      0,
      0,
    );
    const foodGroup = this.createResourceInputGroup(
      "initialFood",
      "Alimento",
      0,
      0,
    );

    resourcesGrid.appendChild(energyGroup);
    resourcesGrid.appendChild(waterGroup);
    resourcesGrid.appendChild(foodGroup);

    const labelContainer = document.createElement("div");
    labelContainer.className = "map-loader-label-container";

    labelContainer.appendChild(label);

    group.appendChild(labelContainer);
    group.appendChild(resourcesGrid);

    return group;
  }

  createResourceInputGroup(id, labelText, min = 0, defaultValue = 0) {
    const wrapper = document.createElement("div");
    wrapper.className = "resource-input-group";

    const label = document.createElement("label");
    label.htmlFor = id;
    label.textContent = labelText;

    const input = document.createElement("input");
    input.id = id;
    input.name = id;
    input.type = "number";
    input.min = String(min);
    input.step = "1";
    input.required = true;
    input.value = String(defaultValue);
    input.className = "form-input";

    wrapper.appendChild(label);
    wrapper.appendChild(input);

    return wrapper;
  }

  // =====================
  // MANEJAR ENVÍO DEL FORMULARIO
  // =====================
  handleSubmit(e) {
    e.preventDefault();

    // Validación básica
    const formData = this.getFormData();
    const validation = this.validateFormData(formData);

    if (!validation.valid) {
      this.showError(validation.message);
      return;
    }

    // Llamar al callback con los datos
    if (this.onSubmit) {
      this.onSubmit(formData);
    }
  }

  // =====================
  // OBTENER DATOS DEL FORMULARIO
  // =====================
  getFormData() {
    const cityName = document.getElementById("cityName").value.trim();
    const mayorName = document.getElementById("mayorName").value.trim();
    const mapSize = parseInt(document.getElementById("mapSize").value);
    const initialEnergy = Number(document.getElementById("initialEnergy").value);
    const initialWater = Number(document.getElementById("initialWater").value);
    const initialFood = Number(document.getElementById("initialFood").value);
    const citySelectValue = document.getElementById("citySelect").value;
    let region = this.parseCityOptionValue(citySelectValue);

    if (!region) {
      return {
        cityName,
        mayorName,
        region: null,
        mapSize,
        mapLayout: this.mapLayout ? [...this.mapLayout] : null,
        initialResources: {
          energy: initialEnergy,
          water: initialWater,
          food: initialFood,
        },
      };
    }

    // Si se especificaron coordenadas manualmente
    if (region.lat === null) {
      const lat = parseFloat(document.getElementById("latitude").value);
      const lon = parseFloat(document.getElementById("longitude").value);

      if (isNaN(lat) || isNaN(lon)) {
        region.lat = 0;
        region.lon = 0;
      } else {
        region.lat = lat;
        region.lon = lon;
      }
      region.name = "Localización Personalizada";
    }

    return {
      cityName,
      mayorName,
      region,
      mapSize,
      mapLayout: this.mapLayout ? [...this.mapLayout] : null,
      initialResources: {
        energy: initialEnergy,
        water: initialWater,
        food: initialFood,
      },
    };
  }

  // =====================
  // VALIDAR DATOS DEL FORMULARIO
  // =====================
  validateFormData(data) {
    if (!data.cityName || data.cityName.length === 0) {
      return { valid: false, message: "El nombre de la ciudad es obligatorio" };
    }

    if (data.cityName.length > 50) {
      return {
        valid: false,
        message: "El nombre de la ciudad no puede exceder 50 caracteres",
      };
    }

    if (!data.mayorName || data.mayorName.length === 0) {
      return { valid: false, message: "El nombre del alcalde es obligatorio" };
    }

    if (data.mayorName.length > 50) {
      return {
        valid: false,
        message: "El nombre del alcalde no puede exceder 50 caracteres",
      };
    }

    if (!data.region || !data.region.name) {
      return { valid: false, message: "Debe seleccionar una región" };
    }

    // Si hay mapa cargado, usar ese tamaño. Si no, validar el tamaño seleccionado
    const mapSize = data.mapLayout ? data.mapLayout.length : data.mapSize;
    if (!mapSize || mapSize < 15 || mapSize > 30) {
      return { valid: false, message: "El tamaño del mapa debe estar entre 15 y 30" };
    }

    const energy = Number(data?.initialResources?.energy);
    const water = Number(data?.initialResources?.water);
    const food = Number(data?.initialResources?.food);

    if (!Number.isFinite(energy) || energy < 0) {
      return { valid: false, message: "La energia inicial debe ser un número mayor o igual a 0" };
    }

    if (!Number.isFinite(water) || water < 0) {
      return { valid: false, message: "El agua inicial debe ser un número mayor o igual a 0" };
    }

    if (!Number.isFinite(food) || food < 0) {
      return { valid: false, message: "El alimento inicial debe ser un número mayor o igual a 0" };
    }

    return { valid: true };
  }

  // =====================
  // MOSTRAR ERROR
  // =====================
  showError(message) {
    this.showFormMessage("form-error", `❌ ${message}`, true);
  }

  // =====================
  // MOSTRAR ÉXITO
  // =====================
  showSuccess(message) {
    this.showFormMessage("form-success", `✅ ${message}`);
  }

  showFormMessage(className, message, autoHide = false) {
    const formGroup = this.form.querySelector(".form-group");
    let messageDiv = this.form.querySelector(`.${className}`);

    if (!messageDiv) {
      messageDiv = document.createElement("div");
      messageDiv.className = className;
      this.form.insertBefore(messageDiv, formGroup);
    }

    messageDiv.textContent = message;
    messageDiv.classList.add("is-visible");

    if (autoHide) {
      setTimeout(() => {
        messageDiv.classList.remove("is-visible");
      }, 5000);
    }
  }

  // =====================
  // DESTRUIR FORMULARIO
  // =====================
  destroy() {
    const overlay = document.getElementById(this.containerId);
    if (overlay) {
      overlay.remove();
    }
  }

  // =====================
  // DESHABILITAR FORMULARIO
  // =====================
  disableForm(disabled = true) {
    const inputs = this.form.querySelectorAll("input, select, button");
    inputs.forEach((input) => {
      input.disabled = disabled;
    });
  }
}
