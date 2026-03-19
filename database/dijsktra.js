const DEFAULT_ROUTE_API_URL = "http://127.0.0.1:5000/api/calculate-route";

const toPoint = (value) => {
  if (!Array.isArray(value) || value.length !== 2) return null;

  const i = Number.parseInt(value[0], 10);
  const j = Number.parseInt(value[1], 10);
  if (Number.isNaN(i) || Number.isNaN(j)) return null;

  return [i, j];
};


export const calculateRoute = async ({
  roadMatrix,
  start,
  end,
  apiUrl = DEFAULT_ROUTE_API_URL,
}) => {
  if (
    !Array.isArray(roadMatrix) ||
    !roadMatrix.length ||
    !Array.isArray(roadMatrix[0])
  ) {
    return { ok: false, error: "roadMatrix no disponible" };
  }

  const normalizedStart = toPoint(start);
  const normalizedEnd = toPoint(end);
  if (!normalizedStart || !normalizedEnd) {
    return { ok: false, error: "start o end inválidos" };
  }

  if (
    normalizedStart[0] === normalizedEnd[0] &&
    normalizedStart[1] === normalizedEnd[1]
  ) {
    return {
      ok: false,
      error: "El inicio y el destino son la misma casilla.",
    };
  }

  const [maxI, maxJ] = [roadMatrix.length, roadMatrix[0].length];
  const isInside = ([i, j]) => i >= 0 && j >= 0 && i < maxI && j < maxJ;
  if (!isInside(normalizedStart) || !isInside(normalizedEnd)) {
    return { ok: false, error: "start o end fuera de rango" };
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        map: roadMatrix,
        start: normalizedStart,
        end: normalizedEnd,
      }),
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: payload?.error || "No se pudo calcular ruta",
      };
    }

    return {
      ok: true,
      status: response.status,
      route: payload?.route || [],
    };
  } catch (error) {
    const message = String(error?.message || "").toLowerCase();
    if (message.includes("failed to fetch") || message.includes("networkerror")) {
      return {
        ok: false,
        error:
          "No hay conexión con Flask (Dijkstra). Inicia el backend en domain/utilis/dijsktra/ms_smart_city-main con: python main.py",
      };
    }

    return {
      ok: false,
      error: error?.message || "No se pudo conectar al servicio de rutas",
    };
  }
};
