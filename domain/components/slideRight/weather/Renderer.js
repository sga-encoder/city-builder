import { WeatherPanelBuilder } from "./Builder.js";

export class WeatherPanel {
  static render(container, weatherService) {
    if (!container || !weatherService) return;

    if (!container._weatherPanelSubscribed) {
      weatherService.addObserver(() => {
        const panel = container.querySelector("#weather-container");
        if (!panel) return;
        const nextPanel = WeatherPanelBuilder.build(weatherService.getSnapshot());
        panel.replaceWith(nextPanel);
      });
      container._weatherPanelSubscribed = true;
    }

    const oldPanel = container.querySelector("#weather-container");
    if (oldPanel) oldPanel.remove();

    const panel = WeatherPanelBuilder.build(weatherService.getSnapshot());
    container.appendChild(panel);
  }

  static destroy(container) {
    if (!container) return;
    const oldPanel = container.querySelector("#weather-container");
    if (oldPanel) oldPanel.remove();
  }
}
