import { CityBuilderInitializer } from "./services/cityBuilder/Initializer.js";
import { CitySelectionController } from "./controllers/citySelection/Controller.js";
import { CityCreationController } from "./controllers/cityCreation/Controller.js";
import { Logger } from "./utilis/Logger.js";

(async () => {
  Logger.log("🎮 [Main] Iniciando aplicación");

  // Verificar si hay ciudades guardadas
  const hasSavedCities = CitySelectionController.hasSavedCities();
  Logger.log("💾 [Main] ¿Ciudades guardadas?", hasSavedCities);

  if (hasSavedCities) {
    // Mostrar pantalla de selección de ciudad
    Logger.log("🏛️ [Main] Mostrando pantalla de selección de ciudades");
    
    const selectionController = new CitySelectionController();
    
    selectionController.show(
      // Callback: Cargar ciudad seleccionada
      async (selectedCityData) => {
        Logger.log("✅ [Main] Ciudad seleccionada:", selectedCityData.name);
        
        // Cargar ciudadanos, mapa, recursos, etc de la ciudad seleccionada
        // (Esto será manejado por el controlador de selección)
        
        // Inicializar juego con la ciudad cargada
        await CityBuilderInitializer.buildCity();
      },
      // Callback: Crear nueva ciudad
      async () => {
        Logger.log("📝 [Main] Creando nueva ciudad desde selección");
        
        const creationController = new CityCreationController();
        
        creationController.show(async (cityData) => {
          Logger.log("✅ [Main] Nueva ciudad creada:", cityData);
          
          // Inicializar juego con la ciudad creada
          await CityBuilderInitializer.buildCity();
        });
      }
    );
  } else {
    // No hay ciudades guardadas, mostrar formulario de creación
    Logger.log("📝 [Main] Mostrando formulario de creación de ciudad");
    
    const creationController = new CityCreationController();
    
    creationController.show(async (cityData) => {
      Logger.log("✅ [Main] Ciudad creada:", cityData);
      
      // Inicializar juego con la ciudad creada
      await CityBuilderInitializer.buildCity();
    });
  }
})();
