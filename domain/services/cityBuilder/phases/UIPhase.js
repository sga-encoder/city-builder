import { DevUtils } from "../../../utilis/devUtils/DevUtils.js";
import { CityBuilderUIManager } from "../managers/UIManager.js";
import { ScoringRender } from "../../../components/score/ScoringRender.js";
import { HappinessIndicator } from "../../../components/score/HappinessIndicator.js";
import { InGameReturnButton } from "../../../components/mainMenu/InGameReturnButton.js";
import { RouteCalculatorButton } from "../../../components/mainMenu/RouteCalculatorButton.js";
import { SaveControls } from "../../../components/mainMenu/SaveControls.js";

export class UIPhase {
  static execute({ city, icons, builds, turnSystem, onReturnToMainMenu }) {
    DevUtils.init(turnSystem);
    CityBuilderUIManager.renderMenus(city.resources, icons, builds);
    CityBuilderUIManager.initMenuControllers(city, builds, icons);
    ScoringRender.render(city, turnSystem);
    HappinessIndicator.render(city, turnSystem);
    InGameReturnButton.render(onReturnToMainMenu);
    SaveControls.render(() => {
      onReturnToMainMenu();
    });
    RouteCalculatorButton.render(() => {
      // Acción para calcular rutas (vacío por ahora, será implementado después)
    });
  }
}
