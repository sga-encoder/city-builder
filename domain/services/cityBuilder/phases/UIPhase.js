import { DevUtils } from "../../../utilis/devUtils/DevUtils.js";
import { CityBuilderUIManager } from "../managers/UIManager.js";

export class UIPhase {
  static execute({ city, icons, builds, turnSystem }) {
    DevUtils.init(turnSystem);
    CityBuilderUIManager.renderMenus(city.resources, icons, builds);
    CityBuilderUIManager.initMenuControllers(city, builds, icons);
  }
}
