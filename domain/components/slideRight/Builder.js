import { Button } from "../Button.js";

export class SlideRightBuilder {
    static build(icons) {
        const containerButton = document.createElement("div");
        const sheets = document.styleSheets[2];
        containerButton.classList.add("buttons-container");
        const menuItems = ["stats", "weather.sunny", "news"];

        menuItems.forEach((id, index) => {
            containerButton.appendChild(Button.build(id, index + 1, icons, sheets));
        });

        return containerButton;
    }
}