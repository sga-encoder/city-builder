import { SlideLeft } from "../../components/slideLeft/SlideLeft.js";
import { SlideRight } from "../../components/SlideRight.js";
import { SlideLeftController } from "../../controllers/SlideLeftController.js";

export class UIManager {
  static renderMenus(resources, icons, builds) {
    SlideLeft.render(resources, icons, builds);
    SlideRight.render(icons);
  }

  static initMenuControllers(city, builds, icons) {
    SlideLeftController.initSlideLeftController(city, builds, icons);
  }
}
