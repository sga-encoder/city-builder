export class MainMenuRenderer {
  constructor(containerId = "main-menu-overlay") {
    this.containerId = containerId;
    this.callbacks = {};
  }

  render(callbacks = {}) {
    this.callbacks = callbacks;

    const overlay = document.createElement("div");
    overlay.id = this.containerId;
    overlay.className = "main-menu-overlay";

    const container = document.createElement("div");
    container.className = "main-menu-container";

    const title = document.createElement("h1");
    title.className = "main-menu-title";
    title.textContent = "City Builder";

    const subtitle = document.createElement("p");
    subtitle.className = "main-menu-subtitle";
    subtitle.textContent = "Selecciona una opcion para continuar";

    const actions = document.createElement("div");
    actions.className = "main-menu-actions";

    actions.appendChild(
      this.#buildButton("main-menu-btn main-menu-btn-primary", "Crear ciudad", () => {
        this.callbacks?.onCreate?.();
      }),
    );

    actions.appendChild(
      this.#buildButton("main-menu-btn main-menu-btn-secondary", "Cargar ciudad", () => {
        this.callbacks?.onLoad?.();
      }),
    );

    const hasSave = localStorage.getItem("cityConfig");
    if (hasSave) {
      actions.appendChild(
        this.#buildButton("main-menu-btn main-menu-btn-continue", "Continuar partida anterior", () => {
             this.callbacks?.onContinue?.();
        }),
      );
    }

    actions.appendChild(
      this.#buildButton("main-menu-btn main-menu-btn-tertiary", "Ver leaderboard", () => {
        this.callbacks?.onLeaderboard?.();
      }),
    );

    actions.appendChild(
      this.#buildButton("main-menu-btn main-menu-btn-tertiary", "Ajustes", () => {
        this.callbacks?.onSettings?.();
      }),
    );

    container.appendChild(title);
    container.appendChild(subtitle);
    container.appendChild(actions);
    overlay.appendChild(container);

    document.body.appendChild(overlay);
    return overlay;
  }

  #buildButton(className, label, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = label;
    button.addEventListener("click", onClick);
    return button;
  }

  destroy() {
    const overlay = document.getElementById(this.containerId);
    if (overlay) {
      overlay.remove();
    }
  }
}
