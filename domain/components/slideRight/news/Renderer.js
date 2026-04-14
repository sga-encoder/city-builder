import { NewsPanelBuilder } from "./Builder.js";

export class NewsPanel {
  static render(container, newsService) {
    if (!container || !newsService) return;

    if (!container._newsPanelSubscribed) {
      newsService.addObserver(() => {
        const panel = container.querySelector("#news-container");
        if (!panel) return;
        const nextPanel = NewsPanelBuilder.build(newsService.getSnapshot());
        panel.replaceWith(nextPanel);
      });
      container._newsPanelSubscribed = true;
    }

    const oldPanel = container.querySelector("#news-container");
    if (oldPanel) oldPanel.remove();

    const panel = NewsPanelBuilder.build(newsService.getSnapshot());
    container.appendChild(panel);
  }

  static destroy(container) {
    if (!container) return;
    const oldPanel = container.querySelector("#news-container");
    if (oldPanel) oldPanel.remove();
  }
}
