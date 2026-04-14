export async function fetchJsonWithTimeout(url, options = {}) {
  const { timeoutMs = 10000, method = "GET", headers = {}, body } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...headers,
      },
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        ok: false,
        status: response.status,
        error: errorText || `HTTP ${response.status}`,
      };
    }

    const data = await response.json();
    return { ok: true, status: response.status, data };
  } catch (error) {
    const isAbort = error?.name === "AbortError";
    return {
      ok: false,
      status: 0,
      error: isAbort ? "Timeout de solicitud" : String(error?.message || "Error de red"),
    };
  } finally {
    clearTimeout(timer);
  }
}