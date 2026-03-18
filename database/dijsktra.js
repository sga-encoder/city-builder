export const calculateRoute = async (start, end) => {
  const routeApiUrl = "http://127.0.0.1:5000/api/calculate-route";

  const roadMatrix = this.mapModel?.roadMatrix;
  if (
    !Array.isArray(roadMatrix) ||
    !roadMatrix.length ||
    !Array.isArray(roadMatrix[0])
  ) {
    return { ok: false, error: "roadMatrix no disponible" };
  }

  if (!start || !end) {
    return { ok: false, error: "start o end inválidos" };
  }

  try {
    const response = await fetch(routeApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        map: roadMatrix,
        start,
        end,
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
    return {
      ok: false,
      error: error?.message || "No se pudo conectar al servicio de rutas",
    };
  }
};
