import { fetchJsonWithTimeout } from "./apiClient.js";

export async function fetchCurrentWeather({
  lat,
  lon,
  apiKey,
  units = "metric",
  lang = "es",
  timeoutMs = 10000,
}) {
  const url = new URL("https://api.openweathermap.org/data/2.5/weather");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("appid", apiKey);
  url.searchParams.set("units", units);
  url.searchParams.set("lang", lang);

  return fetchJsonWithTimeout(url.toString(), { timeoutMs });
}