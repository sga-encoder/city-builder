import { Citizen } from "../../../models/person/Citizens.js";
import { getCityConfig } from "../../config/runtimeConfig.js";

export class CitizenManager {
  static DEFAULTS = {
    minNewCitizensPerTurn: 1,
    maxNewCitizensPerTurn: 3,
    happinessThresholdToGrow: 60,
  };

  static runTurn(city, StatsManager) {
    if (!city) return;

    this.ensureCityPopulationState(city);
    this.reconcileAssignments(city);

    this.assignHomelessCitizens(city);
    this.assignUnemployedCitizens(city);
    this.updateCitizensHappiness(city);

    const avgHappinessBeforeGrowth = this.getAverageHappiness(city.citizens);
    const shouldGrow = this.canCreateCitizens(city, avgHappinessBeforeGrowth);

    let createdThisTurn = 0;
    if (shouldGrow) {
      createdThisTurn = this.createNewCitizens(city);
      this.assignHomelessCitizens(city);
      this.assignUnemployedCitizens(city);
      this.updateCitizensHappiness(city);
    }

    this.recordPopulationStats(city, createdThisTurn, StatsManager);
  }

  static ensureCityPopulationState(city) {
    if (!Array.isArray(city.citizens)) {
      city.citizens = [];
    }

    if (!Number.isInteger(city.citizenCounter)) {
      city.citizenCounter = 0;
    }
  }

  static getPopulationConfig() {
    const config = getCityConfig()?.population || {};
    const min = Number(config.minNewCitizensPerTurn);
    const max = Number(config.maxNewCitizensPerTurn);
    const threshold = Number(config.happinessThresholdToGrow);

    const minNewCitizensPerTurn = Number.isFinite(min)
      ? Math.max(0, Math.floor(min))
      : this.DEFAULTS.minNewCitizensPerTurn;

    const maxNewCitizensPerTurn = Number.isFinite(max)
      ? Math.max(minNewCitizensPerTurn, Math.floor(max))
      : this.DEFAULTS.maxNewCitizensPerTurn;

    const happinessThresholdToGrow = Number.isFinite(threshold)
      ? Math.max(0, Math.min(100, threshold))
      : this.DEFAULTS.happinessThresholdToGrow;

    return {
      minNewCitizensPerTurn,
      maxNewCitizensPerTurn,
      happinessThresholdToGrow,
    };
  }

  static getAverageHappiness(citizens) {
    if (!Array.isArray(citizens) || citizens.length === 0) {
      return 100;
    }

    const total = citizens.reduce(
      (acc, citizen) => acc + Number(citizen?.happiness || 0),
      0,
    );

    return total / citizens.length;
  }

  static canCreateCitizens(city, avgHappiness) {
    const { happinessThresholdToGrow } = this.getPopulationConfig();

    if (avgHappiness <= happinessThresholdToGrow) {
      return false;
    }

    return (
      this.getAvailableHousingSlots(city) > 0 && this.getAvailableJobSlots(city) > 0
    );
  }

  static createNewCitizens(city) {
    const { minNewCitizensPerTurn, maxNewCitizensPerTurn } = this.getPopulationConfig();

    const availableHousing = this.getAvailableHousingSlots(city);
    const availableJobs = this.getAvailableJobSlots(city);

    const maxCreatable = Math.min(availableHousing, availableJobs);
    if (maxCreatable <= 0) return 0;

    const rolled = this.randomInt(minNewCitizensPerTurn, maxNewCitizensPerTurn);
    const toCreate = Math.max(0, Math.min(rolled, maxCreatable));

    for (let i = 0; i < toCreate; i += 1) {
      city.citizenCounter += 1;
      const id = `citizen-${city.citizenCounter}`;
      const citizen = new Citizen(id, `Ciudadano ${city.citizenCounter}`);
      city.citizens.push(citizen);
    }

    return toCreate;
  }

  static randomInt(min, max) {
    const safeMin = Math.ceil(Math.min(min, max));
    const safeMax = Math.floor(Math.max(min, max));
    return Math.floor(Math.random() * (safeMax - safeMin + 1)) + safeMin;
  }

