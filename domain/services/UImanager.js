import { renderSlideLeftMenu } from "../components/SlideLeft.js";
import { renderSlideRightMenu } from "../components/SlideRight.js";
import { SlideLeftController } from "../controllers/SlideLeftController.js";
import { TurnControlPanel } from "../components/turnControl/TurnControlPanel.js";
import { TurnStats } from "../components/turnControl/TurnStats.js";
import { createDebugToggleButton } from "../utilis/DebugToggleButton.js";

export class UIManager {
  static renderMenus(resources, icons, builds) {
    renderSlideLeftMenu(resources, icons, builds);
    renderSlideRightMenu(icons);
  }

  static initMenuControllers(city, builds, icons) {
    SlideLeftController.initSlideLeftController(city, builds, icons);
  }

  static renderTurnPanels(turnSystem, city) {
    TurnControlPanel.render(turnSystem, city);
    TurnStats.render(turnSystem.getState(), city);
  }

  static updateTurnStats(turnSystem, city, diff) {
    TurnStats.updateStats(turnSystem.getState(), city, diff);
  }

  static showDebugButton() {
    createDebugToggleButton();
  }
}
