function formatDate(ts) {
  if (!ts) return "-";
  try {
    return new Date(ts).toLocaleString("es-CO");
  } catch {
    return "-";
  }
}

function buildArticleCard(article) {
  const item = document.createElement("article");
  item.classList.add("news-item");

  if (article.image) {
    const image = document.createElement("img");
    image.classList.add("news-image");
    image.src = article.image;
    image.alt = article.title || "Noticia";
    item.appendChild(image);
  }

  const title = document.createElement("h4");
  title.classList.add("news-title");
  title.textContent = article.title || "Sin titulo";
  item.appendChild(title);

  const description = document.createElement("p");
  description.classList.add("news-description");
  description.textContent = article.description || "Sin descripcion disponible";
  item.appendChild(description);

  const source = document.createElement("p");
  source.classList.add("news-source");
  source.textContent = article.source || "Fuente desconocida";
  item.appendChild(source);

  if (article.url) {
    const link = document.createElement("a");
    link.classList.add("news-link");
    link.href = article.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Leer noticia";
    item.appendChild(link);
  }

  return item;
}

export class NewsPanelBuilder {
  static build(snapshot) {
    const panel = document.createElement("section");
    panel.id = "news-container";

    const title = document.createElement("h3");
    title.classList.add("news-heading");
    title.textContent = "Noticias regionales";
    panel.appendChild(title);

    if (snapshot?.status === "loading") {
      const loading = document.createElement("p");
      loading.classList.add("news-loading");
      loading.textContent = "Actualizando noticias...";
      panel.appendChild(loading);
      return panel;
    }

    const newsItems = Array.isArray(snapshot?.data) ? snapshot.data : [];
    if (!newsItems.length) {
      const empty = document.createElement("p");
      empty.classList.add("news-empty");
      empty.textContent = snapshot?.error || "No hay noticias disponibles.";
      panel.appendChild(empty);
      return panel;
    }

    const list = document.createElement("div");
    list.classList.add("news-list");
    newsItems.forEach((article) => list.appendChild(buildArticleCard(article)));
    panel.appendChild(list);

    const footer = document.createElement("p");
    footer.classList.add("news-footnote");
    footer.textContent = `Actualizado: ${formatDate(snapshot.updatedAt)} (${snapshot.source || "live"})`;
    panel.appendChild(footer);

    return panel;
  }
}
