import { CityBuilderInitializer } from "./services/cityBuilder/Initializer.js";
import { CitySelectionController } from "./controllers/citySelection/Controller.js";
import { CityCreationController } from "./controllers/cityCreation/Controller.js";
import { MainMenuController } from "./controllers/mainMenu/Controller.js";
import { LeaderboardController } from "./controllers/leaderBoard/Controller.js";
import { SettingsController } from "./controllers/settings/Controller.js";
import { ToastService } from "./services/toast.js";
import { Logger } from "./utilis/Logger.js";
import {
  getDefaultGameplaySettings,
  loadGameplaySettings,
  saveGameplaySettings,
} from "./config/gameplaySettings.js";

(async () => {
  Logger.log("🎮 [Main] Iniciando aplicación");

  const mainMenuController = new MainMenuController();
  const leaderboardController = new LeaderboardController();
  const settingsController = new SettingsController();

  const openSettings = () => {
    const currentSettings = loadGameplaySettings();
    settingsController.show(currentSettings, {
      onSave: (newSettings) => {
        saveGameplaySettings(newSettings);
        ToastService.mostrarToast("Ajustes guardados correctamente", "success");
        settingsController.destroy();
        openMainMenu();
      },
      onReset: () => {
        const defaultSettings = getDefaultGameplaySettings();
        saveGameplaySettings(defaultSettings);
        ToastService.mostrarToast("Valores restablecidos por defecto", "info");
        settingsController.destroy();
        openSettings();
      },
      onBack: () => {
        settingsController.destroy();
        openMainMenu();
      },
    });
  };

  const openMainMenu = () => {
    mainMenuController.show({
      onCreate: async () => {
        Logger.log("📝 [Main] Opción: crear ciudad");
        mainMenuController.destroy();
        await openCityCreation();
      },
      onLoad: async () => {
        Logger.log("📂 [Main] Opción: cargar ciudad");
        const hasSavedCities = CitySelectionController.hasSavedCities();
        if (!hasSavedCities) {
          ToastService.mostrarToast("No hay ciudades guardadas para cargar", "warn");
          return;
        }

        mainMenuController.destroy();
        await openCitySelection();
      },
      onLeaderboard: () => {
        Logger.log("🏆 [Main] Opción: leaderboard");
        mainMenuController.destroy();
        leaderboardController.show(() => {
          Logger.log("↩️ [Main] Volviendo al menú principal desde leaderboard");
          openMainMenu();
        });
      },
      onSettings: () => {
        Logger.log("⚙️ [Main] Opción: ajustes");
        mainMenuController.destroy();
        openSettings();
      },
    });
  };

  const openCityCreation = async () => {
    const creationController = new CityCreationController();
    creationController.show(
      async (cityData) => {
        Logger.log("✅ [Main] Ciudad creada:", cityData);
        await CityBuilderInitializer.buildCity({
          onReturnToMainMenu: () => {
            window.location.reload();
          },
        });
      },
      () => {
        Logger.log("↩️ [Main] Volviendo al menú principal desde creación");
        openMainMenu();
      },
    );
  };

  const openCitySelection = async () => {
    const selectionController = new CitySelectionController();
    selectionController.show(
      async (selectedCityData) => {
        Logger.log("✅ [Main] Ciudad seleccionada:", selectedCityData.name);
        await CityBuilderInitializer.buildCity({
          onReturnToMainMenu: () => {
            window.location.reload();
          },
        });
      },
      async () => {
        Logger.log("📝 [Main] Creando nueva ciudad desde selección");
        selectionController.destroy();
        await openCityCreation();
      },
      () => {
        Logger.log("↩️ [Main] Volviendo al menú principal desde carga de ciudad");
        openMainMenu();
      },
    );
  };

  openMainMenu();
})();
