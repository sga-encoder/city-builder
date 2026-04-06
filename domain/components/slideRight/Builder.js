import { Button } from "../Button.js";

export class SlideRightBuilder {
    static build(icons) {
        const containerButtonBottom = document.createElement("div");
        const sheets = document.styleSheets[2];
        containerButtonBottom.classList.add("buttons-container-bottom");
        const menuItemsBottom = ["stats", "news"];
        const container = document.createElement("div");
        container.classList.add("container");

        menuItemsBottom.forEach((id, index) => {
            container.appendChild(Button.build(id, index + 1, icons, sheets));
        });
        containerButtonBottom.appendChild(container);

        const containerButtonTop = document.createElement("div");
        containerButtonTop.classList.add("buttons-container-top");
        const menuItemsTop = ["weather.sunny"];

        menuItemsTop.forEach((id, index) => {
            containerButtonTop.appendChild(Button.build(id, index + 1, icons, sheets));
        });

        const containerButton = document.createElement("div");
        containerButton.classList.add("buttons-container");
        containerButton.appendChild(containerButtonTop);
        containerButton.appendChild(containerButtonBottom);
        return containerButton;
    }
}