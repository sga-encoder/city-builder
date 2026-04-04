// =====================
// CITY CREATION FORM RENDERER
// =====================

const CITY_OPTIONS = [
  { name: "Bogotá", lat: 4.7110, lon: -74.0055 },
  { name: "Medellín", lat: 6.2442, lon: -75.5898 },
  { name: "Cali", lat: 3.4372, lon: -76.5196 },
  { name: "Barranquilla", lat: 10.9639, lon: -74.7964 },
  { name: "Cartagena", lat: 10.3910, lon: -75.5139 },
  { name: "Santa Marta", lat: 11.2401, lon: -74.2273 },
  { name: "Cúcuta", lat: 7.8854, lon: -72.5078 },
  { name: "Especificar Coordenadas", lat: null, lon: null },
];

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
  }

  // =====================
  // CREAR FORMULARIO
  // =====================
  render(onSubmitCallback) {
    this.onSubmit = onSubmitCallback;

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

    // Botones
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "city-creation-buttons";

    const submitButton = document.createElement("button");
    submitButton.type = "submit";
    submitButton.className = "city-creation-submit";
    submitButton.textContent = "Crear Ciudad";

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

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "-- Selecciona una ciudad --";
    citySelect.appendChild(defaultOption);

    CITY_OPTIONS.forEach((city) => {
      const option = document.createElement("option");
      option.value = JSON.stringify({
        name: city.name,
        lat: city.lat,
        lon: city.lon,
      });
      option.textContent = city.name;
      citySelect.appendChild(option);
    });

    citySelect.addEventListener("change", (e) => {
      const coordsContainer = document.getElementById("coords-container");
      const selected = JSON.parse(e.target.value);
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

    return group;
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
    const citySelectValue = document.getElementById("citySelect").value;
    let region = JSON.parse(citySelectValue);

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

    if (!data.mapSize || data.mapSize < 15 || data.mapSize > 30) {
      return { valid: false, message: "El tamaño del mapa debe estar entre 15 y 30" };
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
