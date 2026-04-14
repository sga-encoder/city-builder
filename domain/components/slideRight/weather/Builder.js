function formatDate(ts) {
  if (!ts) return "-";
  try {
    return new Date(ts).toLocaleString("es-CO");
  } catch {
    return "-";
  }
}

function buildRow(label, value) {
  const row = document.createElement("div");
  row.classList.add("weather-row");

  const key = document.createElement("span");
  key.classList.add("weather-key");
  key.textContent = label;

  const val = document.createElement("span");
  val.classList.add("weather-value");
  val.textContent = value;

  row.appendChild(key);
  row.appendChild(val);
  return row;
}

export class WeatherPanelBuilder {
  static build(snapshot) {
    const panel = document.createElement("section");
    panel.id = "weather-container";

    const title = document.createElement("h3");
    title.classList.add("weather-title");
    title.textContent = "Clima actual";
    panel.appendChild(title);

    if (snapshot?.status === "loading") {
      const loading = document.createElement("p");
      loading.classList.add("weather-loading");
      loading.textContent = "Actualizando clima...";
      panel.appendChild(loading);
      return panel;
    }

    if (!snapshot?.data) {
      const empty = document.createElement("p");
      empty.classList.add("weather-empty");
      empty.textContent = snapshot?.error || "Sin datos de clima.";
      panel.appendChild(empty);
      return panel;
    }

    const city = document.createElement("p");
    city.classList.add("weather-city");
    city.textContent = snapshot.data.cityName || "Ciudad";
    panel.appendChild(city);

    panel.appendChild(buildRow("Temperatura", `${snapshot.data.temperatureC} °C`));
    panel.appendChild(buildRow("Condicion", snapshot.data.condition || "-"));
    panel.appendChild(buildRow("Humedad", `${snapshot.data.humidity} %`));
    panel.appendChild(buildRow("Viento", `${snapshot.data.windKmh} km/h`));

    const footer = document.createElement("p");
    footer.classList.add("weather-footnote");
    footer.textContent = `Actualizado: ${formatDate(snapshot.updatedAt)} (${snapshot.source || "live"})`;
    panel.appendChild(footer);

    return panel;
  }
}
