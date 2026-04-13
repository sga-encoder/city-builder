import { DevUtils } from "../../../utilis/devUtils/DevUtils.js";
import { CityBuilderUIManager } from "../managers/UIManager.js";
import { ScoringRender } from "../../../components/score/ScoringRender.js";
import { InGameReturnButton } from "../../../components/mainMenu/InGameReturnButton.js";

export class UIPhase {
  static execute({ city, icons, builds, turnSystem, onReturnToMainMenu }) {
    DevUtils.init(turnSystem);
    CityBuilderUIManager.renderMenus(city.resources, icons, builds);
    CityBuilderUIManager.initMenuControllers(city, builds, icons);
    ScoringRender.render(city, turnSystem);
    InGameReturnButton.render(onReturnToMainMenu);
  }
}
