import { CityInitializer } from "./services/CityInitializer.js";

(async () => {
  await CityInitializer.buildCity();
})();
