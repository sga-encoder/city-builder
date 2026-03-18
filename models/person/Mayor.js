import { Person } from "./Person.js";
export class Major extends Person { 
    constructor(id, name) {
        super(id, name);
        this.currentCity = null;
        this.cities = []
    }
}