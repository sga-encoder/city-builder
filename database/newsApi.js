import { fetchJsonWithTimeout } from "./apiClient.js";

export async function fetchTopHeadlines({
  cityQuery,
  apiKey,
  pageSize = 5,
  timeoutMs = 10000,
}) {
  const url = new URL("https://newsapi.org/v2/everything");
  url.searchParams.set("q", String(cityQuery || "colombia").toLowerCase());
  url.searchParams.set("pageSize", String(pageSize));
  url.searchParams.set("apiKey", apiKey);

  return fetchJsonWithTimeout(url.toString(), { timeoutMs });
}