  static getAvailableHousingSlots(city) {
    const residentialBuildings = city.getTypeBuildings("R");

    return residentialBuildings.reduce((acc, building) => {
      const capacity = Number(building?.capacity || 0);
      const occupied = Array.isArray(building?.citizens) ? building.citizens.length : 0;
      return acc + Math.max(0, capacity - occupied);
    }, 0);
  }

  static getAvailableJobSlots(city) {
    const jobBuildings = [
      ...city.getTypeBuildings("C"),
      ...city.getTypeBuildings("I"),
    ];

    return jobBuildings.reduce((acc, building) => {
      const capacity = Number(building?.capacity || 0);
      const occupied = Array.isArray(building?.citizens) ? building.citizens.length : 0;
      return acc + Math.max(0, capacity - occupied);
    }, 0);
  }

  static assignHomelessCitizens(city) {
    const homes = city.getTypeBuildings("R");
    const homeless = city.citizens.filter((citizen) => !citizen.hasHome);

    for (const citizen of homeless) {
      const home = homes.find((building) => {
        if (!Array.isArray(building.citizens)) building.citizens = [];
        return building.citizens.length < Number(building.capacity || 0);
      });

      if (!home) break;

      home.citizens.push(citizen);
      citizen.hasHome = true;
      citizen.home = home;
    }
  }

  static assignUnemployedCitizens(city) {
    const jobs = [...city.getTypeBuildings("C"), ...city.getTypeBuildings("I")];
    const unemployed = city.citizens.filter((citizen) => !citizen.hasJob);

    for (const citizen of unemployed) {
      const workplace = jobs.find((building) => {
        if (!Array.isArray(building.citizens)) building.citizens = [];
        return building.citizens.length < Number(building.capacity || 0);
      });

      if (!workplace) break;

      workplace.citizens.push(citizen);
      citizen.hasJob = true;
      citizen.job = workplace;
    }
  }

  static reconcileAssignments(city) {
    const allBuildings = new Set(city.map?.grid?.flat() || []);

    for (const citizen of city.citizens) {
      if (citizen.home && !allBuildings.has(citizen.home)) {
        citizen.home = null;
        citizen.hasHome = false;
      }

      if (citizen.job && !allBuildings.has(citizen.job)) {
        citizen.job = null;
        citizen.hasJob = false;
      }
    }

    const residential = city.getTypeBuildings("R");
    const commercial = city.getTypeBuildings("C");
    const industrial = city.getTypeBuildings("I");

    for (const building of residential) {
      if (!Array.isArray(building.citizens)) {
        building.citizens = [];
        continue;
      }

      building.citizens = building.citizens.filter(
        (citizen) => citizen?.home === building,
      );
    }

    for (const building of [...commercial, ...industrial]) {
      if (!Array.isArray(building.citizens)) {
        building.citizens = [];
        continue;
      }

      building.citizens = building.citizens.filter(
        (citizen) => citizen?.job === building,
      );
    }
  }

  static updateCitizensHappiness(city) {
    const servicesCount = city.getTypeBuildings("S").length;
    const parksCount = city.getTypeBuildings("P").length;

    for (const citizen of city.citizens) {
      let happiness = 0;

      if (citizen.hasHome) happiness += 20;
      if (citizen.hasJob) happiness += 15;

      happiness += servicesCount * 10;
      happiness += parksCount * 5;

      citizen.happiness = Math.max(0, Math.min(100, happiness));
    }
  }

  static recordPopulationStats(city, createdThisTurn, StatsManager) {
    const totalCitizens = city.citizens.length;
    const employed = city.citizens.filter((citizen) => citizen.hasJob).length;
    const unemployed = totalCitizens - employed;
    const avgHappiness = this.getAverageHappiness(city.citizens);

    StatsManager.reset("POP");
    StatsManager.addStats("POP", {
      poblacion: {
        total: totalCitizens,
        nuevos: createdThisTurn,
      },
      empleo: {
        empleados: employed,
        desempleados: unemployed,
      },
      felicidad: {
        promedio: Number(avgHappiness.toFixed(2)),
      },
    });
  }
}
