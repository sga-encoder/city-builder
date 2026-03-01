const fs = require("fs");

// Leer el archivo original
const content = fs.readFileSync(
  "c:\\Users\\ASUS\\code\\city_builder\\public\\themes\\default\\svg\\apartaments_land.svg",
  "utf-8",
);

// Extraer todos los paths
const paths = content.match(/<path[^>]*>/g);

// Colores para identificar elementos
const WINDOW_BG = "#D9D9D9";
const DOOR_BG = "#7B4C00";
const PLANTER_COLORS = [
  "#676767",
  "#A6A6A6",
  "#3B3B3B",
  "#B44C01",
  "#843700",
  "#B66100",
];
const TREE_COLORS = ["#2E6820", "#309C15", "#28C900"];
const FLOWER_COLORS = [
  "#F400FF",
  "#830789",
  "#BF00C8",
  "#FFF700",
  "#C2B202",
  "#CFC909",
];
const FRAME_COLORS = [
  "#804400",
  "#B66100",
  "#432606",
  "#A6A6A6",
  "#676767",
  "#3B3B3B",
];

let output = `<svg width="1000" height="1000" viewBox="0 0 1000 1000" fill="none" xmlns="http://www.w3.org/2000/svg" id="apartaments_land">
    <g id="ground">
        <path id="ground-top" d="M1000 650L500 900L0 650L500 400L1000 650Z" fill="#333333"/>
        <path id="ground-right" d="M500 900V1000L0 750V650L500 900Z" fill="black"/>
        <path id="ground-left" d="M500 900V1000L1000 750V650L500 900Z" fill="#555555"/>
    </g>
    <g id="base">
        <path id="base-left" d="M750 714V432L372 243V525.5L750 714Z" fill="#CA2B2B"/>
        <path id="base-right" d="M750 432L876 369V651L750 714V432Z" fill="#E67070"/>
        <path id="base-top" d="M876 369L750 432L372 243L498 180L876 369Z" fill="#F04949"/>
    </g>\n`;

// Identificar ventanas
let windowCount = 0;
let doorCount = 0;
let currentGroup = [];
let inWindow = false;
let inDoor = false;

const stripIds = (pathTag) => pathTag.replace(/\s+id="[^"]*"/g, "");

for (let i = 0; i < paths.length; i++) {
  const path = paths[i];

  // Detectar inicio de ventana
  if (path.includes(WINDOW_BG)) {
    windowCount++;
    currentGroup = [stripIds(path)];
    inWindow = true;

    // Recoger todos los paths relacionados con esta ventana
    for (let j = i + 1; j < paths.length; j++) {
      const nextPath = paths[j];
      if (nextPath.includes(WINDOW_BG)) break; // Nueva ventana
      if (nextPath.includes(DOOR_BG)) break; // Puerta
      currentGroup.push(stripIds(nextPath));
    }

    // Generar grupo de ventana
    const windowId = String(windowCount).padStart(2, "0");
    output += `    <g id="window-${windowId}">\n`;
    output += `        ${currentGroup[0].replace("<path", '<path id="window-background"')}\n`;
    output += `        <g id="window-frame-${windowId}">\n`;

    for (let k = 1; k < currentGroup.length; k++) {
      const p = currentGroup[k];
      const id = `window-${windowId}-path-${String(k).padStart(2, "0")}`;
      output += `            ${p.replace("<path", `<path id="${id}"`)}\n`;
    }

    output += `        </g>\n`;
    output += `    </g>\n`;

    i += currentGroup.length - 1;
  }
  // Detectar puertas
  else if (path.includes(DOOR_BG)) {
    doorCount++;
    currentGroup = [stripIds(path)];

    // Recoger paths de la puerta
    for (let j = i + 1; j < paths.length; j++) {
      const nextPath = paths[j];
      if (nextPath.includes(WINDOW_BG)) break;
      if (nextPath.includes(DOOR_BG)) break;
      currentGroup.push(stripIds(nextPath));
    }
    const doorId = String(doorCount).padStart(2, "0");
    output += `    <g id="door-${doorId}">\n`;
    output += `        ${currentGroup[0].replace("<path", '<path id="door-body"')}\n`;
    output += `        <g id="door-frame-${doorId}">\n`;

    for (let k = 1; k < currentGroup.length; k++) {
      output += `            ${currentGroup[k].replace("<path", `<path id="door-${doorId}-path-${String(k).padStart(2, "0")}"`)}\n`;
    }

    output += `        </g>\n    </g>\n`;
    i += currentGroup.length - 1;
  }
}

output += "</svg>";

// Guardar archivo reorganizado
fs.writeFileSync(
  "c:\\Users\\ASUS\\code\\city_builder\\public\\themes\\default\\svg\\apartaments_land_new.svg",
  output,
  "utf-8",
);
console.log("Archivo reorganizado: apartaments_land_new.svg");
console.log(`Ventanas encontradas: ${windowCount}`);
console.log(`Puertas encontradas: ${doorCount}`);
