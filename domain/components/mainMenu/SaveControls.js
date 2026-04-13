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
    saveButton.className = "in-game-return-btn";
    if (mountTarget.id === "slide-right") {
      saveButton.classList.add("in-panel");
      saveButton.style.left = "130px";
    } else {
      saveButton.style.left = "150px";
    }

    saveButton.textContent = "Guardar";
    saveButton.title = "Guardar partida (se autoguarda cada 30s)";
    
    saveButton.addEventListener("click", () => {
      SaveManager.saveGame();
    });

    const deleteButton = document.createElement("button");
    deleteButton.id = this.DELETE_BUTTON_ID;
    deleteButton.type = "button";
    deleteButton.className = "in-game-return-btn";

    if (mountTarget.id === "slide-right") {
      deleteButton.classList.add("in-panel");
      deleteButton.style.left = "250px";
      deleteButton.style.background = "linear-gradient(135deg, rgba(245, 66, 66, 0.95) 0%, rgba(243, 33, 33, 0.95) 100%)";
    } else {
      deleteButton.style.left = "280px";
      deleteButton.style.background = "linear-gradient(135deg, rgba(245, 66, 66, 0.95) 0%, rgba(243, 33, 33, 0.95) 100%)";
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
