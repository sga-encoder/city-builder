import { Building } from "./Building.js";
import { ResidentialBuilding } from "./ResidentialBuilding.js";
import { CommercialBuilding } from "./CommercialBuilding.js";
import { IndustryBuilding } from "./IndustryBuilding.js";
import { ServicesBuilding } from "./ServicesBuilding.js";
import { UtilityPlants } from "./UtilityPlants.js";
import { Park } from "./Parks.js";
import { Logger } from "../../domain/utilis/Logger.js";


export const createBuilding = (dict) => {
  const { type, id } = dict;
  Logger.log("🏭 [Building] Creando edificio tipo", type, "id:", id);

  switch (type) {
    case "R":
      return new ResidentialBuilding(dict);
    case "C":
      return new CommercialBuilding(dict);
    case "I":
      return new IndustryBuilding(dict);
    case "S":
      return new ServicesBuilding(dict);
    case "U":
      return new UtilityPlants(dict);
    case "P":
      return new Park(dict);
    default:
      return new Building(dict);
  }
};
