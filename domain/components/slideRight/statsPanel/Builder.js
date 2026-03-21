export class StatsPanelBuilder {
    static build(stats, builds, icons) {
        const StatsContainer = this.#buildStatsContainer();
        StatsContainer.appendChild(this.#buildTitleElement());

        for (const subtype in stats) {
            const section = this.#createSection(subtype, stats[subtype], builds, icons);
            StatsContainer.appendChild(section);
        }
        return StatsContainer;
    }

    static #buildStatsContainer() {
        const container = document.createElement("div");
        container.id = "stats-container";
        return container;
    }

    static #buildTitleElement() {
        const title = document.createElement("h2");
        title.classList.add("stats-title");
        title.textContent = "Estadísticas de Edificios";
        return title;
    }

    static #createSection(type, data, builds, icons) {
        const section = document.createElement("div");
        section.classList.add("stats-section");
        const container = document.createElement("div");
        container.classList.add(type);
        container.classList.add("building");
        const imgContainer = document.createElement("div");
        imgContainer.classList.add("img-container");

        imgContainer.innerHTML = builds.getModel(`${type[0]}.${type[1] || ""}`)
        container.appendChild(imgContainer);
        section.appendChild(container);

        const dataContainer = document.createElement("div");
        dataContainer.classList.add("data-container");

        for (const tipo in data) {
            const tipoDiv = this.#buildTypeModule(tipo, data[tipo], icons);
            dataContainer.appendChild(tipoDiv);
        }
        section.appendChild(dataContainer);
        return section;
    }

    static #buildTypeModule(type, data, icons) {
        const container = document.createElement("div");
        container.classList.add(`${type}-container`);
        const typeP = document.createElement("p");
        typeP.textContent = `${type}`;
        container.appendChild(typeP);
        const resource = this.#buildModule({
            data,
            icons,
            className: `${type}-module`                
        });
        container.appendChild(resource);
        return container;
    }

    static #buildIconWithValue(id, icons, value, iconName = '') {
        const recursoDiv = document.createElement("div");
        recursoDiv.classList.add("icon-value-container");
        const icon = this.#buildIcon(id, icons, iconName);
        recursoDiv.appendChild(icon);
        const valueP = document.createElement("p");
        valueP.textContent = `${value}`;
        recursoDiv.appendChild(valueP);
        return recursoDiv;
    }

    static #buildIcon(id, icons, iconName = '') {
        const container = document.createElement("div");
        container.id = id;
        container.classList.add(id);
        if (id.includes(".")) {
            container.id = id.split(".")[0];
        }
        container.classList.add("icon-container");
        const imgContainer = document.createElement("div");
        imgContainer.classList.add("img-container");
        imgContainer.innerHTML = iconName === "" ? icons.getModel(id) : icons.getModel(iconName)
        container.appendChild(imgContainer);
        return container;
    }

    static #buildModule({ data, icons, className }) {
        const container = document.createElement("div");
        container.classList.add(className);
        for (const resource in data) {
            const value =   this.#buildIconWithValue(resource, icons, data[resource]);
            container.appendChild(value);
        }
        return container;
    }
}