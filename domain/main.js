import { CityInitializer } from "./services/cityBuilder/CityInitializer.js";

(async () => {
  await CityInitializer.buildCity();
})();
