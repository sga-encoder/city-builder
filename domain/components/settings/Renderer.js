export class SettingsRenderer {
  constructor(containerId = "settings-overlay") {
    this.containerId = containerId;
    this.callbacks = {};
  }

  render(initialValues = {}, callbacks = {}) {
    this.callbacks = callbacks;

    const overlay = document.createElement("div");
    overlay.id = this.containerId;
    overlay.className = "settings-overlay";

    const container = document.createElement("div");
    container.className = "settings-container";

    const title = document.createElement("h2");
    title.className = "settings-title";
    title.textContent = "Ajustes de simulacion";

    const subtitle = document.createElement("p");
    subtitle.className = "settings-subtitle";
    subtitle.textContent =
      "Configura felicidad de servicios, necesidades por ciudadano, crecimiento por turno y duración de turnos.";

    const form = document.createElement("form");
    form.className = "settings-form";

    form.appendChild(
      this.#buildField({
        id: "serviceHappinessPerTurn",
        label: "Felicidad por turno de edificios Service",
        min: 0,
        step: 1,
        value: initialValues.serviceHappinessPerTurn,
      }),
    );

    form.appendChild(this.#buildSectionTitle("Necesidades por ciudadano por turno"));

    form.appendChild(
      this.#buildField({
        id: "citizenNeedWater",
        label: "Agua",
        min: 0,
        step: 0.1,
        value: initialValues?.citizenNeedsPerTurn?.water,
      }),
    );

    form.appendChild(
      this.#buildField({
        id: "citizenNeedElectricity",
        label: "Electricidad",
        min: 0,
        step: 0.1,
        value: initialValues?.citizenNeedsPerTurn?.electricity,
      }),
    );

    form.appendChild(
      this.#buildField({
        id: "citizenNeedFood",
        label: "Comida",
        min: 0,
        step: 0.1,
        value: initialValues?.citizenNeedsPerTurn?.food,
      }),
    );

    form.appendChild(this.#buildSectionTitle("Poblacion"));

    form.appendChild(
      this.#buildField({
        id: "maxCitizensGeneratedPerTurn",
        label: "Maximo de ciudadanos generados por turno",
        min: 1,
        step: 1,
        value: initialValues.maxCitizensGeneratedPerTurn,
      }),
    );

    form.appendChild(this.#buildSectionTitle("Duración de turnos"));

    form.appendChild(
      this.#buildField({
        id: "turnDurationMs",
        label: "Duración del turno (milisegundos)",
        min: 100,
        step: 100,
        value: initialValues.turnDurationMs,
      }),
    );

    const actions = document.createElement("div");
    actions.className = "settings-actions";

    const saveButton = document.createElement("button");
    saveButton.type = "submit";
    saveButton.className = "settings-btn settings-btn-primary";
    saveButton.textContent = "Guardar";

    const resetButton = document.createElement("button");
    resetButton.type = "button";
    resetButton.className = "settings-btn settings-btn-warning";
    resetButton.textContent = "Restablecer por defecto";
    resetButton.addEventListener("click", () => {
      this.callbacks?.onReset?.();
    });

    const backButton = document.createElement("button");
    backButton.type = "button";
    backButton.className = "settings-btn settings-btn-secondary";
    backButton.textContent = "Volver";
    backButton.addEventListener("click", () => {
      this.callbacks?.onBack?.();
    });

    actions.appendChild(saveButton);
    actions.appendChild(resetButton);
    actions.appendChild(backButton);

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const payload = this.#collectValues(form);
      this.callbacks?.onSave?.(payload);
    });

    form.appendChild(actions);
    container.appendChild(title);
    container.appendChild(subtitle);
    container.appendChild(form);
    overlay.appendChild(container);

    document.body.appendChild(overlay);
    return overlay;
  }

  #buildSectionTitle(label) {
    const sectionTitle = document.createElement("h3");
    sectionTitle.className = "settings-section-title";
    sectionTitle.textContent = label;
    return sectionTitle;
  }

  #buildField({ id, label, min = 0, step = 1, value = 0 }) {
    const wrapper = document.createElement("label");
    wrapper.className = "settings-field";
    wrapper.htmlFor = id;

    const text = document.createElement("span");
    text.className = "settings-field-label";
    text.textContent = label;

    const input = document.createElement("input");
    input.type = "number";
    input.id = id;
    input.name = id;
    input.min = String(min);
    input.step = String(step);
    input.required = true;
    input.className = "settings-input";
    input.value = String(value ?? 0);

    wrapper.appendChild(text);
    wrapper.appendChild(input);
    return wrapper;
  }

  #collectValues(form) {
    const getNum = (name) => Number(form.elements[name]?.value || 0);

    return {
      serviceHappinessPerTurn: getNum("serviceHappinessPerTurn"),
      citizenNeedsPerTurn: {
        water: getNum("citizenNeedWater"),
        electricity: getNum("citizenNeedElectricity"),
        food: getNum("citizenNeedFood"),
      },
      maxCitizensGeneratedPerTurn: getNum("maxCitizensGeneratedPerTurn"),
      turnDurationMs: getNum("turnDurationMs"),
    };
  }

  destroy() {
    const overlay = document.getElementById(this.containerId);
    if (overlay) overlay.remove();
  }
}
