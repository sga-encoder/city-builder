// Servicio de Toast
export const ToastService = (() => {
  // Crea el contenedor si no existe
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  function mostrarToast(mensaje, tipo = "info", duracion = 3000) {
    const toast = document.createElement("div");
    toast.className = `toast toast-${tipo}`;
    toast.textContent = mensaje;

    // Cerrar al hacer clic
    toast.onclick = () => container.removeChild(toast);

    container.appendChild(toast);

    setTimeout(() => {
      if (container.contains(toast)) {
        container.removeChild(toast);
      }
    }, duracion);
  }

  return {
    mostrarToast,
  };
})();
