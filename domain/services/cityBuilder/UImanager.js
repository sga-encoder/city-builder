import { SlideLeftMenu } from "../../components/SlideLeft.js";
import { renderSlideRightMenu } from "../../components/SlideRight.js";
import { SlideLeftController } from "../../controllers/SlideLeftController.js";

export class UIManager {
  static renderMenus(resources, icons, builds) {
    SlideLeftMenu.render(resources, icons, builds);
    renderSlideRightMenu(icons);
  }

  static initMenuControllers(city, builds, icons) {
    SlideLeftController.initSlideLeftController(city, builds, icons);
  }
}
