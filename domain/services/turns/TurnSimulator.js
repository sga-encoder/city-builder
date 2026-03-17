import { Logger } from "../../utilis/Logger.js";

export class TurnSimulator {
  constructor() {
    this.phases = [];
  }

  registerPhases(phasesArray = []) {
    if (!Array.isArray(phasesArray)) {
      throw new Error("registerPhases requiere un arreglo");
    }

    this.phases = phasesArray.map((item, index) => {
      const name = String(item?.name || `Phase_${index + 1}`);
      const phase = item?.phase;
      const critical = Boolean(item?.critical);

      if (typeof phase !== "function") {
        throw new Error(`La fase ${name} no tiene callback válido`);
      }

      return { name, phase, critical };
    });

    return this.phases.length;
  }

  execute(city, turnNumber) {
    if (!city || !city.resources) {
      throw new Error("City inválida en TurnSimulator.execute");
    }

    const turnData = {
      turnNumber,
      timestamp: new Date().toISOString(),
      before: this.#snapshot(city),
      after: null,
      changes: {
        total: { money: 0, energy: 0, water: 0, food: 0 },
        errors: [],
      },
      phaseResults: [],
    };

    for (const phaseDef of this.phases) {
      try {
        const ok = phaseDef.phase(city, turnData);

        if (ok === false) {
          const errorInfo = {
            phaseName: phaseDef.name,
            critical: phaseDef.critical,
            message: "La fase retornó false",
          };

          turnData.changes.errors.push(errorInfo);
          turnData.phaseResults.push({
            phaseName: phaseDef.name,
            success: false,
            critical: phaseDef.critical,
          });

          if (phaseDef.critical) {
            Logger.error("[TurnSystem] Fase critical falló:", phaseDef.name);
            break;
          }

          Logger.warn("[TurnSystem] Fase no critical falló:", phaseDef.name);
          continue;
        }

        turnData.phaseResults.push({
          phaseName: phaseDef.name,
          success: true,
          critical: phaseDef.critical,
        });
      } catch (error) {
        const errorInfo = {
          phaseName: phaseDef.name,
          critical: phaseDef.critical,
          message: error?.message || "Error desconocido",
        };

        turnData.changes.errors.push(errorInfo);
        turnData.phaseResults.push({
          phaseName: phaseDef.name,
          success: false,
          critical: phaseDef.critical,
        });

        if (phaseDef.critical) {
          Logger.error(
            "[TurnSystem] Excepción en fase critical:",
            phaseDef.name,
            error,
          );
          break;
        }

        Logger.warn("[TurnSystem] Excepción en fase no critical:", phaseDef.name, error);
      }
    }

    turnData.after = this.#snapshot(city);
    turnData.changes.total = this.#calculateDiff(
      turnData.before.resources,
      turnData.after.resources,
    );

    return turnData;
  }

  #snapshot(city) {
    return {
      turn: Number(city.turn || 0),
      resources: {
        money: Number(city.resources?.money?.amount || 0),
        energy: Number(city.resources?.energy?.amount || 0),
        water: Number(city.resources?.water?.amount || 0),
        food: Number(city.resources?.food?.amount || 0),
      },
    };
  }

  #calculateDiff(before, after) {
    return {
      money: after.money - before.money,
      energy: after.energy - before.energy,
      water: after.water - before.water,
      food: after.food - before.food,
    };
  }
}
