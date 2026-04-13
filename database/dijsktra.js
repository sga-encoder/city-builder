// Para arrancar el backend local:
// py ./domain/utilis/dijsktra/ms_smart_city-main/main.py
const DEFAULT_ROUTE_API_URL = "http://127.0.0.1:5000/api/calculate-route";
const REQUEST_TIMEOUT_MS = 30000;

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

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        map: roadMatrix,
        start: normalizedStart,
        end: normalizedEnd,
      }),
      signal: controller.signal,
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error:
          payload?.error ||
          "No se pudo calcular la ruta usando el backend Python de Dijkstra.",
      };
    }

    return {
      ok: true,
      status: response.status,
      route: payload?.route || [],
    };
  } catch (error) {
    const message = String(error?.message || "").toLowerCase();
    const isTimeout = error?.name === "AbortError";
    const isNetworkError =
      message.includes("failed to fetch") || message.includes("networkerror");

    if (isTimeout) {
      return {
        ok: false,
        error:
          "Timeout esperando el backend Python de Dijkstra. Arráncalo con: py ./domain/utilis/dijsktra/ms_smart_city-main/main.py",
      };
    }

    if (isNetworkError) {
      return {
        ok: false,
        error:
          "No hay conexión con el backend Python de Dijkstra. Arráncalo con: py ./domain/utilis/dijsktra/ms_smart_city-main/main.py",
      };
    }

    return {
      ok: false,
      error: error?.message || "No se pudo conectar al backend Python de Dijkstra",
    };
  } finally {
    clearTimeout(timeoutId);
  }
};
