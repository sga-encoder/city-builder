import { Person } from "./Person.js";
export class Citizen extends Person { 
    constructor(id, name) {
        super(id, name);
        this.happiness = 0;
        this.hasJob = false;
        this.job = null;
        this.hasHome = false;
        this.home = null;
    }
}