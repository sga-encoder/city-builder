export class News {
  constructor({
    id,
    title,
    description,
    image,
    url,
    source,
    publishedAt,
  } = {}) {
    this.id = News.normalizeText(id) || News.generateId();
    this.title = News.normalizeText(title) || "Sin titulo";
    this.description = News.normalizeText(description) || "Sin descripcion disponible";
    this.image = News.normalizeUrl(image);
    this.url = News.normalizeUrl(url);
    this.source = News.normalizeText(source) || "Fuente desconocida";
    this.publishedAt = News.normalizePublishedAt(publishedAt);
  }

  static normalizeText(value) {
    if (value === null || value === undefined) return "";
    return String(value).trim();
  }

  static normalizeUrl(value) {
    const parsed = News.normalizeText(value);
    return parsed;
  }

  static normalizePublishedAt(value) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
  }

  static generateId(index = 0) {
    return `${Date.now()}-${index}`;
  }

  static fromApi(item = {}, index = 0) {
    return new News({
      id: item?.id || News.generateId(index),
      title: item?.title,
      description: item?.description,
      image: item?.urlToImage,
      url: item?.url,
      source: item?.source?.name,
      publishedAt: item?.publishedAt,
    });
  }

  static fromStored(item = {}, index = 0) {
    return new News({
      id: item?.id || News.generateId(index),
      title: item?.title,
      description: item?.description,
      image: item?.image || item?.urlToImage,
      url: item?.url,
      source: item?.source,
      publishedAt: item?.publishedAt,
    });
  }

  static fromArray(items = [], options = {}) {
    const { max = 5, source = "api" } = options;
    const parser = source === "stored" ? News.fromStored : News.fromApi;

    return (Array.isArray(items) ? items : [])
      .slice(0, max)
      .map((item, index) => parser(item, index));
  }

  isValid() {
    return Boolean(this.title);
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      image: this.image,
      url: this.url,
      source: this.source,
      publishedAt: this.publishedAt,
    };
  }
}