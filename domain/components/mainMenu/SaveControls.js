import { SaveManager } from "../../services/cityBuilder/managers/SaveManager.js";
import { ToastService } from "../../services/toast.js";

export class SaveControls {
  static SAVE_BUTTON_ID = "in-game-save-btn";
  static DELETE_BUTTON_ID = "in-game-delete-btn";

  static render(onDeleteCallback) {
    this.destroy();

    const mountTarget = document.querySelector("#slide-right") || document.body;

    const saveButton = document.createElement("button");
    saveButton.id = this.SAVE_BUTTON_ID;
    saveButton.type = "button";
    saveButton.className = "in-game-save-btn";
    if (mountTarget.id === "slide-right") {
      saveButton.classList.add("in-panel");
    }

    saveButton.textContent = "Guardar";
    saveButton.title = "Guardar partida (se autoguarda cada 30s)";
    
    saveButton.addEventListener("click", () => {
      SaveManager.saveGame();
    });

    const deleteButton = document.createElement("button");
    deleteButton.id = this.DELETE_BUTTON_ID;
    deleteButton.type = "button";
    deleteButton.className = "in-game-delete-btn";

    if (mountTarget.id === "slide-right") {
      deleteButton.classList.add("in-panel");
    }

    deleteButton.textContent = "Borrar Save";
    deleteButton.title = "Eliminar progreso guardado";
    
    deleteButton.addEventListener("click", () => {
      if (SaveManager.deleteSavedGame()) {
        if (typeof onDeleteCallback === "function") {
          onDeleteCallback();
        }
      }
    });

    // Añadir a target
    mountTarget.appendChild(saveButton);
    mountTarget.appendChild(deleteButton);
  }

  static destroy() {
    const sb = document.getElementById(this.SAVE_BUTTON_ID);
    if (sb) sb.remove();
    const db = document.getElementById(this.DELETE_BUTTON_ID);
    if (db) db.remove();
  }
}
