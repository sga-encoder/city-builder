import { SlideLeft } from "../../../components/slideLeft/Renderer.js";
import { SlideRight } from "../../../components/slideRight/Renderer.js";
import { SlideLeftController } from "../../../controllers/slideLeft/Controller.js";

export class CityBuilderUIManager {
  static renderMenus(resources, icons, builds) {
    SlideLeft.render(resources, icons, builds);
    SlideRight.render(icons, builds);
  }

  static initMenuControllers(city, builds, icons) {
    SlideLeftController.initController(city, builds, icons);
  }
}
