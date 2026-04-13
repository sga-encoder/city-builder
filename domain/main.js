import { CityBuilderInitializer } from "./services/cityBuilder/Initializer.js";
import { CitySelectionController } from "./controllers/citySelection/Controller.js";
import { CityCreationController } from "./controllers/cityCreation/Controller.js";
import { MainMenuController } from "./controllers/mainMenu/Controller.js";
import { LeaderboardController } from "./controllers/leaderBoard/Controller.js";
import { ToastService } from "./services/toast.js";
import { Logger } from "./utilis/Logger.js";

(async () => {
  Logger.log("🎮 [Main] Iniciando aplicación");

  const mainMenuController = new MainMenuController();
  const leaderboardController = new LeaderboardController();

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
        ToastService.mostrarToast("Ajustes en construccion", "info");
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
