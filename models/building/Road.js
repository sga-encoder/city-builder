 import { Building } from "./Building.js";
export class Road extends Building {
    constructor(dict) {
        const { type } = dict;
        const subtypeData = Building.getSubtypeData(type, "");
        const instance = { ...subtypeData, ...dict };
        super(instance);
    }
}